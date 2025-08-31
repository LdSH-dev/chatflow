'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { SocketMessage, UserStatus } from '@/types';

interface UseSocketProps {
  onNewMessage?: (message: SocketMessage) => void;
  onUserStatus?: (status: UserStatus) => void;
  onUserTyping?: (data: { userId: number; username: string; typing: boolean }) => void;
  onMessageStatus?: (data: { type: 'delivered' | 'read'; messageId: string }) => void;
  onPresenceStatus?: (data: { requestId: string; userId: number; presence: any }) => void;
}

export function useSocket({
  onNewMessage,
  onUserStatus,
  onUserTyping,
  onMessageStatus,
  onPresenceStatus
}: UseSocketProps = {}) {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<UseSocketProps>({
    onNewMessage,
    onUserStatus,
    onUserTyping,
    onMessageStatus,
    onPresenceStatus
  });

  // Update handlers ref when props change
  useEffect(() => {
    handlersRef.current = {
      onNewMessage,
      onUserStatus,
      onUserTyping,
      onMessageStatus,
      onPresenceStatus
    };
  }, [onNewMessage, onUserStatus, onUserTyping, onMessageStatus, onPresenceStatus]);

  // Memoized event handlers to prevent recreation
  const handleNewMessage = useCallback((data: SocketMessage) => {
    console.log('Received new_message event:', data);
    if (handlersRef.current.onNewMessage) {
      handlersRef.current.onNewMessage(data);
    }
  }, []);

  const handleUserStatus = useCallback((status: UserStatus) => {
    console.log('Received user_status event:', status);
    if (handlersRef.current.onUserStatus) {
      handlersRef.current.onUserStatus(status);
    }
  }, []);

  const handleUserTyping = useCallback((data: { userId: number; username: string; typing: boolean }) => {
    console.log('Received user_typing event:', data);
    if (handlersRef.current.onUserTyping) {
      handlersRef.current.onUserTyping(data);
    }
  }, []);

  const handleMessageStatus = useCallback((data: { type: 'delivered' | 'read'; messageId: string }) => {
    console.log('Received message_status event:', data);
    if (handlersRef.current.onMessageStatus) {
      handlersRef.current.onMessageStatus(data);
    }
  }, []);

  const handlePresenceStatus = useCallback((data: { requestId: string; userId: number; presence: any }) => {
    console.log('Received presence_status event:', data);
    if (handlersRef.current.onPresenceStatus) {
      handlersRef.current.onPresenceStatus(data);
    }
  }, []);

  useEffect(() => {
    let socket: Socket | null = null;

    const initializeSocket = () => {
      try {
        // Get existing socket or create new one
        socket = getSocket() || initSocket();
        socketRef.current = socket;

        // Remove existing listeners to prevent duplicates
        socket.off('new_message', handleNewMessage);
        socket.off('user_status', handleUserStatus);
        socket.off('user_typing', handleUserTyping);
        socket.off('message_status', handleMessageStatus);
        socket.off('presence_status', handlePresenceStatus);

        // Add event listeners
        if (onNewMessage) {
          console.log('Registering new_message event handler');
          socket.on('new_message', handleNewMessage);
        }
        
        if (onUserStatus) {
          console.log('Registering user_status event handler');
          socket.on('user_status', handleUserStatus);
        }
        
        if (onUserTyping) {
          console.log('Registering user_typing event handler');
          socket.on('user_typing', handleUserTyping);
        }
        
        if (onMessageStatus) {
          console.log('Registering message_status event handler');
          socket.on('message_status', handleMessageStatus);
        }

        if (onPresenceStatus) {
          console.log('Registering presence_status event handler');
          socket.on('presence_status', handlePresenceStatus);
        }

      } catch (error) {
        console.error('Socket initialization error:', error);
      }
    };

    // Initialize socket
    initializeSocket();

    // Cleanup function
    return () => {
      if (socket) {
        // Remove event listeners
        socket.off('new_message', handleNewMessage);
        socket.off('user_status', handleUserStatus);
        socket.off('user_typing', handleUserTyping);
        socket.off('message_status', handleMessageStatus);
        socket.off('presence_status', handlePresenceStatus);
        
        // Don't disconnect the socket here, let it be managed globally
        socketRef.current = null;
      }
    };
  }, []); // Empty dependency array to run only once

  return {
    socket: socketRef.current,
    disconnect: disconnectSocket
  };
}