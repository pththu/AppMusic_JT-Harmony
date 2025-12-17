import { ENV } from '@/config/env';
import useAuthStore from '@/store/authStore';
import { io, Socket } from 'socket.io-client';
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
    console.log('[notificationSocket] connect error:', error.message);
  });

  return notificationSocket;
};

export const disconnectNotificationSocket = (): void => {
  if (notificationSocket && notificationSocket.connected) {
    notificationSocket.disconnect();
  }
  notificationSocket = null;
};

// Debouncing để tránh xử lý trùng lặp
const processedNotifications = new Set<number>();

export const subscribeToNotificationEvents = (
  listener: (notification: NotificationItem) => void
): (() => void) => {
  if (!notificationSocket) {
    return () => {};
  }

  const wrappedListener = (notification: NotificationItem) => {
    // Kiểm tra xem đã xử lý thông báo này chưa
    if (processedNotifications.has(notification.id)) {
      console.log('[notificationSocket] Already processed notification:', notification.id);
      return;
    }
    
    // Đánh dấu là đã xử lý
    processedNotifications.add(notification.id);
    
    // Xóa khỏi Set sau 5 giây để tránh memory leak
    setTimeout(() => {
      processedNotifications.delete(notification.id);
    }, 5000);
    
    // Gọi listener gốc
    listener(notification);
  };

  notificationSocket.on('notification:new', wrappedListener);
  return () => {
    notificationSocket?.off('notification:new', wrappedListener);
  };
};

export const getNotifications = (
  options: { limit?: number; offset?: number } = {},
  callback: (response: { notifications: NotificationItem[] } | { error: string }) => void
): void => {
  if (!notificationSocket || !notificationSocket.connected) {
    callback({ error: 'Socket not connected' });
    return;
  }

  const { limit = 20, offset = 0 } = options;
  notificationSocket.emit('get_notifications', { limit, offset }, callback);
};

export const markNotificationAsRead = (
  notificationId: number,
  callback?: (success: boolean) => void
): void => {
  if (!notificationSocket || !notificationSocket.connected) {
    callback?.(false);
    return;
  }

  notificationSocket.emit('mark_notification_as_read', { notificationId }, (response: any) => {
    callback?.(response?.success || false);
  });
};

export const markAllNotificationsAsRead = (
  callback?: (success: boolean) => void
): void => {
  if (!notificationSocket || !notificationSocket.connected) {
    callback?.(false);
    return;
  }

  notificationSocket.emit('mark_all_notifications_as_read', {}, (response: any) => {
    callback?.(response?.success || false);
  });
};
