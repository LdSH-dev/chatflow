const { Server } = require('socket.io');
const { socketAuthMiddleware } = require('../middleware/socketAuth');
const { subscribeToChannel, publishEvent } = require('../utils/redis');

class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: ["https://chatflow-tau.vercel.app", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
      }
    });
    
    this.connectedUsers = new Map();
    this.init();
  }

  /**
   * Initialize socket service
   */
  async init() {
    this.io.use(socketAuthMiddleware);
    
    this.io.on('connection', this.handleConnection.bind(this));
    
    await subscribeToChannel('websocket:message', this.handleWebSocketMessage.bind(this));
    await subscribeToChannel('websocket:broadcast', this.handleWebSocketBroadcast.bind(this));
    await subscribeToChannel('websocket:status', this.handleWebSocketStatus.bind(this));
    
    console.log('Socket service initialized');
  }

  /**
   * Handle new socket connection
   */
  async handleConnection(socket) {
    const user = socket.user;
    console.log(`User ${user.username} (${user.id}) connected`);
    
    this.connectedUsers.set(user.id, {
      socketId: socket.id,
      user: user,
      connectedAt: new Date()
    });
    
    socket.join(`user:${user.id}`);
    
    // Salvar informações de conexão no Redis
    const { publishEvent } = require('../utils/redis');
    await publishEvent('user:connected', {
      userId: user.id,
      socketId: socket.id,
      username: user.username,
      connected: true,
      connectedAt: new Date()
    });
    
    this.setupSocketHandlers(socket);
    
    socket.on('disconnect', async () => {
      console.log(`User ${user.username} (${user.id}) disconnected`);
      
      this.connectedUsers.delete(user.id);
      
      await publishEvent('user:disconnected', {
        userId: user.id,
        socketId: socket.id,
        username: user.username,
        connected: false,
        disconnectedAt: new Date()
      });
    });
  }

  /**
   * Setup socket event handlers
   */
  setupSocketHandlers(socket) {
    const user = socket.user;
    
    socket.on('send_message', async (data) => {
      console.log(`Message from ${user.username}:`, data);
      
      publishEvent('message:send', {
        senderId: user.id,
        receiverId: data.receiverId,
        content: data.content,
        messageType: data.messageType || 'text'
      });
    });
    
    socket.on('message_delivered', async (data) => {
      publishEvent('message:delivered', {
        messageId: data.messageId,
        receiverId: user.id
      });
    });
    
    socket.on('message_read', async (data) => {
      publishEvent('message:read', {
        messageId: data.messageId,
        receiverId: user.id
      });
    });
    
    socket.on('typing_start', (data) => {
      socket.to(`user:${data.receiverId}`).emit('user_typing', {
        userId: user.id,
        username: user.username,
        typing: true
      });
    });
    
    socket.on('typing_stop', (data) => {
      socket.to(`user:${data.receiverId}`).emit('user_typing', {
        userId: user.id,
        username: user.username,
        typing: false
      });
    });
    
    socket.on('request_presence', (data) => {
      publishEvent('presence:status_request', {
        userId: user.id,
        requestedUserId: data.userId,
        requestId: data.requestId || Date.now()
      });
    });
  }

  /**
   * Handle websocket message event from Redis
   */
  handleWebSocketMessage(data) {
    console.log('WebSocket message event:', data);
    
    const { type, receiverId, data: messageData } = data;
    
    if (type === 'new_message') {
      this.io.to(`user:${receiverId}`).emit('new_message', messageData);
    } else if (type === 'presence_response') {
      console.log('Sending presence response to user:', receiverId, 'data:', messageData);
      this.io.to(`user:${receiverId}`).emit('presence_status', messageData);
      console.log('Presence response sent');
    }
  }

  /**
   * Handle websocket broadcast event from Redis
   */
  handleWebSocketBroadcast(data) {
    console.log('WebSocket broadcast event:', data);
    
    const { type, excludeUserId, data: broadcastData } = data;
    
    if (type === 'user_status') {
      console.log('Broadcasting user status:', broadcastData, 'excluding user:', excludeUserId);
      if (excludeUserId) {
        this.io.except(`user:${excludeUserId}`).emit('user_status', broadcastData);
      } else {
        this.io.emit('user_status', broadcastData);
      }
      console.log('User status broadcast completed');
    }
  }

  /**
   * Handle websocket status event from Redis
   */
  handleWebSocketStatus(data) {
    console.log('WebSocket status event:', data);
    
    const { type, data: statusData } = data;
    
    if (type === 'message_delivered') {
      this.io.emit('message_status', {
        type: 'delivered',
        ...statusData
      });
    } else if (type === 'message_read') {
      this.io.emit('message_status', {
        type: 'read',
        ...statusData
      });
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Get connected users list
   */
  getConnectedUsers() {
    return Array.from(this.connectedUsers.values());
  }
}

module.exports = SocketService;