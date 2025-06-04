const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createNotification = async (req, res) => {
  try {
    const { userId, title, message } = req.body;

    const notification = await prisma.notification.create({
      data: {
        userId: Number(userId),
        title,
        message,
        isRead: false
      }
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = Number(req.params.id);

    const notification = await prisma.notification.update({
      where: {
        id: notificationId
      },
      data: {
        isRead: true
      }
    });

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notificationId = Number(req.params.id);

    await prisma.notification.delete({
      where: {
        id: notificationId
      }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to create notifications (used by other controllers)
const createSystemNotification = async (userId, title, message) => {
  try {
    return await prisma.notification.create({
      data: {
        userId: Number(userId),
        title,
        message,
        isRead: false
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createSystemNotification
};
