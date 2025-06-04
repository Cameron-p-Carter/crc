const express = require('express');
const {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} = require('../controllers/notificationController');

const router = express.Router();

// Create notification
router.post('/', createNotification);                    // POST /notifications

// Get user's notifications
router.get('/user/:userId', getUserNotifications);       // GET /notifications/user/123

// Mark notification as read
router.put('/:id/read', markNotificationAsRead);         // PUT /notifications/456/read

// Mark all notifications as read for a user
router.put('/user/:userId/read-all', markAllNotificationsAsRead); // PUT /notifications/user/123/read-all

// Delete notification
router.delete('/:id', deleteNotification);               // DELETE /notifications/456

module.exports = router;
