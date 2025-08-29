'use client';

import { useState, useRef, useEffect } from 'react';
import { sendMessage, startTyping, stopTyping } from '@/lib/socket';

interface MessageInputProps {
  receiverId: number;
  onMessageSent?: () => void;
}

export default function MessageInput({ receiverId, onMessageSent }: MessageInputProps) {
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
    
    // Only send the message via WebSocket - don't add locally
    sendMessage(receiverId, message.trim());
    setMessage('');
    
    if (isTyping) {
      setIsTyping(false);
      stopTyping(receiverId);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
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
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 p-3 sm:p-4 border-t bg-white">
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => handleTyping(e.target.value)}
        placeholder="Type your message..."
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
  );
}