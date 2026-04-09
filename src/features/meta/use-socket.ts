import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@features/auth';
import { useChatStore } from './store/chat-store';

export function useMetaSocket() {
  const token = useAuthStore((s) => s.token);
  const onIncoming = useChatStore((s) => s.onIncoming);
  const updateMessageStatus = useChatStore((s) => s.updateMessageStatus);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    let socketUrl: string;
    try {
      socketUrl = new URL(import.meta.env.VITE_API_URL as string).origin;
    } catch {
      socketUrl = import.meta.env.VITE_API_URL as string;
    }

    const socket = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.on('new_message', onIncoming);
    socket.on('message_status', updateMessageStatus);
    socketRef.current = socket;

    return () => {
      socket.off('new_message', onIncoming);
      socket.off('message_status', updateMessageStatus);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, onIncoming, updateMessageStatus]);
}
