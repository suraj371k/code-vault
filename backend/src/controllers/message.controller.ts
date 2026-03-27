import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { getIO } from "../lib/socket.js";

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    const receiverId = Number(req.params.receiverId);

    if (!Number.isFinite(receiverId)) {
      return res
        .status(400)
        .json({ success: false, message: "Receiver ID is required" });
    }

    const senderId = Number((req as any).user.userId);

    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if (!Number.isFinite(senderId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }


    //find existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
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
          participants: {
            create: participantIds.map((id) => ({ userId: id })),
          },
        },
      });
    }


    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        conversationId: conversation.id,
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



    // emit to receiver 
    const io = getIO()
    io.to(`user: ${receiverId}`).emit('newMessage', {
      message,
      receiver
    })

    return res.status(201).json({
      success: true,
      data: {
        message,
        receiver,
      },
    });
  } catch (error) {
    console.error(`error in create message controller: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const createGroupMessage = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    const groupId = Number(req.params.groupId);

    if (!groupId) {
      return res
        .status(404)
        .json({ success: false, message: "group not found" });
    }

    const senderId = (req as any).user.userId;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        groupId,
        conversationId: group?.conversationId!,
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
  } catch (error) {
    console.error(`error in create group message controller: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const organizationId = Number(req.params.organizationId);

    const { name } = req.body;

    if (!name) {
      return res
        .status(404)
        .json({ success: false, message: "group name is required" });
    }

    // 1. create conversation first
    const conversation = await prisma.conversation.create({
      data: {},
    });

    // 2. create group with conversationId
    const group = await prisma.group.create({
      data: {
        name,
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

    console.log(group)
    return res.status(201).json({
      success: true,
      message: "group created successfully",
      data: group,
    });
  } catch (error) {
    console.error(`error in group creation : ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getGroups = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const groups = await prisma.group.findMany({
      where: {
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
  } catch (error) {
    console.error(`error in get groups controller: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

//add members in a group by groupId
export const addMembersInGroup = async (req: Request, res: Response) => {
  try {


    const groupId = Number(req.params.groupId)

    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({ success: false, message: "user not found" })
    }

    if (!groupId) {
      return res.status(404).json({ success: false, message: "group not found" })
    }

    const existingMember = await prisma.groupMember.findFirst({
      where: {
        userId: user.id,
        groupId
      }
    })

    if (existingMember) {
      return res.status(400).json({ success: false, message: "user already present in the group" })
    }

    const member = await prisma.groupMember.create({
      data: {
        userId: user.id,
        groupId: groupId
      }
    })

    const io = getIO();
    io.to(`user:${user.id}`).emit("addedToGroup", {
      groupId,
      message: `You were added to a group`,
    });


    return res.status(201).json({ success: true, message: "member added successfully to the group", data: member })


  } catch (error) {
    console.error(`error in adding group members ${error}`)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

//get all members of group
export const getAllGroupMembers = async (req: Request, res: Response) => {
  try {

    const groupId = Number(req.params.groupId)

    if (!groupId) {
      return res.status(404).json({ success: false, message: "group not found" })
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    const memberCount = members.length

    return res.status(200).json({
      success: true, message: "members fetched successfully",
      count: memberCount,
      data: members
    })

  } catch (error) {
    console.error(`error in getting all group members: ${error}`)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
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
              }
            }
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
  } catch (error) {
    console.error(`error in get conversations ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    const conversationId = Number(req.params.conversationId);

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        groupId: null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
};

export const getUserGroups = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const groups = await prisma.group.findMany({
      where: {
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
};

export const getGroupMessages = async (req: Request, res: Response) => {
  try {
    const groupId = Number(req.params.groupId);

    const messages = await prisma.message.findMany({
      where: {
        groupId,
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
};
