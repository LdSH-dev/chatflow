'use client';

import { Message } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: enUS 
      });
    } catch {
      return 'now';
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4`}>
      <div className={`message-bubble ${isOwn ? 'message-sent' : 'message-received'} max-w-[85%] sm:max-w-[70%]`}>
        <p className="text-sm sm:text-base">{message.content}</p>
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatTime(message.createdAt)}
          </span>
          {isOwn && (
            <div className="flex space-x-1 ml-2">
              {message.delivered && (
                <svg className="w-3 h-3 text-blue-100" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {message.read && (
                <svg className="w-3 h-3 text-blue-100" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}