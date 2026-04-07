import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js';
import { deleteNotification, getNotifications, markRead } from '../controllers/notifications.controller.js';

const router = Router()

router.get('/:organizationId', authMiddleware, getNotifications)

router.delete('/:organizationId/:notificationId', authMiddleware, deleteNotification)

router.patch('/:organizationId/:notificationId', authMiddleware, markRead)


export default router;