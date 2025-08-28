const express = require('express');
const { sendMessage, getConversation, markAsDelivered, markAsRead } = require('../controllers/messageController');
const { authenticateToken } = require('../utils/auth');

const router = express.Router();

router.post('/send', authenticateToken, sendMessage);
router.get('/conversation/:userId', authenticateToken, getConversation);
router.put('/:messageId/delivered', authenticateToken, markAsDelivered);
router.put('/:messageId/read', authenticateToken, markAsRead);

module.exports = router;