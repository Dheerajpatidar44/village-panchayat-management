import prisma from '../lib/prisma.js';

// GET /api/notifications
// Fetch recent notifications for the logged-in user
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' },
      take: 20, // Limit to last 20 for performance
    });

    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/:id/read
// Mark a specific notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // First check if it belongs to user
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return res.status(404).json({ detail: 'Notification not found' });
    if (notification.user_id !== req.user.id) return res.status(403).json({ detail: 'Unauthorized' });

    const updated = await prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// POST /api/notifications/mark-all-read
// Mark all notifications for the user as read
export const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { 
        user_id: req.user.id,
        is_read: false
      },
      data: { is_read: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// Internal utility function to create a notification (not a route handler)
export const createNotification = async (userId, title, message, type = 'info') => {
  try {
    return await prisma.notification.create({
      data: {
        user_id: userId,
        title,
        message,
        type,
      }
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};
