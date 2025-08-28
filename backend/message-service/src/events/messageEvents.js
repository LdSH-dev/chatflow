const { publishEvent } = require('../utils/redis');

const EVENTS = {
  MESSAGE_CREATED: 'message:created',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_READ: 'message:read'
};

/**
 * Emit message created event
 */
async function emitMessageCreated(message) {
  await publishEvent(EVENTS.MESSAGE_CREATED, {
    messageId: message._id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    content: message.content,
    messageType: message.messageType,
    createdAt: message.createdAt
  });
}

/**
 * Emit message delivered event
 */
async function emitMessageDelivered(messageId, receiverId) {
  await publishEvent(EVENTS.MESSAGE_DELIVERED, {
    messageId,
    receiverId,
    deliveredAt: new Date()
  });
}

/**
 * Emit message read event
 */
async function emitMessageRead(messageId, receiverId) {
  await publishEvent(EVENTS.MESSAGE_READ, {
    messageId,
    receiverId,
    readAt: new Date()
  });
}

module.exports = {
  EVENTS,
  emitMessageCreated,
  emitMessageDelivered,
  emitMessageRead
};