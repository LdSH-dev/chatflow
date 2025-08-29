'use client';

import { useState, useEffect, useRef } from 'react';
import { Message, SocketMessage, UserStatus } from '@/types';
import { getConversation } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { requestPresence } from '@/lib/socket';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  receiverId: number;
  receiverName: string;
  receiverOnline?: boolean;
}

export default function ChatWindow({ receiverId, receiverName, receiverOnline: initialOnlineStatus = false }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [receiverOnline, setReceiverOnline] = useState(initialOnlineStatus);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useAuth();

  const handleNewMessage = (socketMessage: SocketMessage) => {
    // Verifica se a mensagem é relevante para esta conversa
    const isFromReceiver = socketMessage.senderId === receiverId;
    const isFromCurrentUser = socketMessage.senderId === user?.id;
    
    if (isFromReceiver || isFromCurrentUser) {
      const newMessage: Message = {
        _id: socketMessage.messageId,
        senderId: socketMessage.senderId,
        receiverId: isFromCurrentUser ? receiverId : user?.id || 0,
        content: socketMessage.content,
        messageType: socketMessage.messageType,
        delivered: true,
        read: false,
        createdAt: socketMessage.createdAt,
        updatedAt: socketMessage.createdAt
      };
      
      console.log('Adding new message to conversation:', {
        messageId: socketMessage.messageId,
        senderId: socketMessage.senderId,
        receiverId: newMessage.receiverId,
        isFromCurrentUser,
        isFromReceiver
      });
      
      setMessages(prev => {
        // Verifica se a mensagem já existe para evitar duplicatas
        const messageExists = prev.some(msg => msg._id === socketMessage.messageId);
        if (messageExists) {
          console.log('Message already exists, skipping:', socketMessage.messageId);
          return prev;
        }
        return [...prev, newMessage];
      });
    }
  };

  const handleUserStatus = (status: UserStatus) => {
    console.log('ChatWindow received user status:', status, 'receiverId:', receiverId);
    if (status.userId === receiverId) {
      console.log('Setting receiver online status to:', status.online);
      setReceiverOnline(status.online);
    }
  };

  const handlePresenceStatus = (data: { requestId: string; userId: number; presence: any }) => {
    console.log('ChatWindow received presence status:', data, 'receiverId:', receiverId);
    if (data.userId === receiverId) {
      console.log('Setting receiver online status from presence to:', data.presence.online);
      setReceiverOnline(data.presence.online);
    }
  };

  const handleUserTyping = (data: { userId: number; username: string; typing: boolean }) => {
    if (data.userId === receiverId) {
      if (data.typing) {
        setTypingUser(data.username);
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      } else {
        setTypingUser(null);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }
  };

  useSocket({
    onNewMessage: handleNewMessage,
    onUserStatus: handleUserStatus,
    onUserTyping: handleUserTyping,
    onPresenceStatus: handlePresenceStatus
  });

  useEffect(() => {
    async function loadMessages() {
      setLoading(true);
      const conversation = await getConversation(receiverId);
      setMessages(conversation);
      setLoading(false);
    }

    if (receiverId) {
      loadMessages();
      // Request presence status for the receiver
      requestPresence(receiverId);
    }
  }, [receiverId]);

  // Update receiver online status when initial status changes
  useEffect(() => {
    setReceiverOnline(initialOnlineStatus);
  }, [initialOnlineStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Carregando conversa...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="bg-white border-b p-3 sm:p-4 flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">{receiverName}</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${receiverOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-xs sm:text-sm text-gray-500">
              {receiverOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            Nenhuma mensagem ainda. Comece uma conversa!
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.senderId === user?.id}
              />
            ))}
            
            {typingUser && (
              <div className="flex justify-start mb-4">
                <div className="message-bubble message-received">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-500">{typingUser} está digitando</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <MessageInput 
        receiverId={receiverId}
        onMessageSent={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />
    </div>
  );
}