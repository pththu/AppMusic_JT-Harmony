// import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { NotificationItem } from '@/services/notificationService';

// interface NotificationState {
//   notifications: NotificationItem[];
//   unreadCount: number;
//   setNotifications: (items: NotificationItem[]) => void;
//   setUnreadCount: (count: number) => void;
//   incrementUnreadCount: (delta?: number) => void;
//   decrementUnreadCount: (delta?: number) => void;
//   prependNotification: (item: NotificationItem) => void;
//   clearNotifications: () => void;
//   markNotificationRead: (notificationId: number) => void;
//   markAllNotificationsReadLocal: () => void;
// }

// export const useNotificationStore = create<NotificationState>()(
//   persist(
//     (set) => ({
//       notifications: [],
//       unreadCount: 0,
//       setNotifications: (items) => set({ notifications: items }),
//       setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
//       incrementUnreadCount: (delta = 1) =>
//         set((state) => ({ unreadCount: state.unreadCount + delta })),
//       decrementUnreadCount: (delta = 1) =>
//         set((state) => ({ unreadCount: Math.max(0, state.unreadCount - delta) })),
//       prependNotification: (item) =>
//         set((state) => ({ notifications: [item, ...state.notifications] })),
//       clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
//       markNotificationRead: (notificationId) =>
//         set((state) => {
//           let shouldDecrease = false;
//           const notifications = state.notifications.map((notification) => {
//             if (notification.id === notificationId && !notification.isRead) {
//               shouldDecrease = true;
//               return { ...notification, isRead: true };
//             }
//             return notification;
//           });

//           return {
//             notifications,
//             unreadCount: shouldDecrease
//               ? Math.max(0, state.unreadCount - 1)
//               : state.unreadCount,
//           };
//         }),
//       markAllNotificationsReadLocal: () =>
//         set((state) => ({
//           notifications: state.notifications.map((notification) => ({
//             ...notification,
//             isRead: true,
//           })),
//           unreadCount: 0,
//         })),
//     }),
//     {
//       name: 'notification-storage',
//       storage: createJSONStorage(() => AsyncStorage),
//       partialize: (state) => ({ 
//         notifications: state.notifications,
//         unreadCount: state.unreadCount,
//       }),
//     }
//   )
// );
// store/notificationStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ==================== TYPE DEFINITIONS ====================

/**
 * Notification types
 */
export type NotificationType =
  | 'message'      // Tin nhắn mới
  | 'comment'      // Comment mới
  | 'like'         // Like post/comment
  | 'follow'       // Follow user
  | 'share'        // Share post
  | 'reply'        // Reply comment
  | 'mention'      // Mention trong comment
  | 'system';      // System notification

/**
 * Base notification item structure
 */
export interface NotificationItem {
  id: number | string;
  type: NotificationType;
  actorId?: number;
  actorName?: string;
  actorAvatar?: string;
  message: string;
  metadata?: {
    // Chat metadata
    conversationId?: number;
    messageId?: number | string;
    contentSnippet?: string;

    // Comment metadata
    postId?: number | string;
    commentId?: number | string;

    // Generic metadata
    [key: string]: any;
  };
  createdAt: string;
  isRead: boolean;

  // Optional fields từ API
  postId?: number | string;
  userId?: number;
  Actor?: {
    id: number;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
}

/**
 * Notification filter options
 */
export interface NotificationFilter {
  type?: NotificationType;
  isRead?: boolean;
}

// ==================== STORE STATE ====================

interface NotificationState {
  // State
  notifications: NotificationItem[];
  unreadCount: number;

  // Basic setters
  setNotifications: (items: NotificationItem[]) => void;
  setUnreadCount: (count: number) => void;

  // Counter operations
  incrementUnreadCount: (delta?: number) => void;
  decrementUnreadCount: (delta?: number) => void;
  resetUnreadCount: () => void;

  // Notification operations
  prependNotification: (item: any) => void;
  appendNotifications: (items: any[]) => void;
  updateNotification: (id: number | string, updates: Partial<NotificationItem>) => void;
  removeNotification: (id: number | string) => void;

  // Bulk operations
  clearNotifications: () => void;
  clearReadNotifications: () => void;

  // Read status operations
  markNotificationRead: (notificationId: number | string) => void;
  markMultipleRead: (notificationIds: (number | string)[]) => void;
  markAllNotificationsReadLocal: () => void;

