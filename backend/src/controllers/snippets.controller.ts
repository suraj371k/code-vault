import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { generateSummary } from "../services/generate-summary.js";
import { Language } from "../generated/prisma/enums.js";

// helpers
function toLanguage(raw: unknown): Language | undefined {
  if (typeof raw !== "string") return undefined;
  const upper = raw.toUpperCase();
  if (Object.values(Language).includes(upper as Language)) {
    return upper as Language;
  }
  return undefined;
}

// controllers

export const createSnippets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const organizationId = Number(req.params.organizationId);

    if (!organizationId) {
      return res
        .status(400)
        .json({ success: false, message: "organization id is required" });
    }

    if (!userId) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    const membership = await prisma.membership.findFirst({
      where: { userId, organizationId },
    });

    if (!membership) {
      return res
        .status(403)
        .json({ success: false, message: "user not in the organization" });
    }

    const { title, code, category, language } = req.body;

    if (!title || !code) {
      return res
        .status(400)
        .json({ success: false, message: "title and code are required" });
    }

    // Validate language against enum
    const parsedLanguage = toLanguage(language);
    if (language && !parsedLanguage) {
      return res.status(400).json({
        success: false,
        message: `Invalid language "${language}". Must be one of: ${Object.values(Language).join(", ")}`,
      });
    }

    const { summary, tags } = await generateSummary(
      parsedLanguage ?? null,
      code,
    );

    const snippet = await prisma.snippet.create({
      data: {
        title,
        code,
        category: category ?? null,
        language: parsedLanguage ?? null,
        summary: summary ?? [],
        tags: tags ?? [],
        created_at: new Date(),
        authorId: userId,
        organizationId,
      },
    });
    
    const members = await prisma.membership.findMany({
      where: { organizationId },
      select: { userId: true },
    });

    await prisma.notification.createMany({
      data: members
        .filter(member => member.userId !== userId)
        .map(member => ({
          userId: member.userId,
          organizationId,
          type: 'SNIPPET',
          message: `${title} snippet created`,
          snippetId: snippet.id,
        })),
    });

    return res.status(201).json({
      success: true,
      message: "snippet created successfully!",
      data: snippet,
    });
  } catch (error) {
    console.error(`error in create snippets controller: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getOrganizationSnippet = async (req: Request, res: Response) => {
  try {
    const organizationId = Number(req.params.organizationId);

    if (!organizationId) {
      return res
        .status(404)
        .json({ success: false, message: "organization not found" });
    }

    const search = (req.query.search as string | undefined)?.trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 8));
    const skip = (page - 1) * limit;
    const category = req.query.category as string | undefined;

    const baseWhere: Record<string, unknown> = { organizationId };
    if (category) {
      baseWhere.category = { equals: category, mode: "insensitive" };
    }

    // Build search OR
    let whereClause: Record<string, unknown> = baseWhere;

    if (search) {
      const langMatch = toLanguage(search);

      const orClauses: Record<string, unknown>[] = [
        { title: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { summary: { has: search } },
      ];

      if (langMatch) {
        orClauses.push({ language: { equals: langMatch } });
      }

      whereClause = {
        AND: [baseWhere, { OR: orClauses }],
      };
    }

    const [snippets, total] = await Promise.all([
      prisma.snippet.findMany({
        where: whereClause as any,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          title: true,
          language: true,
          category: true,
          summary: true,
          tags: true,
          code: true,
          isFav: true,
          created_at: true,
          author: {
            select: { id: true, name: true, email: true },
          },
          organization: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.snippet.count({ where: whereClause as any }),
    ]);

    return res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: snippets,
    });
  } catch (error) {
    console.error(`error in get organization snippet ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getSnippetById = async (req: Request, res: Response) => {
  try {
    const snippetId = Number(req.params.snippetId);

    if (!snippetId) {
      return res
        .status(404)
        .json({ success: false, message: "snippet not found" });
    }

    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      select: {
        id: true,
        title: true,
        code: true,
        language: true,
        category: true,
        summary: true,
        tags: true,
        isFav: true,
        created_at: true,
        collections: { select: { id: true, name: true } },
        author: {
          select: { id: true, name: true, email: true },
        },
        organization: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!snippet) {
      return res
        .status(404)
        .json({ success: false, message: "snippet not found" });
    }

    return res.status(200).json({ success: true, data: snippet });
  } catch (error) {
    console.error(`error in get snippet by id: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteSnippet = async (req: Request, res: Response) => {
  try {
    const snippetId = Number(req.params.snippetId);

    if (!snippetId) {
      return res
        .status(404)
        .json({ success: false, message: "snippet not found" });
    }

    await prisma.snippet.delete({ where: { id: snippetId } });

    return res
      .status(200)
      .json({ success: true, message: "snippet deleted successfully!" });
  } catch (error) {
    console.error(`error in delete snippet controller: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const updateSnippets = async (req: Request, res: Response) => {
  try {
    const snippetId = Number(req.params.snippetId);

    if (!snippetId) {
      return res
        .status(404)
        .json({ success: false, message: "snippet not found" });
    }

    const { title, code, summary, language, category, tags } = req.body;

    // Validate language if provided
    const parsedLanguage = toLanguage(language);
    if (language !== undefined && !parsedLanguage) {
      return res.status(400).json({
        success: false,
        message: `Invalid language "${language}". Must be one of: ${Object.values(Language).join(", ")}`,
      });
    }

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (code !== undefined) updates.code = code;
    if (summary !== undefined) updates.summary = summary;
    if (language !== undefined) updates.language = parsedLanguage ?? null;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags;

    const snippet = await prisma.snippet.update({
      where: { id: snippetId },
      data: updates,
    });

    return res
      .status(200)
      .json({ success: true, message: "updated successfully", data: snippet });
  } catch (error) {
    console.error(`error in update snippets: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getAllLanguages = async (_req: Request, res: Response) => {
  try {
    const languages = Object.values(Language);
    return res.status(200).json({
      success: true,
      message: "languages fetched successfully!",
      data: languages,
    });
  } catch (error) {
    console.error(`error in get all languages controller: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const createCollection = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const organizationId = Number(req.params.organizationId);

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "name is required" });
    }

    if (!organizationId) {
      return res
        .status(400)
        .json({ success: false, message: "organization not found" });
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        organizationId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "collection created successfully",
      data: collection,
    });
  } catch (error) {
    console.error(`error in creating collection:  ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const createSnippetToCollection = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = (req as any).user.userId;

    const orgId = Number(req.params.orgId);
    const colId = Number(req.params.colId);

    if (!orgId || !colId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID and Collection ID are required",
      });
    }

    const { title, code, category, language } = req.body;

    const collection = await prisma.collection.findFirst({
      where: { id: colId, organizationId: orgId },
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Collection not found in this organization",
      });
    }

    if (!title || !code) {
      return res
        .status(400)
        .json({ success: false, message: "title and code are required" });
    }

    // Validate language against enum
    const parsedLanguage = toLanguage(language);
    if (language && !parsedLanguage) {
      return res.status(400).json({
        success: false,
        message: `Invalid language "${language}". Must be one of: ${Object.values(Language).join(", ")}`,
      });
    }

    const { summary, tags } = await generateSummary(
      parsedLanguage ?? null,
      code,
    );

    const snippet = await prisma.snippet.create({
      data: {
        title,
        code,
        language,
        category,
        summary,
        tags,
        organizationId: orgId,
        authorId: userId,

        collections: {
          connect: [{ id: colId }],
        },
      },
      include: {
        collections: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "snippet created successfully!",
      data: snippet,
    });
  } catch (error) {
    console.error(`error in adding snippet to the collection: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server  error" });
  }
};

export const getCollectionSnippets = async (req: Request, res: Response) => {
  try {
    const colId = Number(req.params.colId);

    const collection = await prisma.collection.findUnique({
      where: { id: colId },
      include: {
        snippets: {
          select: {
            id: true,
            title: true,
            code: true,
            language: true,
            category: true,
            summary: true,
            tags: true,
            isFav: true,
            created_at: true,
            author: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "collection snippet fetched successfully",
      data: collection,
    });
  } catch (error) {
    console.error(`error in getting collection snippets: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const addToFav = async (req: Request, res: Response) => {
  try {
    const snippetId = Number(req.params.snippetId);

    if (!snippetId) {
      return res
        .status(400)
        .json({ success: false, message: "snippet id is required" });
    }

    // Fetch current isFav value first so we can properly toggle it
    const existing = await prisma.snippet.findUnique({
      where: { id: snippetId },
      select: { isFav: true },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Snippet not found" });
    }

    const favSnippet = await prisma.snippet.update({
      where: { id: snippetId },
      data: { isFav: !existing.isFav },
      select: {
        id: true,
        title: true,
        isFav: true,
        language: true,
        category: true,
        summary: true,
        tags: true,
        code: true,
        created_at: true,
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: favSnippet.isFav ? "Snippet added to favourites" : "Snippet removed from favourites",
      data: favSnippet,
    });
  } catch (error) {
    console.error(`error in adding in favourite ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getCollections = async (req: Request, res: Response) => {
  try {
    const organizationId = Number(req.params.organizationId);
    if (!organizationId) {
      return res.status(400).json({ success: false, message: "organization id is required" });
    }
    const collections = await prisma.collection.findMany({
      where: { organizationId },
      include: { snippets: { select: { id: true } } },
      orderBy: { created_at: "desc" },
    });
    return res.status(200).json({ success: true, data: collections });
  } catch (error) {
    console.error(`error in getCollections: ${error}`);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const addExistingSnippetToCollection = async (req: Request, res: Response) => {
  try {
    const snippetId = Number(req.params.snippetId);
    const colId = Number(req.params.colId);
    if (!snippetId || !colId) {
      return res.status(400).json({ success: false, message: "snippetId and colId are required" });
    }
    const updated = await prisma.snippet.update({
      where: { id: snippetId },
      data: { collections: { connect: { id: colId } } },
      include: { collections: { select: { id: true, name: true } } },
    });
    return res.status(200).json({ success: true, message: "Added to collection", data: updated });
  } catch (error) {
    console.error(`error in addExistingSnippetToCollection: ${error}`);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const removeFromFav = async (req: Request, res: Response) => {
  try {
    const snippetId = Number(req.params.snippetId);
    if (!snippetId) {
      return res.status(400).json({ success: false, message: "snippet id is required" });
    }
    const updated = await prisma.snippet.update({
      where: { id: snippetId },
      data: { isFav: false },
      select: {
        id: true,
        title: true,
        isFav: true,
        language: true,
        category: true,
        summary: true,
        tags: true,
        code: true,
        created_at: true,
        author: { select: { id: true, name: true, email: true } },
      },
    });
    return res.status(200).json({ success: true, message: "Removed from favourites", data: updated });
  } catch (error) {
    console.error(`error in removeFromFav: ${error}`);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getFavSnippets = async (req: Request, res: Response) => {
  try {
    const organizationId = Number(req.params.organizationId)

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    })

    if (!organization) {
      return res.status(404).json({ success: false, message: "organization not found" })
    }

    const favs = await prisma.snippet.findMany({
      where: { isFav: true, organizationId }
    })

    return res.status(200).json({ success: true, message: "favourite fetched success", data: favs })

  } catch (error) {
    console.error(`error in get fav snippets : ${error}`)
    return res.status(500).json({ success: false, message: "internal server error" })
  }
}

export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const colId = Number(req.params.colId);
    if (!colId) {
      return res.status(400).json({ success: false, message: "collection id is required" });
    }
    await prisma.collection.delete({ where: { id: colId } });
    return res.status(200).json({ success: true, message: "Collection deleted successfully" });
  } catch (error) {
    console.error(`error in deleteCollection: ${error}`);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};