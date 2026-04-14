import { prisma } from "../lib/prisma.js";
import { getIO } from "../lib/socket.js";
const parseParamInt = (value) => Number(Array.isArray(value) ? value[0] : value);
const getAuthUserId = (req) => Number(req.user?.userId);
const isUserInOrganization = async (userId, organizationId) => {
    const membership = await prisma.membership.findFirst({
        where: { userId, organizationId },
        select: { userId: true },
    });
    return !!membership;
};
export const createMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const receiverId = parseParamInt(req.params.receiverId);
        const organizationId = parseParamInt(req.params.organizationId);
        const senderId = getAuthUserId(req);
        if (!Number.isFinite(receiverId)) {
            return res
                .status(400)
                .json({ success: false, message: "Receiver ID is required" });
        }
        if (!Number.isFinite(organizationId)) {
            return res
                .status(400)
                .json({ success: false, message: "Organization ID is required" });
        }
        if (!content || typeof content !== "string" || !content.trim()) {
            return res
                .status(400)
                .json({ success: false, message: "Missing required fields" });
        }
        if (!Number.isFinite(senderId)) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        if (senderId === receiverId) {
            return res
                .status(400)
                .json({ success: false, message: "Cannot message yourself" });
        }
        const [senderInOrg, receiverInOrg] = await Promise.all([
            isUserInOrganization(senderId, organizationId),
            isUserInOrganization(receiverId, organizationId),
        ]);
        if (!senderInOrg || !receiverInOrg) {
            return res.status(403).json({
                success: false,
                message: "Both users must belong to this organization",
            });
        }
        // find existing conversation in this organization
        let conversation = await prisma.conversation.findFirst({
            where: {
                organizationId,
                AND: [
                    {
                        participants: {
                            some: { userId: senderId },
                        },
                    },
                    {
                        participants: {
                            some: { userId: receiverId },
                        },
                    },
                ],
            },
        });
        if (!conversation) {
            const participantIds = Array.from(new Set([senderId, receiverId]));
            conversation = await prisma.conversation.create({
                data: {
                    organizationId,
                    participants: {
                        create: participantIds.map((id) => ({ userId: id })),
                    },
                },
            });
        }
        const message = await prisma.message.create({
            data: {
                content: content.trim(),
                senderId,
                conversationId: conversation.id,
                organizationId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found",
            });
        }
        const io = getIO();
        io.to(`conversation:${conversation.id}`).emit("newMessage", message);
        return res.status(201).json({
            success: true,
            data: {
                message,
                receiver,
            },
        });
    }
    catch (error) {
        console.error(`error in create message controller: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
export const createGroupMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const groupId = parseParamInt(req.params.groupId);
        const organizationId = parseParamInt(req.params.organizationId);
        const senderId = getAuthUserId(req);
        if (!Number.isFinite(groupId) || !Number.isFinite(organizationId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid group or organization id" });
        }
        if (!content || typeof content !== "string" || !content.trim()) {
            return res
                .status(400)
                .json({ success: false, message: "Message content is required" });
        }
        const group = await prisma.group.findFirst({
            where: { id: groupId, organizationId },
            select: { id: true, conversationId: true },
        });
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found in this organization",
            });
        }
        const [orgMember, groupMember] = await Promise.all([
            prisma.membership.findFirst({
                where: {
                    userId: senderId,
                    organizationId,
                },
                select: { userId: true },
            }),
            prisma.groupMember.findFirst({
                where: {
                    groupId,
                    userId: senderId,
                },
                select: { userId: true },
            }),
        ]);
        if (!orgMember || !groupMember) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to send messages in this group",
            });
        }
        if (!group.conversationId) {
            return res.status(500).json({
                success: false,
                message: "Group conversation is not configured",
            });
        }
        const message = await prisma.message.create({
            data: {
                content: content.trim(),
                senderId,
                groupId,
                conversationId: group.conversationId,
                organizationId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        const io = getIO();
        io.to(`group:${groupId}`).emit("newGroupMessage", {
            message,
        });
        return res.status(201).json({
            success: true,
            message: "Message sent",
            data: message,
        });
    }
    catch (error) {
        console.error(`error in create group message controller: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
export const createGroup = async (req, res) => {
    try {
        const userId = getAuthUserId(req);
        const organizationId = parseParamInt(req.params.organizationId);
        const { name } = req.body;
        if (!Number.isFinite(organizationId)) {
            return res
                .status(400)
                .json({ success: false, message: "Organization ID is required" });
        }
        if (!name || typeof name !== "string" || !name.trim()) {
            return res
                .status(400)
                .json({ success: false, message: "Group name is required" });
        }
        const member = await prisma.membership.findFirst({
            where: {
                userId,
                organizationId,
            },
            select: { userId: true },
        });
        if (!member) {
            return res.status(403).json({
                success: false,
                message: "Not authorized in this organization",
            });
        }
        // 1. create conversation first
        const conversation = await prisma.conversation.create({
            data: {
                organizationId,
            },
        });
        // 2. create group with conversationId
        const group = await prisma.group.create({
            data: {
                name: name.trim(),
                organizationId,
                conversationId: conversation.id,
                members: {
                    create: {
                        userId,
                        role: "OWNER",
                    },
                },
            },
        });
        return res.status(201).json({
            success: true,
            message: "group created successfully",
            data: group,
        });
    }
    catch (error) {
        console.error(`error in group creation : ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
export const getGroups = async (req, res) => {
    try {
        const userId = getAuthUserId(req);
        const organizationId = parseParamInt(req.params.organizationId);
        const groups = await prisma.group.findMany({
            where: {
                organizationId,
                members: {
                    some: {
                        userId,
                    },
                },
            },
        });
        return res.status(200).json({
            success: true,
            data: groups,
        });
    }
    catch (error) {
        console.error(`error in get groups controller: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
//add members in a group by groupId
export const addMembersInGroup = async (req, res) => {
    try {
        const requesterId = getAuthUserId(req);
        const groupId = parseParamInt(req.params.groupId);
        const organizationId = parseParamInt(req.params.organizationId);
        const { email } = req.body;
        if (!Number.isFinite(groupId) || !Number.isFinite(organizationId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid group or organization id" });
        }
        if (!email || typeof email !== "string") {
            return res
                .status(400)
                .json({ success: false, message: "Member email is required" });
        }
        const group = await prisma.group.findFirst({
            where: { id: groupId, organizationId },
            select: { id: true },
        });
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found in this organization",
            });
        }
        const requesterMembership = await prisma.groupMember.findFirst({
            where: { groupId, userId: requesterId },
            select: { role: true },
        });
        if (!requesterMembership || requesterMembership.role !== "OWNER") {
            return res.status(403).json({
                success: false,
                message: "Only group owner can add members",
            });
        }
        const user = await prisma.user.findUnique({
            where: { email: email.trim() },
        });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "user not found" });
        }
        const userOrgMembership = await prisma.membership.findFirst({
            where: { userId: user.id, organizationId },
            select: { userId: true },
        });
        if (!userOrgMembership) {
            return res.status(403).json({
                success: false,
                message: "User is not a member of this organization",
            });
        }
        const existingMember = await prisma.groupMember.findFirst({
            where: {
                userId: user.id,
                groupId,
            },
        });
        if (existingMember) {
            return res
                .status(400)
                .json({ success: false, message: "user already present in the group" });
        }
        const member = await prisma.groupMember.create({
            data: {
                userId: user.id,
                groupId: groupId,
            },
        });
        const io = getIO();
        io.to(`user:${user.id}`).emit("addedToGroup", {
            groupId,
            message: `You were added to a group`,
        });
        return res.status(201).json({
            success: true,
            message: "member added successfully to the group",
            data: member,
        });
    }
    catch (error) {
        console.error(`error in adding group members ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
// remove member from a group by membership (owner only)
export const removeMemberFromGroup = async (req, res) => {
    try {
        const requesterId = getAuthUserId(req);
        const groupId = parseParamInt(req.params.groupId);
        const organizationId = parseParamInt(req.params.organizationId);
        const memberUserId = parseParamInt(req.params.memberUserId);
        if (!Number.isFinite(groupId) ||
            !Number.isFinite(organizationId) ||
            !Number.isFinite(memberUserId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid group, organization, or member id",
            });
        }
        const group = await prisma.group.findFirst({
            where: { id: groupId, organizationId },
            select: { id: true },
        });
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found in this organization",
            });
        }
        const requesterMembership = await prisma.groupMember.findFirst({
            where: { groupId, userId: requesterId },
            select: { role: true },
        });
        if (!requesterMembership || requesterMembership.role !== "OWNER") {
            return res.status(403).json({
                success: false,
                message: "Only group owner can remove members",
            });
        }
        if (memberUserId === requesterId) {
            return res.status(400).json({
                success: false,
                message: "Owner cannot remove themselves from the group",
            });
        }
        const memberToRemove = await prisma.groupMember.findFirst({
            where: {
                groupId,
                userId: memberUserId,
            },
            select: { userId: true, role: true },
        });
        if (!memberToRemove) {
            return res.status(404).json({
                success: false,
                message: "Member not found in this group",
            });
        }
        if (memberToRemove.role === "OWNER") {
            return res.status(400).json({
                success: false,
                message: "Cannot remove another owner",
            });
        }
        await prisma.groupMember.delete({
            where: {
                userId_groupId: {
                    userId: memberUserId,
                    groupId,
                },
            },
        });
        return res.status(200).json({
            success: true,
            message: "Member removed from group",
            data: {
                groupId,
                userId: memberUserId,
            },
        });
    }
    catch (error) {
        console.error(`error in removing group member ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
//get all members of group
export const getAllGroupMembers = async (req, res) => {
    try {
        const requesterId = getAuthUserId(req);
        const groupId = parseParamInt(req.params.groupId);
        const organizationId = parseParamInt(req.params.organizationId);
        if (!Number.isFinite(groupId) || !Number.isFinite(organizationId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid group or organization id" });
        }
        const group = await prisma.group.findFirst({
            where: { id: groupId, organizationId },
            select: { id: true },
        });
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found in this organization",
            });
        }
        const requesterMembership = await prisma.groupMember.findFirst({
            where: { userId: requesterId, groupId },
            select: { userId: true },
        });
        if (!requesterMembership) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view group members",
            });
        }
        const members = await prisma.groupMember.findMany({
            where: { groupId },
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
        const memberCount = members.length;
        return res.status(200).json({
            success: true,
            message: "members fetched successfully",
            count: memberCount,
            data: members,
        });
    }
    catch (error) {
        console.error(`error in getting all group members: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
export const getUserConversations = async (req, res) => {
    try {
        const userId = getAuthUserId(req);
        const organizationId = parseParamInt(req.params.organizationId);
        const userInOrg = await isUserInOrganization(userId, organizationId);
        if (!userInOrg) {
            return res.status(403).json({
                success: false,
                message: "Not authorized in this organization",
            });
        }
        const conversations = await prisma.conversation.findMany({
            where: {
                organizationId,
                participants: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                participants: {
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
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
            },
        });
        return res.status(200).json({
            success: true,
            data: conversations,
        });
    }
    catch (error) {
        console.error(`error in get conversations ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
export const getConversationMessages = async (req, res) => {
    try {
        const userId = getAuthUserId(req);
        const conversationId = parseParamInt(req.params.conversationId);
        const organizationId = parseParamInt(req.params.organizationId);
        if (!Number.isFinite(conversationId) || !Number.isFinite(organizationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation or organization id",
            });
        }
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                organizationId,
                participants: { some: { userId } },
            },
            select: { id: true },
        });
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found in this organization",
            });
        }
        const messages = await prisma.message.findMany({
            where: {
                conversationId,
                groupId: null,
                organizationId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        return res.status(200).json({
            success: true,
            data: messages,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false });
    }
};
export const getUserGroups = async (req, res) => {
    try {
        const userId = getAuthUserId(req);
        const organizationId = parseParamInt(req.params.organizationId);
        const userInOrg = await isUserInOrganization(userId, organizationId);
        if (!userInOrg) {
            return res.status(403).json({
                success: false,
                message: "Not authorized in this organization",
            });
        }
        const groups = await prisma.group.findMany({
            where: {
                organizationId,
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        return res.status(200).json({
            success: true,
            data: groups,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false });
    }
};
export const getGroupMessages = async (req, res) => {
    try {
        const userId = getAuthUserId(req);
        const groupId = parseParamInt(req.params.groupId);
        const organizationId = parseParamInt(req.params.organizationId);
        if (!Number.isFinite(groupId) || !Number.isFinite(organizationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid group or organization id",
            });
        }
        const group = await prisma.group.findFirst({
            where: {
                id: groupId,
                organizationId,
                members: {
                    some: { userId },
                },
            },
            select: { id: true },
        });
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found in this organization",
            });
        }
        const messages = await prisma.message.findMany({
            where: {
                groupId,
                organizationId,
            },
            include: {
                sender: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        return res.status(200).json({
            success: true,
            data: messages,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false });
    }
};
