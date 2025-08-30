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
  const eventData = {
    messageId: message._id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    content: message.content,
    messageType: message.messageType,
    repliedMessageId: message.repliedMessageId,
    createdAt: message.createdAt
  };

  // Include media data if present
  if (message.media) {
    eventData.media = message.media;
  }

  await publishEvent(EVENTS.MESSAGE_CREATED, eventData);
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