import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigate } from '@/hooks/useNavigate';
import {
  NotificationItem,
} from '@/services/notificationService';
import { 
  connectNotificationSocket, 
  subscribeToNotificationEvents,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '@/services/notificationSocket';
import { useNotificationStore } from '@/store/notificationStore';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NOTIFICATION_FILTERS } from '@/constants/data';

export default function ActivityScreen() {
  const colorScheme = useColorScheme();
  const { navigate, goBack } = useNavigate();
  const notifications = useNotificationStore((state) => state.notifications);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const markNotificationRead = useNotificationStore((state) => state.markNotificationRead);
  const markAllNotificationsReadLocal = useNotificationStore((state) => state.markAllNotificationsReadLocal);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const prependNotification = useNotificationStore((state) => state.prependNotification);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | string>('all');

  const filteredNotifications = useMemo(() => {
    if (selectedFilter === 'all') return notifications;
    return notifications.filter((item) => item.type === selectedFilter);
  }, [notifications, selectedFilter]);

  const fetchData = useCallback(() => {
    const socket = connectNotificationSocket();
    
    if (socket && socket.connected) {
      setIsLoading(true);
      getNotifications({ limit: 50 }, (response) => {
        if ('notifications' in response) {
          setNotifications(response.notifications);
          const unreadCount = response.notifications.filter(n => !n.isRead).length;
          setUnreadCount(unreadCount);
        } else {
          console.warn('Failed to fetch notifications:', response.error);
        }
        setIsLoading(false);
      });
    } else {
      console.warn('Socket not connected, cannot fetch notifications');
      setIsLoading(false);
    }
  }, [setNotifications, setUnreadCount]);

  const onRefresh = useCallback(() => {
    const socket = connectNotificationSocket();
    
    if (socket && socket.connected) {
      setIsRefreshing(true);
      getNotifications({ limit: 50 }, (response) => {
        if ('notifications' in response) {
          setNotifications(response.notifications);
        } else {
          console.warn('Failed to refresh notifications:', response.error);
        }
        setIsRefreshing(false);
      });
    } else {
      console.warn('Socket not connected, cannot refresh notifications');
      setIsRefreshing(false);
    }
  }, [setNotifications]);

  const handleMarkRead = useCallback(
    (notification: NotificationItem) => {
      if (notification.isRead) {
        navigateToNotification(notification);
        return;
      }

      markNotificationRead(notification.id);
      markNotificationAsRead(notification.id, (success) => {
        if (!success) {
          console.warn('Failed to mark notification read');
          // Rollback local state if failed
          // TODO: Implement rollback if needed
        }
      });

      navigateToNotification(notification);
    },
    [markNotificationRead]
  );

  const handleMarkAllRead = useCallback(() => {
    markAllNotificationsReadLocal();
    setUnreadCount(0);
    markAllNotificationsAsRead((success) => {
      if (!success) {
        console.warn('Failed to mark all notifications read');
        // TODO: Implement rollback if needed
      }
    });
  }, [markAllNotificationsReadLocal, setUnreadCount]);

  const navigateToNotification = (notification: NotificationItem) => {
    // Thông báo tin nhắn mới: điều hướng đến màn hình trò chuyện
    if (notification.type === 'message') {
      navigate('ConversationsScreen');
      return;
    }

    // Thông báo follow: mở trang profile của người theo dõi
    if (notification.type === 'follow') {
      const targetUserId = notification.Actor?.id || notification.actorId;
      if (targetUserId) {
        navigate('ProfileSocialScreen', { userId: targetUserId });
      }
      return;
    }

    // Thông báo liên quan bài viết (like/comment/share)
    if (notification.postId) {
      navigate('Social');
    }
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => {
    const timeAgo = formatDistanceToNowStrict(parseISO(item.createdAt), {
      addSuffix: true,
      locale: vi,
    });

    return (
      <TouchableOpacity
        className={`flex-row items-center px-4 py-3 ${item.isRead ? 'bg-transparent' : 'bg-green-50 dark:bg-green-900/20'
          }`}
        onPress={() => handleMarkRead(item)}
      >
        <Image
          source={{
            uri:
              item.Actor?.avatarUrl ||
              'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg',
          }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="text-base font-semibold text-black dark:text-white" numberOfLines={2}>
            {item.Actor?.fullName || item.Actor?.username || 'Ai đó'}
          </Text>
          <Text className="text-sm text-gray-700 dark:text-gray-300" numberOfLines={2}>
            {item.message || renderDefaultMessage(item)}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">{timeAgo}</Text>
        </View>
        {!item.isRead && <View className="w-2 h-2 rounded-full bg-green-500" />}
      </TouchableOpacity>
    );
  };

  const renderDefaultMessage = (item: NotificationItem) => {
    switch (item.type) {
      case 'like':
        return 'đã thích bài viết của bạn';
      case 'comment':
        return 'đã bình luận bài viết của bạn';
      case 'share':
        return 'đã chia sẻ bài viết của bạn';
      case 'follow':
        return 'đã bắt đầu theo dõi bạn';
      case 'message':
        return 'đã gửi cho bạn một tin nhắn mới';
      default:
        return 'đã tương tác với bạn';
    }
  };

  // Initialize socket and fetch data
  useEffect(() => {
    const socket = connectNotificationSocket();
    
    if (socket) {
      console.log('[ActivityScreen] Connected to notification socket');
      
      // Load initial data from storage or server
      const loadInitialData = async () => {
        try {
          // Get notifications from store (will be loaded from AsyncStorage)
          const { notifications: storedNotifications } = useNotificationStore.getState();
          
          // If no notifications in store, fetch from server
          if (storedNotifications.length === 0) {
            getNotifications({ limit: 50 }, (response) => {
              if ('notifications' in response) {
                setNotifications(response.notifications);
                const unreadCount = response.notifications.filter(n => !n.isRead).length;
                setUnreadCount(unreadCount);
              } else {
                console.warn('Failed to fetch initial notifications:', response.error);
              }
            });
          }
        } catch (error) {
          console.warn('Error loading notifications:', error);
        }
      };

      loadInitialData();
      
      // Lắng nghe thông báo real-time - chỉ đăng ký một lần
      const unsubscribe = subscribeToNotificationEvents((notification) => {
        console.log('[ActivityScreen] New notification received:', notification);
        
        // Kiểm tra xem thông báo đã tồn tại chưa (dùng Set để nhanh hơn)
        const currentNotifications = notifications;
        const notificationIds = new Set(currentNotifications.map(n => n.id));
        
        if (!notificationIds.has(notification.id)) {
          // Chỉ thêm nếu chưa tồn tại
          prependNotification(notification);
          
          // Cập nhật số lượng chưa đọc
          const currentUnreadCount = useNotificationStore.getState().unreadCount;
          setUnreadCount(currentUnreadCount + 1);
        } else {
          console.log('[ActivityScreen] Notification already exists, skipping:', notification.id);
        }
      });
      
      return () => {
        console.log('[ActivityScreen] Disconnecting notification socket');
        unsubscribe();
      };
    } else {
      console.log('[ActivityScreen] Failed to connect to notification socket');
    }
  }, [setNotifications, setUnreadCount, prependNotification]);

  return (
    <SafeAreaView className={`flex-1 ${colorScheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={goBack} className="p-2">
          <MaterialIcons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black dark:text-white">Hoạt động</Text>
        <TouchableOpacity onPress={handleMarkAllRead} className="p-2">
          <Text className="text-sm text-green-500 font-semibold">Đã đọc hết</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row px-4 py-3 space-x-2">
        {NOTIFICATION_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            onPress={() => setSelectedFilter(filter.value)}
            className={`px-3 py-1 rounded-full border ${selectedFilter === filter.value
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 dark:border-gray-600'
              }`}
          >
            <Text
              className={`text-sm ${selectedFilter === filter.value
                  ? 'text-white'
                  : colorScheme === 'dark'
                    ? 'text-gray-200'
                    : 'text-gray-700'
                }`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderNotificationItem}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center mt-20">
            <MaterialIcons
              name="notifications-none"
              size={48}
              color={colorScheme === 'dark' ? '#6b7280' : '#9ca3af'}
            />
            <Text className="mt-3 text-base text-gray-500 dark:text-gray-400">Chưa có hoạt động mới</Text>
          </View>
        )}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}
