import { prisma } from "../lib/prisma.js";
import { generateSlug, invalidateNotifications } from "../lib/utils.js";
import { PLAN_LIMITS } from "../config/planLimits.js";
export const generateUniqueSlug = async (name) => {
    const baseSlug = generateSlug(name);
    const existing = await prisma.organization.findUnique({
        where: { slug: baseSlug },
    });
    if (!existing)
        return baseSlug;
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
export const createOrganization = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.userId;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Organization name required",
            });
        }
        const slug = await generateUniqueSlug(name.trim());
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                memberships: {
                    include: {
                        organization: true,
                    },
                },
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const currentOrgCount = user.memberships.length;
        const newOrgPlan = "FREE";
        const limit = PLAN_LIMITS[newOrgPlan].organizations;
        if (currentOrgCount >= limit) {
            return res.status(403).json({
                success: false,
                message: `You have reached the limit of ${limit}  on the FREE plan. Upgrade an existing organization or contact support.`,
                currentCount: currentOrgCount,
                limit,
            });
        }
        // Create organization with FREE plan
        const organization = await prisma.organization.create({
            data: {
                name,
                slug,
                plan: "FREE",
                subscriptionStatus: "ACTIVE", // Free plan is always active
                members: {
                    create: {
                        userId,
                        role: "OWNER",
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        return res.status(201).json({
            success: true,
            message: "Organization created successfully",
            data: {
                ...organization,
                limits: PLAN_LIMITS[organization.plan],
            },
        });
    }
    catch (error) {
        console.error(`Error in createOrganization: ${error}`);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
export const addMembers = async (req, res) => {
    try {
        const { email } = req.body;
        const requesterId = req.user.userId;
        const organizationId = Number(req.params.organizationId);
        // Validate input
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }
        // Get organization with its plan
        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: {
                id: true,
                plan: true,
                name: true,
            },
        });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found",
            });
        }
        // Check if requester is an OWNER of the organization
        const requesterMembership = await prisma.membership.findFirst({
            where: {
                organizationId,
                userId: requesterId,
                role: "OWNER",
            },
        });
        if (!requesterMembership) {
            return res.status(403).json({
                success: false,
                message: "Only organization owners can invite members",
            });
        }
        // Find user by email
        const userToAdd = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
        if (!userToAdd) {
            return res.status(404).json({
                success: false,
                message: "User not found with this email",
            });
        }
        // Check if user is already a member
        const existingMember = await prisma.membership.findFirst({
            where: {
                userId: userToAdd.id,
                organizationId,
            },
        });
        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: "User is already a member of this organization",
            });
        }
        const planLimits = PLAN_LIMITS[organization.plan];
        const memberLimit = planLimits.membersPerOrg;
        if (memberLimit !== Infinity) {
            const currentMemberCount = await prisma.membership.count({
                where: { organizationId },
            });
            if (currentMemberCount >= memberLimit) {
                return res.status(403).json({
                    success: false,
                    message: `Your ${organization.plan} plan allows only ${memberLimit} member${memberLimit === 1 ? "" : "s"} per organization. Upgrade to add more.`,
                    currentCount: currentMemberCount,
                    limit: memberLimit,
                });
            }
        }
        // Add user to organization
        const membership = await prisma.membership.create({
            data: {
                userId: userToAdd.id,
                organizationId,
                role: "MEMBER",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        const currentMembers = await prisma.membership.findMany({
            where: {
                organizationId,
                NOT: {
                    userId: {
                        in: [requesterId, userToAdd.id],
                    },
                },
            },
            select: {
                userId: true,
            },
        });
        if (currentMembers.length > 0) {
            await prisma.notification.createMany({
                data: currentMembers.map((member) => ({
                    userId: member.userId,
                    organizationId,
                    type: "NEW_MEMBER",
                    message: `${userToAdd.name} joined the organization`,
                    isRead: false,
                })),
            });
        }
        await prisma.notification.create({
            data: {
                userId: userToAdd.id,
                organizationId,
                type: "NEW_MEMBER",
                message: `You joined ${organization.name}`,
                isRead: false,
            },
        });
        await invalidateNotifications(organizationId);
        return res.status(201).json({
            success: true,
            message: "User added to organization successfully",
            data: {
                membership,
                organization: {
                    id: organization.id,
                    name: organization.name,
                    plan: organization.plan,
                },
            },
        });
    }
    catch (error) {
        console.error(`Error in addMembers controller: ${error}`);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
export const getMembers = async (req, res) => {
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
                    },
                },
            },
        });
        const totalMembers = await prisma.membership.count({
            where: { organizationId },
        });
        return res.status(200).json({
            success: true,
            message: "members fetched successfully",
            total: totalMembers,
            data: members,
        });
    }
    catch (error) {
        console.error(`error on get members controller: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
export const getOrganizationBySlug = async (req, res) => {
    try {
        const slug = Array.isArray(req.params.slug)
            ? req.params.slug[0]
            : req.params.slug;
        const userId = req.user.userId;
        const organization = await prisma.organization.findFirst({
            where: {
                slug,
                members: {
                    some: {
                        userId,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                slug: true,
                createdAt: true,
            },
        });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Organization fetched successfully",
            data: organization,
        });
    }
    catch (error) {
        console.log(`error in get organization by slug ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
export const getMyOrganizations = async (req, res) => {
    const userId = req.user.userId;
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
    }
    catch (error) {
        console.error(`error in get all organization controller: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
export const deleteOrganization = async (req, res) => {
    try {
        const organizationId = Number(req.params.organizationId);
        const userId = req.user.userId;
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
    }
    catch (error) {
        console.error(`error in deleting organization ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
// remove member from organization
export const removeMember = async (req, res) => {
    try {
        const requesterId = Number(req.user.userId);
        const organizationId = Number(req.params.organizationId);
        const memberId = Number(req.params.memberId);
        if (!organizationId || !memberId) {
            return res.status(400).json({
                success: false,
                message: "Invalid organization or member id",
            });
        }
        const ownerMembership = await prisma.membership.findFirst({
            where: {
                organizationId,
                userId: requesterId,
                role: "OWNER",
            },
        });
        if (!ownerMembership) {
            return res.status(403).json({
                success: false,
                message: "Only organization owners can remove members",
            });
        }
        const membership = await prisma.membership.findFirst({
            where: {
                id: memberId,
                organizationId,
            },
        });
        if (!membership) {
            return res.status(404).json({
                success: false,
                message: "Member not found in this organization",
            });
        }
        if (membership.role === "OWNER") {
            return res.status(400).json({
                success: false,
                message: "Owner cannot be removed",
            });
        }
        if (membership.userId === requesterId) {
            return res.status(400).json({
                success: false,
                message: "You cannot remove yourself",
            });
        }
        await prisma.membership.delete({
            where: { id: memberId },
        });
        return res.status(200).json({
            success: true,
            message: "Member removed successfully",
            data: {
                memberId,
                userId: membership.userId,
            },
        });
    }
    catch (error) {
        console.error(`error in removing member: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
// get online status of organization members
export const getOnlineStatus = async (req, res) => {
    try {
        const organizationId = Number(req.params.organizationId);
        const userId = req.user.userId;
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Invalid organization id",
            });
        }
        // Verify user is in organization
        const membership = await prisma.membership.findFirst({
            where: { userId, organizationId },
        });
        if (!membership) {
            return res.status(403).json({
                success: false,
                message: "Not a member of this organization",
            });
        }
        // Get all members with their online status
        const members = await prisma.user.findMany({
            where: {
                memberships: {
                    some: { organizationId },
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                isOnline: true,
                lastSeenAt: true,
            },
        });
        return res.status(200).json({
            success: true,
            data: members,
        });
    }
    catch (error) {
        console.error(`error in getting online status: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
