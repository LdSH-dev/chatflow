const { 
  subscribeToChannel, 
  publishEvent, 
  setUserOnline, 
  setUserOffline,
  getUserPresence 
} = require('../utils/redis');

class PresenceService {
  constructor() {
    this.init();
  }

  /**
   * Initialize presence service event listeners
   */
  async init() {
    await subscribeToChannel('user:connected', this.handleUserConnected.bind(this));
    await subscribeToChannel('user:disconnected', this.handleUserDisconnected.bind(this));
    await subscribeToChannel('presence:status_request', this.handleStatusRequest.bind(this));
    
    console.log('Presence service initialized and listening for events');
  }

  /**
   * Handle user connected event
   */
  async handleUserConnected(data) {
    console.log('User connected:', data);
    
    const { userId, socketId } = data;
    
    try {
      const connectionInfo = await setUserOnline(userId, socketId);
      
      await publishEvent('presence:user_online', {
        userId,
        connectedAt: connectionInfo.connectedAt
      });
      
      await publishEvent('websocket:broadcast', {
        type: 'user_status',
        excludeUserId: userId,
        data: {
          userId,
          online: true,
          connectedAt: connectionInfo.connectedAt
        }
      });
      
      console.log(`User ${userId} is now online`);
    } catch (error) {
      console.error('Error handling user connected:', error);
    }
  }

  /**
   * Handle user disconnected event
   */
  async handleUserDisconnected(data) {
    console.log('User disconnected:', data);
    
    const { userId } = data;
    
    try {
      await setUserOffline(userId);
      
      await publishEvent('presence:user_offline', {
        userId,
        disconnectedAt: new Date()
      });
      
      await publishEvent('websocket:broadcast', {
        type: 'user_status',
        excludeUserId: userId,
        data: {
          userId,
          online: false,
          lastSeen: new Date()
        }
      });
      
      console.log(`User ${userId} is now offline`);
    } catch (error) {
      console.error('Error handling user disconnected:', error);
    }
  }

  /**
   * Handle presence status request
   */
  async handleStatusRequest(data) {
    console.log('Status request:', data);
    
    const { userId, requestedUserId, requestId } = data;
    
    try {
      const presence = await getUserPresence(requestedUserId);
      
      await publishEvent('websocket:message', {
        type: 'presence_response',
        receiverId: userId,
        data: {
          requestId,
          userId: requestedUserId,
          presence
        }
      });
    } catch (error) {
      console.error('Error handling status request:', error);
    }
  }
}

module.exports = PresenceService;