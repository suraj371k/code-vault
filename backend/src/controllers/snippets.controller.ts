import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const createSnippets = async (req: Request, res: Response) => {
  try {
    const userId = await (req as any).user.userId;

    const organizationId = Number(req.params.organizationId);

    if (!organizationId) {
      return res
        .status(404)
        .json({ success: false, message: "organization not found" });
    }

    if (!userId) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        organizationId,
      },
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
        .json({ success: false, message: "missing required fields" });
    }

    const snippet = await prisma.snippet.create({
      data: {
        title,
        code,
        category,
        language,
        summary: req.body.summary || "",
        created_at: new Date(),
        authorId: userId,
        organizationId: organizationId,
      },
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

    const search = req.query.search as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;

    const skip = (page - 1) * limit;

    const category = req.query.category as string;

    const filters: any = {
      organizationId,
    };

    if (category) {
      filters.category = category;
    }

    if (search && search.trim() !== "") {
      filters.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          summary: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          code: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          language: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [snippets, total] = await Promise.all([
      prisma.snippet.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          title: true,
          language: true,
          category: true,
          summary: true,
          code: true,
          created_at: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.snippet.count({
        where: filters,
      }),
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

    console.log(snippetId);
    if (!snippetId) {
      return res
        .status(404)
        .json({ success: false, message: "snippet with this id not found" });
    }

    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
      select: {
        id: true,
        author: true,
        organization: true,
        title: true,
        code: true,
        language: true,
        category: true,
        summary: true,
        created_at: true,
      },
    });

    return res.status(200).json({ success: true, data: snippet });
  } catch (error) {
    console.error(`error in get snippets by id ${error}`);
    return res
      .status(500)
      .json({ success: true, message: "Internal server error" });
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

    await prisma.snippet.delete({
      where: { id: snippetId },
    });

    return res
      .status(200)
      .json({ success: true, message: "snippet deleted successfully!" });
  } catch (error) {
    console.error(`error in delete snippet controller ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const updateSnippets = async (req: Request, res: Response) => {
  try {
    const snippetId = Number(req.params.snippetId);

    const { title, code, summary, language, category } = req.body;

    if (!snippetId) {
      return res
        .status(404)
        .json({ success: false, message: "snippet not found" });
    }

    const updates: Record<string, any> = {};

    if (title !== undefined) updates.title = title;
    if (code !== undefined) updates.code = code;
    if (summary !== undefined) updates.summary = summary;
    if (language !== undefined) updates.language = language;
    if (category !== undefined) updates.category = category;

    const snippet = await prisma.snippet.update({
      where: { id: snippetId },
      data: updates,
    });

    return res
      .status(200)
      .json({ success: true, message: "update successfully", data: snippet });
  } catch (error) {
    console.error(`error in update snippets ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
