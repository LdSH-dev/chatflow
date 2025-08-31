import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './auth';

let socket: Socket | null = null;

/**
 * Initialize socket connection
 */
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

export function initSocket(): Socket {
  if (!socket) {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
          socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:4000', {
        auth: { token },
        transports: ['websocket', 'polling'], // Adicionar polling como fallback
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        forceNew: false,
        upgrade: true,
        rememberUpgrade: false
      });
    
    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      console.log('Connection ID:', socket.id);
      console.log('Transport:', socket.io.engine.transport.name);
      reconnectAttempts = 0;
      
      // Log quando o transport é atualizado
      socket.io.engine.on('upgrade', () => {
        console.log('🔄 Transport upgraded to:', socket.io.engine.transport.name);
      });
    });
    
    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket server:', reason);
      
      // Tentar reconectar automaticamente se não foi desconexão manual
      if (reason !== 'io client disconnect' && reconnectAttempts < maxReconnectAttempts) {
        console.log(`🔄 Attempting to reconnect... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
        reconnectAttempts++;
        
        setTimeout(() => {
          if (socket && !socket.connected) {
            socket.connect();
          }
        }, 1000 * reconnectAttempts);
      }
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      
      // Tentar reconectar em caso de erro
      if (reconnectAttempts < maxReconnectAttempts) {
        console.log(`🔄 Attempting to reconnect after error... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
        reconnectAttempts++;
        
        setTimeout(() => {
          if (socket && !socket.connected) {
            socket.connect();
          }
        }, 1000 * reconnectAttempts);
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('✅ Reconnected to WebSocket server after', attemptNumber, 'attempts');
      reconnectAttempts = 0;
    });

    socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection failed:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect after', maxReconnectAttempts, 'attempts');
    });

    // Add debug listeners for status events
    socket.on('user_status', (data) => {
      console.log('📡 Received user_status event:', data);
    });

    socket.on('presence_status', (data) => {
      console.log('📡 Received presence_status event:', data);
    });

    // Ping/pong para manter conexão viva
    socket.on('ping', () => {
      console.log('🏓 Received ping from server');
    });

    socket.on('pong', (latency) => {
      console.log('🏓 Pong - latency:', latency, 'ms');
    });
  }
  
  return socket;
}

/**
 * Get current socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Send message via socket
 */
export function sendMessage(receiverId: number, content: string, messageType: string = 'text', repliedMessageId?: string): void {
  if (socket) {
    socket.emit('send_message', {
      receiverId,
      content,
      messageType,
      repliedMessageId
    });
  }
}

/**
 * Mark message as delivered
 */
export function markMessageDelivered(messageId: string): void {
  if (socket) {
    socket.emit('message_delivered', { messageId });
  }
}

/**
 * Mark message as read
 */
export function markMessageRead(messageId: string): void {
  if (socket) {
    socket.emit('message_read', { messageId });
  }
}

/**
 * Start typing indicator
 */
export function startTyping(receiverId: number): void {
  if (socket) {
    socket.emit('typing_start', { receiverId });
  }
}

/**
 * Stop typing indicator
 */
export function stopTyping(receiverId: number): void {
  if (socket) {
    socket.emit('typing_stop', { receiverId });
  }
}

/**
 * Request user presence status
 */
export function requestPresence(userId: number): void {
  if (socket) {
    socket.emit('request_presence', { userId });
  }
}