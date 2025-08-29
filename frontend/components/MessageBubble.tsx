'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply?: (message: Message) => void;
  repliedMessage?: Message | null;
}

export default function MessageBubble({ message, isOwn, onReply, repliedMessage }: MessageBubbleProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimeoutRef = useRef<NodeJS.Timeout>();
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const touchStartTimeRef = useRef<number>(0);

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

  const handleMouseDown = () => {
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPress(true);
      setShowContextMenu(true);
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  };

  const handleTouchStart = () => {
    touchStartTimeRef.current = Date.now();
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPress(true);
      setShowContextMenu(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowContextMenu(true);
  };

  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
    setShowContextMenu(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
      setShowContextMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 relative`}>
      <div 
        ref={messageRef}
        className={`message-bubble ${isOwn ? 'message-sent' : 'message-received'} max-w-[85%] sm:max-w-[70%] cursor-pointer select-none`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
      >
        {/* Reply preview */}
        {message.repliedMessageId && (
          <div className={`mb-2 p-2 rounded-lg text-xs ${isOwn ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>
            <div className="font-medium mb-1">
              {repliedMessage ? (repliedMessage.senderId === message.senderId ? 'You' : 'Reply') : 'Reply'}
            </div>
            <div className="truncate">
              {repliedMessage ? repliedMessage.content : `Reply to message (ID: ${message.repliedMessageId})`}
            </div>
          </div>
        )}

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

      {/* Context menu */}
      {showContextMenu && (
        <div 
          ref={contextMenuRef}
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]"
          style={{
            top: '100%',
            left: isOwn ? 'auto' : '0',
            right: isOwn ? '0' : 'auto',
            marginTop: '4px'
          }}
        >
          <button
            onClick={handleReply}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Reply
          </button>
        </div>
      )}
    </div>
  );
}