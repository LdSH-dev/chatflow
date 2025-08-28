import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthResponse, User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const authApi = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
});

/**
 * Register new user
 */
export async function register(username: string, email: string, password: string): Promise<AuthResponse> {
  const response = await authApi.post('/register', {
    username,
    email,
    password
  });
  
  if (response.data.success) {
    setAuthToken(response.data.data.token);
  }
  
  return response.data;
}

/**
 * Login user
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await authApi.post('/login', {
    email,
    password
  });
  
  if (response.data.success) {
    setAuthToken(response.data.data.token);
  }
  
  return response.data;
}

/**
 * Get current user profile
 */
export async function getProfile(): Promise<User | null> {
  try {
    const token = getAuthToken();
    if (!token) return null;
    
    const response = await authApi.get('/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data.data.user;
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
}

/**
 * Logout user
 */
export function logout(): void {
  Cookies.remove('auth_token');
}

/**
 * Set authentication token
 */
export function setAuthToken(token: string): void {
  Cookies.set('auth_token', token, { expires: 1 });
}

/**
 * Get authentication token
 */
export function getAuthToken(): string | null {
  return Cookies.get('auth_token') || null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Get all users (excluding current user)
 */
export async function getUsers(): Promise<User[]> {
  try {
    const token = getAuthToken();
    if (!token) return [];
    
    const response = await authApi.get('/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data.data.users;
  } catch (error) {
    console.error('Get users error:', error);
    return [];
  }
}