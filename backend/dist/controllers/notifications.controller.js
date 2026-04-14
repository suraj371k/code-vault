import { prisma } from "../lib/prisma.js";
import redisClient from "../lib/redis.js";
import { invalidateNotifications } from "../lib/utils.js";
export const getNotifications = async (req, res) => {
    try {
        const organizationId = Number(req.params.organizationId);
        const userId = req.user.userId;
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
        const cacheKey = `org:${organizationId}:notifications:${userId}:${page}:${limit}`;
        const cacheData = await redisClient.get(cacheKey);
        if (cacheData) {
            return res.json(JSON.parse(cacheData));
        }
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
        const responseData = {
            success: true,
            message: "notification fetched successfully",
            page,
            limit,
            total,
            data: notifications,
        };
        // store in redis
        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: 60,
        });
        return res.json(responseData);
    }
    catch (error) {
        console.error(`error in getting notifications: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
export const deleteNotification = async (req, res) => {
    try {
        const userId = req.user.userId;
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
        await invalidateNotifications(organizationId);
        return res
            .status(200)
            .json({ success: true, message: "notification deleted successfully" });
    }
    catch (error) {
        console.error(`error in deleting notification: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
export const markRead = async (req, res) => {
    try {
        const notificationId = Number(req.params.notificationId);
        const organizationId = Number(req.params.organizationId);
        const userId = req.user.userId;
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
        await invalidateNotifications(organizationId);
        return res.status(200).json({
            success: true,
            message: "mark as read successfully",
            data: updatedNotification,
        });
    }
    catch (error) {
        console.error(`error in markRead controller: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
