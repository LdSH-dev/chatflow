'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types';
import { sendMessage, startTyping, stopTyping } from '@/lib/socket';

interface MessageInputProps {
  receiverId: number;
  onMessageSent?: () => void;
  replyingTo?: Message | null;
  onClearReply?: () => void;
}

export default function MessageInput({ receiverId, onMessageSent, replyingTo, onClearReply }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTyping = (value: string) => {
    setMessage(value);
    
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      startTyping(receiverId);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping(receiverId);
      }
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Send the message via WebSocket with reply data
    sendMessage(receiverId, message.trim(), 'text', replyingTo?._id);
    setMessage('');
    
    if (isTyping) {
      setIsTyping(false);
      stopTyping(receiverId);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Clear reply state
    if (onClearReply) {
      onClearReply();
    }
    
    // Don't call onMessageSent here - let WebSocket handle it
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        stopTyping(receiverId);
      }
    };
  }, [receiverId, isTyping]);

  return (
    <div className="border-t bg-white">
      {/* Reply preview */}
      {replyingTo && (
        <div className="p-3 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Replying to</div>
              <div className="text-sm text-gray-700 truncate">{replyingTo.content}</div>
            </div>
            <button
              onClick={onClearReply}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-2 p-3 sm:p-4">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder={replyingTo ? "Type your reply..." : "Type your message..."}
          className="flex-1 input-field text-sm sm:text-base"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed p-2 sm:p-3"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
}