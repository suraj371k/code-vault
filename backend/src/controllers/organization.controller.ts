import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const generateSlug = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export const generateUniqueSlug = async (name: string): Promise<string> => {
  const baseSlug = generateSlug(name);
  const existing = await prisma.organization.findUnique({
    where: { slug: baseSlug },
  });

  if (!existing) return baseSlug;

  const similar = await prisma.organization.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
    },
    select: { slug: true },
  });

  const suffixes = similar.map((org) => {
    const match = org.slug?.match(new RegExp(`^${baseSlug}-(\\d+)$`));
    return match ? parseInt(match[1]) : 0;
  });

  const nextSuffix = suffixes.length > 0 ? Math.max(...suffixes) + 1 : 1;

  return `${baseSlug}-${nextSuffix}`;
};

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const userId = (req as any).user.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Organization name required",
      });
    }
    const slug = await generateUniqueSlug(name.trim());

    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
      include: {
        members: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: organization,
    });
  } catch (error) {
    console.log(`error in create organization controller: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const addMembers = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const organizationId = Number(req.params.organizationId);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingMember = await prisma.membership.findFirst({
      where: {
        userId: user.id,
        organizationId,
      },
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "User already in organization",
      });
    }

    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId,
        role: "MEMBER",
      },
    });

    return res.status(201).json({
      success: true,
      message: "User added to organization",
      data: membership,
    });
  } catch (error) {
    console.log(`error in add member controller: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    const organizationId = Number(req.params.organizationId);

    if (!organizationId) {
      return res
        .status(404)
        .json({ sucucess: false, message: "organization not found" });
    }

    const members = await prisma.membership.findMany({
      where: {
        organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          }
        }
      },
    });

    const totalMembers = await prisma.membership.count({where: {organizationId}});

    return res.status(200).json({
      success: true,
      message: "members fetched successfully",
      total: totalMembers,
      data: members,
    });
  } catch (error) {
    console.error(`error on get members controller: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getOrganizationBySlug = async (req: Request, res: Response) => {
  try {
    const slug = Array.isArray(req.params.slug)
      ? req.params.slug[0]
      : req.params.slug;

    const userId = (req as any).user.userId;

    const organization = await prisma.organization.findUnique({
      where: { slug },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const isMember = organization.members.some((m) => m.userId === userId);

    if (!isMember) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.status(200).json({
      success: true,
      message: "Organization fetched successfully",
      data: organization,
    });
  } catch (error) {
    console.log(`error in get organization by slug ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getMyOrganizations = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const organizations = memberships.map((m) => ({
      ...m.organization,
      role: m.role,
    }));

    return res.status(200).json({
      success: true,
      message: "organizations fetched successfully",
      data: organizations,
    });
  } catch (error) {
    console.error(`error in get all organization controller: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const organizationId = Number(req.params.organizationId);
    const userId = (req as any).user.userId;

    const membership = await prisma.membership.findFirst({
      where: { organizationId, userId, role: "OWNER" },
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await prisma.organization.delete({
      where: {
        id: organizationId,
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "organization deleted successfully" });
  } catch (error) {
    console.error(`error in deleting organization ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// remove member from organization
export const removeMember = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const removerId = Number(req.params.removerId);

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    await prisma.membership.delete({
      where: { id: removerId },
    });

    return res
      .status(200)
      .json({ success: true, message: "member removed successfully" });
  } catch (error) {
    console.error(`error in removing member: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
