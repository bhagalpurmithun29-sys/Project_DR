const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllRead, deleteNotification, clearNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All notification routes are protected

router.route('/')
    .get(getNotifications)
    .delete(clearNotifications);

router.put('/read-all', markAllRead);   // must be before /:id/read

router.route('/:id')
    .put(markAsRead)
    .delete(deleteNotification);

module.exports = router;
