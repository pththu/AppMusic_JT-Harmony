import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationItem } from '@/services/notificationService';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  setNotifications: (items: NotificationItem[]) => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: (delta?: number) => void;
  decrementUnreadCount: (delta?: number) => void;
  prependNotification: (item: NotificationItem) => void;
  clearNotifications: () => void;
  markNotificationRead: (notificationId: number) => void;
  markAllNotificationsReadLocal: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      setNotifications: (items) => set({ notifications: items }),
      setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
      incrementUnreadCount: (delta = 1) =>
        set((state) => ({ unreadCount: state.unreadCount + delta })),
      decrementUnreadCount: (delta = 1) =>
        set((state) => ({ unreadCount: Math.max(0, state.unreadCount - delta) })),
      prependNotification: (item) =>
        set((state) => ({ notifications: [item, ...state.notifications] })),
      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
      markNotificationRead: (notificationId) =>
        set((state) => {
          let shouldDecrease = false;
          const notifications = state.notifications.map((notification) => {
            if (notification.id === notificationId && !notification.isRead) {
              shouldDecrease = true;
              return { ...notification, isRead: true };
            }
            return notification;
          });

          return {
            notifications,
            unreadCount: shouldDecrease
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        }),
      markAllNotificationsReadLocal: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            isRead: true,
          })),
          unreadCount: 0,
        })),
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);
