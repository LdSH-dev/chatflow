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
    await subscribeToChannel('user:connected', this.handleUserConnected.bind(this));
    await subscribeToChannel('user:disconnected', this.handleUserDisconnected.bind(this));
    
    console.log('Delivery service initialized and listening for events');
    console.log('Service instance ID:', process.env.RENDER_INSTANCE_ID || 'local');
    console.log('Service started at:', new Date().toISOString());
  }

  /**
   * Handle new message created event
   */
  async handleMessageCreated(data) {
    console.log('Processing message created event:', data);
    
    const { receiverId, messageId, senderId, content, messageType, repliedMessageId, createdAt } = data;
    
    // Implementar deduplicação para evitar processamento duplicado
    const { getClient } = require('../utils/redis');
    const redisClient = getClient();
    
    const processedKey = `processed:${messageId}`;
    const alreadyProcessed = await redisClient.get(processedKey);
    
    if (alreadyProcessed) {
      console.log(`Message ${messageId} already processed, skipping to avoid duplication`);
      return;
    }
    
    // Marcar como processado por 60 segundos
    await redisClient.set(processedKey, 'true', 'EX', 60);
    console.log(`Message ${messageId} marked as processed`);
    
    // Send message to receiver
    const receiverConnectionInfo = await getUserConnection(receiverId);
    console.log(`Receiver ${receiverId} connection info:`, receiverConnectionInfo);
    
    if (receiverConnectionInfo && receiverConnectionInfo.connected) {
      await publishEvent('websocket:message', {
        type: 'new_message',
        receiverId,
        data: {
          messageId,
          senderId,
          content,
          messageType,
          repliedMessageId,
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
    console.log(`Sender ${senderId} connection info:`, senderConnectionInfo);
    
    if (senderConnectionInfo && senderConnectionInfo.connected) {
      console.log(`Sender ${senderId} is connected, sending real-time update`);
      await publishEvent('websocket:message', {
        type: 'new_message',
        receiverId: senderId, // Send to sender
        data: {
          messageId,
          senderId,
          content,
          messageType,
          repliedMessageId,
          createdAt
        }
      });
      
      console.log(`Message ${messageId} delivered to sender ${senderId} for real-time update`);
    } else {
      console.log(`Sender ${senderId} is not connected, skipping real-time update`);
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
  async handleUserConnected(data) {
    const { userId, socketId, username, connected, connectedAt } = data;
    console.log(`User ${username} (${userId}) connected with socket ${socketId}`);
    
    // Salvar informações de conexão no Redis
    const { getClient } = require('../utils/redis');
    const redisClient = getClient();
    
    try {
      await redisClient.set(`user:${userId}:connection`, JSON.stringify({
        socketId,
        username,
        connected: true,
        connectedAt
      }), 'EX', 3600); // Expira em 1 hora
      
      console.log(`User ${userId} connection info saved to Redis`);
    } catch (error) {
      console.error('Error saving user connection to Redis:', error);
    }
  }

  /**
   * Handle user disconnection event
   */
  async handleUserDisconnected(data) {
    const { userId, socketId, username, connected, disconnectedAt } = data;
    console.log(`User ${username} (${userId}) disconnected from socket ${socketId}`);
    
    // Remover informações de conexão do Redis
    const { getClient } = require('../utils/redis');
    const redisClient = getClient();
    
    try {
      await redisClient.del(`user:${userId}:connection`);
      console.log(`User ${userId} connection info removed from Redis`);
    } catch (error) {
      console.error('Error removing user connection from Redis:', error);
    }
  }
}

module.exports = DeliveryService;