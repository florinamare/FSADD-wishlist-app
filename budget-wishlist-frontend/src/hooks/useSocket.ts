import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Notification } from '../types';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:3000';

interface UseSocketOptions {
  userId: string | null;
  onNotification?: (n: Notification) => void;
}

export function useSocket({ userId, onNotification }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', userId);
    });

    // Backend always emits 'notification:new'.
    // For visit events: data = Notification object directly
    // For purchase events: data = { type: 'item:purchased', notification: Notification }
    socket.on('notification:new', (data: Notification | { type: string; notification: Notification }) => {
      const notif: Notification = 'notification' in data ? data.notification : data;
      onNotification?.(notif);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps
}
