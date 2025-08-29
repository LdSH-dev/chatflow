import { useState, useCallback } from 'react';
import { Message } from '@/types';

interface ReplyState {
  replyingTo: Message | null;
  setReplyingTo: (message: Message | null) => void;
  clearReply: () => void;
}

export const useReply = (): ReplyState => {
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const clearReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  return {
    replyingTo,
    setReplyingTo,
    clearReply
  };
}; 