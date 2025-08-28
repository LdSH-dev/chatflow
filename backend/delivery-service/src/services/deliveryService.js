const { subscribeToChannel, publishEvent, getUserConnection } = require('../utils/redis');

class DeliveryService {
  constructor() {
    this.init();
  }

  /**
   * Initialize delivery service event listeners
   */
  async init() {
    await subscribeToChannel('message:created', this.handleMessageCreated.bind(this));
    await subscribeToChannel('message:delivered', this.handleMessageDelivered.bind(this));
    await subscribeToChannel('message:read', this.handleMessageRead.bind(this));
    
    console.log('Delivery service initialized and listening for events');
  }

  /**
   * Handle new message created event
   */
  async handleMessageCreated(data) {
    console.log('Processing message created event:', data);
    
    const { receiverId, messageId, senderId, content, messageType, createdAt } = data;
    
    // Send message to receiver
    const receiverConnectionInfo = await getUserConnection(receiverId);
    
    if (receiverConnectionInfo && receiverConnectionInfo.connected) {
      await publishEvent('websocket:message', {
        type: 'new_message',
        receiverId,
        data: {
          messageId,
          senderId,
          content,
          messageType,
          createdAt
        }
      });
      
      console.log(`Message ${messageId} delivered to receiver ${receiverId}`);
    } else {
      console.log(`User ${receiverId} is offline, message ${messageId} queued`);
      
      await publishEvent('message:queued', {
        messageId,
        receiverId,
        queuedAt: new Date()
      });
    }

    // Send message to sender as well (for real-time update)
    const senderConnectionInfo = await getUserConnection(senderId);
    
    if (senderConnectionInfo && senderConnectionInfo.connected) {
      await publishEvent('websocket:message', {
        type: 'new_message',
        receiverId: senderId, // Send to sender
        data: {
          messageId,
          senderId,
          content,
          messageType,
          createdAt
        }
      });
      
      console.log(`Message ${messageId} delivered to sender ${senderId} for real-time update`);
    }
  }

  /**
   * Handle message delivered event
   */
  async handleMessageDelivered(data) {
    console.log('Processing message delivered event:', data);
    
    const { messageId, receiverId } = data;
    
    await publishEvent('websocket:status', {
      type: 'message_delivered',
      data: {
        messageId,
        deliveredAt: data.deliveredAt
      }
    });
  }

  /**
   * Handle message read event
   */
  async handleMessageRead(data) {
    console.log('Processing message read event:', data);
    
    const { messageId, receiverId } = data;
    
    await publishEvent('websocket:status', {
      type: 'message_read',
      data: {
        messageId,
        readAt: data.readAt
      }
    });
  }

  /**
   * Handle user connection event
   */
  async handleUserConnected(userId) {
    console.log(`User ${userId} connected, checking for queued messages`);
    
    await publishEvent('message:check_queue', {
      userId,
      connectedAt: new Date()
    });
  }

  /**
   * Handle user disconnection event
   */
  async handleUserDisconnected(userId) {
    console.log(`User ${userId} disconnected`);
  }
}

module.exports = DeliveryService;