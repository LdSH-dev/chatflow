export interface User {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
}

export interface Message {
  _id: string;
  senderId: number;
  receiverId: number;
  content: string;
  messageType: 'text' | 'image' | 'file';
  repliedMessageId?: string;
  delivered: boolean;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface UserPresence {
  online: boolean;
  lastSeen?: string;
  connectedAt?: string;
}

export interface SocketMessage {
  messageId: string;
  senderId: number;
  content: string;
  messageType: 'text' | 'image' | 'file';
  repliedMessageId?: string;
  createdAt: string;
}

export interface UserStatus {
  userId: number;
  online: boolean;
  lastSeen?: string;
  connectedAt?: string;
}