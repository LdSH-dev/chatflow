const Message = require('../models/Message');
const { emitMessageCreated, emitMessageDelivered, emitMessageRead } = require('../events/messageEvents');

/**
 * Send new message
 */
async function sendMessage(req, res) {
  try {
    const { receiverId, content, messageType = 'text', repliedMessageId } = req.body;
    const senderId = req.user.id;

    const message = new Message({
      senderId,
      receiverId,
      content,
      messageType,
      repliedMessageId
    });

    await message.save();
    await emitMessageCreated(message);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
}

/**
 * Get conversation between two users
 */
async function getConversation(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: parseInt(userId) },
        { senderId: parseInt(userId), receiverId: currentUserId }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json({
      success: true,
      data: { messages: messages.reverse() }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation'
    });
  }
}

/**
 * Mark message as delivered
 */
async function markAsDelivered(req, res) {
  try {
    const { messageId } = req.params;
    const receiverId = req.user.id;

    await Message.findByIdAndUpdate(messageId, { 
      delivered: true,
      updatedAt: new Date()
    });

    await emitMessageDelivered(messageId, receiverId);

    res.json({
      success: true,
      message: 'Message marked as delivered'
    });
  } catch (error) {
    console.error('Mark delivered error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as delivered'
    });
  }
}

/**
 * Mark message as read
 */
async function markAsRead(req, res) {
  try {
    const { messageId } = req.params;
    const receiverId = req.user.id;

    await Message.findByIdAndUpdate(messageId, { 
      read: true,
      updatedAt: new Date()
    });

    await emitMessageRead(messageId, receiverId);

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
}

module.exports = {
  sendMessage,
  getConversation,
  markAsDelivered,
  markAsRead
};