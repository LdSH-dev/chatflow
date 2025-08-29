'use client';

import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    try {
      socketRef.current = initSocket();
      
      if (onNewMessage) {
        console.log('Registering new_message event handler');
        socketRef.current.on('new_message', (data) => {
          console.log('Received new_message event:', data);
          onNewMessage(data);
        });
      }
      
      if (onUserStatus) {
        console.log('Registering user_status event handler');
        socketRef.current.on('user_status', onUserStatus);
      }
      
      if (onUserTyping) {
        console.log('Registering user_typing event handler');
        socketRef.current.on('user_typing', onUserTyping);
      }
      
      if (onMessageStatus) {
        console.log('Registering message_status event handler');
        socketRef.current.on('message_status', onMessageStatus);
      }

      if (onPresenceStatus) {
        console.log('Registering presence_status event handler');
        socketRef.current.on('presence_status', onPresenceStatus);
      }

    } catch (error) {
      console.error('Socket initialization error:', error);
    }

    return () => {
      if (socketRef.current) {
        if (onNewMessage) {
          socketRef.current.off('new_message', onNewMessage);
        }
        
        if (onUserStatus) {
          socketRef.current.off('user_status', onUserStatus);
        }
        
        if (onUserTyping) {
          socketRef.current.off('user_typing', onUserTyping);
        }
        
        if (onMessageStatus) {
          socketRef.current.off('message_status', onMessageStatus);
        }

        if (onPresenceStatus) {
          socketRef.current.off('presence_status', onPresenceStatus);
        }
      }
    };
  }, [onNewMessage, onUserStatus, onUserTyping, onMessageStatus, onPresenceStatus]);

  return {
    socket: socketRef.current,
    disconnect: disconnectSocket
  };
}