  // Query operations
  getUnreadNotifications: () => NotificationItem[];
  getNotificationsByType: (type: NotificationType) => NotificationItem[];
  getFilteredNotifications: (filter: NotificationFilter) => NotificationItem[];
  hasUnreadNotifications: () => boolean;

  // Socket-specific operations
  handleSocketNotification: (notification: any) => void;
}

// ==================== STORE IMPLEMENTATION ====================

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // ==================== INITIAL STATE ====================
      notifications: [],
      unreadCount: 0,

      // ==================== BASIC SETTERS ====================

      setNotifications: (items) =>
        set({ notifications: items }),

      setUnreadCount: (count) =>
        set({ unreadCount: Math.max(0, count) }),

      // ==================== COUNTER OPERATIONS ====================

      incrementUnreadCount: (delta = 1) =>
        set((state) => ({
          unreadCount: state.unreadCount + delta
        })),

      decrementUnreadCount: (delta = 1) =>
        set((state) => ({
          unreadCount: Math.max(0, state.unreadCount - delta)
        })),

      resetUnreadCount: () =>
        set({ unreadCount: 0 }),

      // ==================== NOTIFICATION OPERATIONS ====================

      /**
       * Thêm notification mới vào đầu danh sách
       * Dùng cho real-time notifications từ Socket.IO
       */
      prependNotification: (item) =>
        set((state) => {
          // Kiểm tra duplicate
          const exists = state.notifications.some(
            (n) => n.id === item.id
          );

          if (exists) {
            console.warn(`⚠️ Notification ${item.id} already exists`);
            return state;
          }

          console.log("✅ Prepending notification:", item);

          return {
            notifications: [item, ...state.notifications],
            // Chỉ tăng unreadCount nếu notification chưa đọc
            unreadCount: item.isRead
              ? state.unreadCount
              : state.unreadCount + 1,
          };
        }),

      /**
       * Thêm nhiều notifications vào cuối danh sách
       * Dùng khi fetch từ API
       */
      appendNotifications: (items) =>
        set((state) => {
          // Lọc bỏ duplicates
          const existingIds = new Set(state.notifications.map(n => n.id));
          const newItems = items.filter(item => !existingIds.has(item.id));

          return {
            notifications: [...state.notifications, ...newItems],
          };
        }),

      /**
       * Cập nhật một notification
       */
      updateNotification: (id, updates) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id
              ? { ...notification, ...updates }
              : notification
          ),
        })),

      /**
       * Xóa một notification
       */
      removeNotification: (id) =>
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          const wasUnread = notification && !notification.isRead;

          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: wasUnread
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        }),

      // ==================== BULK OPERATIONS ====================

      /**
       * Xóa tất cả notifications
       */
      clearNotifications: () =>
        set({
          notifications: [],
          unreadCount: 0
        }),

      /**
       * Xóa các notifications đã đọc
       */
      clearReadNotifications: () =>
        set((state) => ({
          notifications: state.notifications.filter(n => !n.isRead),
        })),

      // ==================== READ STATUS OPERATIONS ====================

      /**
       * Đánh dấu một notification là đã đọc
       */
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

      /**
       * Đánh dấu nhiều notifications là đã đọc
       */
      markMultipleRead: (notificationIds) =>
        set((state) => {
          const idsSet = new Set(notificationIds);
          let decreaseCount = 0;

          const notifications = state.notifications.map((notification) => {
            if (idsSet.has(notification.id) && !notification.isRead) {
              decreaseCount++;
              return { ...notification, isRead: true };
            }
            return notification;
          });

          return {
            notifications,
            unreadCount: Math.max(0, state.unreadCount - decreaseCount),
          };
        }),

      /**
       * Đánh dấu tất cả notifications là đã đọc
       */
      markAllNotificationsReadLocal: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            isRead: true,
          })),
          unreadCount: 0,
        })),

      // ==================== QUERY OPERATIONS ====================

      /**
       * Lấy danh sách notifications chưa đọc
       */
      getUnreadNotifications: () => {
        const state = get();
        return state.notifications.filter(n => !n.isRead);
      },

      /**
       * Lấy notifications theo type
       */
      getNotificationsByType: (type) => {
        const state = get();
        return state.notifications.filter(n => n.type === type);
      },

      /**
       * Lấy notifications theo filter
       */
      getFilteredNotifications: (filter) => {
        const state = get();
        return state.notifications.filter(notification => {
          if (filter.type && notification.type !== filter.type) {
            return false;
          }
          if (filter.isRead !== undefined && notification.isRead !== filter.isRead) {
            return false;
          }
          return true;
        });
      },

      /**
       * Kiểm tra có notifications chưa đọc không
       */
      hasUnreadNotifications: () => {
        const state = get();
        return state.unreadCount > 0;
      },

      // ==================== SOCKET-SPECIFIC OPERATIONS ====================

      /**
       * Xử lý notification từ Socket.IO
       * Normalize data format và add vào store
       */
      handleSocketNotification: (notification) => {
        try {
          // Normalize notification format
          const normalizedNotification: NotificationItem = {
            id: notification.id || Date.now(),
            type: notification.type || 'system',
            actorId: notification.actorId || notification.Actor?.id,
            actorName: notification.actorName || notification.Actor?.fullName || notification.Actor?.username,
            actorAvatar: notification.actorAvatar || notification.Actor?.avatarUrl,
            message: notification.message || '',
            metadata: notification.metadata || {},
            createdAt: notification.createdAt || new Date().toISOString(),
            isRead: notification.isRead || false,

            // Optional fields
            postId: notification.postId,
            userId: notification.userId,
            Actor: notification.Actor,
          };

          console.log("📨 Handling socket notification:", normalizedNotification);

          // Add to store
          get().prependNotification(normalizedNotification);

        } catch (error) {
          console.error("❌ Error handling socket notification:", error);
        }
      },
    }),

    // ==================== PERSISTENCE CONFIG ====================
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 100), // Chỉ lưu 100 notifications gần nhất
        unreadCount: state.unreadCount,
      }),
      version: 1, // Version để migrate data nếu cần
    }
  )
);

