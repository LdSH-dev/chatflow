'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, UploadProgress } from '@/types';
import { sendMessage, startTyping, stopTyping } from '@/lib/socket';
import FileUpload from './FileUpload';
import { getAuthToken, isAuthenticated } from '@/lib/auth';

interface MessageInputProps {
  receiverId: number;
  onMessageSent?: () => void;
  replyingTo?: Message | null;
  onClearReply?: () => void;
}

export default function MessageInput({ receiverId, onMessageSent, replyingTo, onClearReply }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't submit if there's no message and no file
    if (!message.trim() && !attachedFile) return;
    
    // If there's a file, upload it first
    if (attachedFile) {
      await handleFileUpload(attachedFile);
    } else {
      // Send text message only
      sendMessage(receiverId, message.trim(), 'text', replyingTo?._id);
      setMessage('');
    }
    
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
  };

  const handleFileSelect = (file: File) => {
    // Just attach the file, don't send it yet
    setAttachedFile(file);
  };

  const handleFileRemove = () => {
    setAttachedFile(null);
  };

  const handleFileUpload = async (file: File) => {
    // Check authentication first
    if (!isAuthenticated()) {
      alert('Você precisa estar logado para enviar arquivos. Por favor, faça login primeiro.');
      setShowFileUpload(false);
      setAttachedFile(null);
      return;
    }

    setUploading(true);
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('receiverId', receiverId.toString());
      if (message.trim()) {
        formData.append('content', message.trim());
      }
      if (replyingTo?._id) {
        formData.append('repliedMessageId', replyingTo._id);
      }

      const token = getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Por favor, faça login novamente.');
      }

      // Use the correct message service URL
      const messageApiUrl = process.env.NEXT_PUBLIC_MESSAGE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${messageApiUrl}/api/messages/upload-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        let errorMessage = 'Falha no upload do arquivo';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Clear form
      setMessage('');
      setAttachedFile(null);
      setShowFileUpload(false);
      
      // Clear reply state
      if (onClearReply) {
        onClearReply();
      }

      // Stop typing
      if (isTyping) {
        setIsTyping(false);
        stopTyping(receiverId);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Falha no upload do arquivo';
      alert(`Erro: ${errorMessage}`);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const toggleFileUpload = () => {
    // Check authentication before showing file upload
    if (!isAuthenticated()) {
      alert('Você precisa estar logado para enviar arquivos. Por favor, faça login primeiro.');
      return;
    }
    setShowFileUpload(!showFileUpload);
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
    <div className="border-t bg-white keyboard-safe">
      {/* Reply preview */}
      {replyingTo && (
        <div className="p-2 sm:p-3 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 mb-1">Replying to</div>
              <div className="text-xs sm:text-sm text-gray-700 truncate">{replyingTo.content}</div>
            </div>
            <button
              onClick={onClearReply}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* File upload area */}
      {showFileUpload && (
        <div className="p-2 sm:p-3 border-b bg-gray-50 flex-shrink-0">
          <FileUpload
            onFileSelect={handleFileSelect}
            onUploadProgress={setUploadProgress}
            disabled={uploading}
            selectedFile={attachedFile}
            onRemoveFile={handleFileRemove}
          />
          {uploadProgress && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress.percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-2 p-2 sm:p-3 sm:p-4 flex-shrink-0">
        <button
          type="button"
          onClick={toggleFileUpload}
          disabled={uploading}
          className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title={!isAuthenticated() ? "Faça login para enviar arquivos" : "Anexar arquivo"}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder={replyingTo ? "Type your reply..." : "Type your message..."}
          className="flex-1 input-field text-sm sm:text-base min-w-0"
          maxLength={1000}
          disabled={uploading}
        />
        
        <button
          type="submit"
          disabled={(!message.trim() && !attachedFile) || uploading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed p-2 flex-shrink-0"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
}