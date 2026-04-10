import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const organizationId = Number(req.params.organizationId);
    const userId = (req as any).user.userId;

    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      return res
        .status(404)
        .json({ success: false, message: "organization not found" });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 8));
    let skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        where: {
          organizationId,
          userId,
        },
        select: {
          id: true,
          type: true,
          message: true,
          isRead: true,
          organizationId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),

      prisma.notification.count({
        where: {
          organizationId,
          userId,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "notification fetched successfully",
      page,
      limit,
      total,
      data: notifications,
    });
  } catch (error) {
    console.error(`error in getting notifications: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const organizationId = Number(req.params.organizationId);
    const notificationId = Number(req.params.notificationId);

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
        organizationId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or not authorized",
      });
    }

    await prisma.notification.delete({
      where: {
        id: notificationId,
        organizationId,
        userId,
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "notification deleted successfully" });
  } catch (error) {
    console.error(`error in deleting notification: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const markRead = async (req: Request, res: Response) => {
  try {
    const notificationId = Number(req.params.notificationId);
    const organizationId = Number(req.params.organizationId);
    const userId = (req as any).user.userId;

    console.log({
      notificationId,
      organizationId,
      userId,
    });

    const result = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        organizationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });

    if (result.count === 0) {
      return res
        .status(404)
        .json({ success: false, message: "notification not found" });
    }

    const updatedNotification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        organizationId,
        userId,
      },
      select: {
        id: true,
        message: true,
        isRead: true,
        organizationId: true,
      },
    });

    return res
      .status(200)
      .json({
        success: true,
        message: "mark as read successfully",
        data: updatedNotification,
      });
  } catch (error) {
    console.error(`error in markRead controller: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