// ==================== HELPER FUNCTIONS ====================

/**
 * Tạo notification object từ socket data
 * Dùng khi cần normalize data trước khi add vào store
 */
export const createNotificationFromSocket = (data: any): NotificationItem => {
  return {
    id: data.id || Date.now(),
    type: data.type || 'system',
    actorId: data.actorId || data.Actor?.id,
    actorName: data.actorName || data.Actor?.fullName || data.Actor?.username,
    actorAvatar: data.actorAvatar || data.Actor?.avatarUrl,
    message: data.message || '',
    metadata: data.metadata || {},
    createdAt: data.createdAt || new Date().toISOString(),
    isRead: false,

    postId: data.postId,
    userId: data.userId,
    Actor: data.Actor,
  };
};

/**
 * Format notification message dựa trên type
 */
export const formatNotificationMessage = (notification: NotificationItem): string => {
  const actorName = notification.actorName || 'Someone';

  switch (notification.type) {
    case 'message':
      return `${actorName} đã gửi tin nhắn`;
    case 'comment':
      return `${actorName} đã bình luận về bài viết của bạn`;
    case 'like':
      return `${actorName} đã thích bài viết của bạn`;
    case 'follow':
      return `${actorName} đã theo dõi bạn`;
    case 'share':
      return `${actorName} đã chia sẻ bài viết của bạn`;
    case 'reply':
      return `${actorName} đã trả lời bình luận của bạn`;
    case 'mention':
      return `${actorName} đã nhắc đến bạn trong một bình luận`;
    case 'system':
      return notification.message;
    default:
      return notification.message || 'Bạn có thông báo mới';
  }
};

/**
 * Get notification icon name dựa trên type
 */
export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'message':
      return 'message-circle';
    case 'comment':
      return 'message-square';
    case 'like':
      return 'heart';
    case 'follow':
      return 'user-plus';
    case 'share':
      return 'share-2';
    case 'reply':
      return 'corner-up-left';
    case 'mention':
      return 'at-sign';
    case 'system':
      return 'bell';
    default:
      return 'bell';
  }
};

/**
 * Get notification color dựa trên type
 */
export const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'message':
      return '#3b82f6'; // blue
    case 'comment':
      return '#8b5cf6'; // purple
    case 'like':
      return '#ef4444'; // red
    case 'follow':
      return '#10b981'; // green
    case 'share':
      return '#f59e0b'; // orange
    case 'reply':
      return '#06b6d4'; // cyan
    case 'mention':
      return '#ec4899'; // pink
    case 'system':
      return '#6b7280'; // gray
    default:
      return '#6b7280';
  }
};
