import { io, Socket } from 'socket.io-client';
import { ENV } from '@/config/env';
import useAuthStore from '@/store/authStore';
import { NotificationItem } from './notificationService';

let notificationSocket: Socket | null = null;

export const connectNotificationSocket = (): Socket | null => {
  const token = useAuthStore.getState().token;
  if (!token) {
    return null;
  }

  if (notificationSocket && notificationSocket.connected) {
    return notificationSocket;
  }

  notificationSocket = io(ENV.SOCKET_SERVER_URL, {
    transports: ['websocket'],
    auth: { token },
  });

  notificationSocket.on('connect', () => {
    console.log('[notificationSocket] connected');
  });

  notificationSocket.on('disconnect', (reason) => {
    console.log('[notificationSocket] disconnected:', reason);
  });

  notificationSocket.on('connect_error', (error) => {
    console.error('[notificationSocket] connect error:', error.message);
  });

  return notificationSocket;
};

export const disconnectNotificationSocket = (): void => {
  if (notificationSocket && notificationSocket.connected) {
    notificationSocket.disconnect();
  }
  notificationSocket = null;
};

export const subscribeToNotificationEvents = (
  listener: (notification: NotificationItem) => void
): (() => void) => {
  if (!notificationSocket) {
    return () => {};
  }

  notificationSocket.on('notification:new', listener);
  return () => {
    notificationSocket?.off('notification:new', listener);
  };
};
