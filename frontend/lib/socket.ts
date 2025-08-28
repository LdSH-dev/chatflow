import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './auth';

let socket: Socket | null = null;

/**
 * Initialize socket connection
 */
export function initSocket(): Socket {
  if (!socket) {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:4000', {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });
    
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
    
    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Add debug listeners for status events
    socket.on('user_status', (data) => {
      console.log('Received user_status event:', data);
    });

    socket.on('presence_status', (data) => {
      console.log('Received presence_status event:', data);
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
export function sendMessage(receiverId: number, content: string, messageType: string = 'text'): void {
  if (socket) {
    socket.emit('send_message', {
      receiverId,
      content,
      messageType
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