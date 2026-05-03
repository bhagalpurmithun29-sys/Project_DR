const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory, clearChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// All chat routes require authentication
router.use(protect);

// POST /api/chat/message
router.post('/message', sendMessage);

// GET /api/chat/history
router.get('/history', getChatHistory);

// DELETE /api/chat/history
router.delete('/history', clearChatHistory);

module.exports = router;
