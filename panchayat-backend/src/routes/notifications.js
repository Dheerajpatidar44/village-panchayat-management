import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationsController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', verifyToken, getNotifications);
router.put('/:id/read', verifyToken, markAsRead);
router.post('/mark-all-read', verifyToken, markAllAsRead);

export default router;
