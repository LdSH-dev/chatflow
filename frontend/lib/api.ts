import axios from 'axios';
import { getAuthToken } from './auth';
import { Message } from '@/types';

const MESSAGE_API_URL = process.env.NEXT_PUBLIC_MESSAGE_API_URL || 'http://localhost:3002';

export const messageApi = axios.create({
  baseURL: `${MESSAGE_API_URL}/api/messages`,
});

messageApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get conversation between current user and another user
 */
export async function getConversation(userId: number, page: number = 1, limit: number = 50): Promise<Message[]> {
  try {
    const response = await messageApi.get(`/conversation/${userId}`, {
      params: { page, limit }
    });
    
    return response.data.data.messages;
  } catch (error) {
    console.error('Get conversation error:', error);
    return [];
  }
}

/**
 * Send message via HTTP API
 */
export async function sendMessageHttp(receiverId: number, content: string, messageType: string = 'text'): Promise<Message | null> {
  try {
    const response = await messageApi.post('/send', {
      receiverId,
      content,
      messageType
    });
    
    return response.data.data.message;
  } catch (error) {
    console.error('Send message error:', error);
    return null;
  }
}

/**
 * Mark message as delivered via HTTP API
 */
export async function markAsDelivered(messageId: string): Promise<boolean> {
  try {
    await messageApi.put(`/${messageId}/delivered`);
    return true;
  } catch (error) {
    console.error('Mark delivered error:', error);
    return false;
  }
}

/**
 * Mark message as read via HTTP API
 */
export async function markAsRead(messageId: string): Promise<boolean> {
  try {
    await messageApi.put(`/${messageId}/read`);
    return true;
  } catch (error) {
    console.error('Mark read error:', error);
    return false;
  }
}