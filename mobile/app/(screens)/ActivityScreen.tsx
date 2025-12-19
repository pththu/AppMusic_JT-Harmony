import { NOTIFICATION_FILTERS } from '@/constants/data';
import { useNavigate } from '@/hooks/useNavigate';
import { NotificationItem } from '@/services/notificationService'; // Chỉ lấy Type
import * as SocketService from '@/services/UnifiedSocketService';
import { useNotificationStore } from '@/store/notificationStore';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function ActivityScreen() {
  const colorScheme = useColorScheme();
  const { navigate, goBack } = useNavigate();

  // Store
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const markNotificationRead = useNotificationStore((state) => state.markNotificationRead);
  const markAllNotificationsReadLocal = useNotificationStore((state) => state.markAllNotificationsReadLocal);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const prependNotification = useNotificationStore((state) => state.prependNotification);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | string>('all');

  // Filter Logic
  const filteredNotifications = useMemo(() => {
    if (selectedFilter === 'all') return notifications;
    return notifications.filter((item) => item.type === selectedFilter);
  }, [notifications, selectedFilter]);

  // Fetch Data Logic
  const fetchData = useCallback(() => {
    if (SocketService.isConnected) {
      setIsLoading(true);
      SocketService.getNotifications({ limit: 50 }, (response) => {
        if ('notifications' in response) {
          setNotifications(response.notifications);
          // Cập nhật count chưa đọc từ danh sách mới
          const count = response.notifications.filter((n: NotificationItem) => !n.isRead).length;
          setUnreadCount(count);
        } else {
          console.warn('Failed to fetch notifications:', response.error);
        }
        setIsLoading(false);
      });
    }
  }, [SocketService.isConnected, setNotifications, setUnreadCount]);

  // Refresh Logic
  const onRefresh = useCallback(() => {
    if (SocketService.isConnected) {
      setIsRefreshing(true);
      SocketService.getNotifications({ limit: 50 }, (response) => {
        if ('notifications' in response) {
          setNotifications(response.notifications);
        }
        setIsRefreshing(false);
      });
    } else {
      setIsRefreshing(false);
    }
  }, [SocketService.isConnected, setNotifications]);

  // Initial Load & Realtime Listener
  useEffect(() => {
    if (!SocketService.isConnected) return;
    if (notifications.length === 0) fetchData(); // // 1. Fetch dữ liệu ban đầu nếu store trống

    // 2. Lắng nghe thông báo mới (Realtime)
    const handleNewNotification = (notification) => {
      console.log('[ActivityScreen] New notification:', notification);
      const exists = notifications.some(n => n.id === notification.id); // Kiểm tra trùng lặp

      if (!exists) {
        prependNotification(notification);
        setUnreadCount(unreadCount + 1);
      }
    };

    const unsubscribe = SocketService.on('notification:new', handleNewNotification);

    return () => {
      unsubscribe();
    };
  }, [SocketService.isConnected, notifications, unreadCount]);

  // Mark Read Handler
  const handleMarkRead = useCallback(
    (notification: NotificationItem) => {
      if (!notification.isRead) {
        markNotificationRead(notification.id); // Update Local
        SocketService.markNotificationAsRead(notification.id); // Update Server via Socket
      }
      navigateToNotification(notification);
    },
    [markNotificationRead]
  );

  // Mark All Read Handler
  const handleMarkAllRead = useCallback(() => {
    markAllNotificationsReadLocal();
    setUnreadCount(0);

    SocketService.markAllNotificationsAsRead();
  }, [markAllNotificationsReadLocal, setUnreadCount]);

  // Navigation Logic
  const navigateToNotification = (notification) => {
    switch (notification.type) {
      case 'message':
        break;
      case 'follow':
        const targetUserId = notification.Actor?.id || notification.actorId;
        if (targetUserId) {
          navigate('ProfileSocialScreen', { userId: targetUserId });
        }
        return;
      case 'like':
      case 'comment':
      case 'share':
      default:
        break;
    }
  };

  // Render Item
  const renderNotificationItem = ({ item }) => {
    const timeAgo = formatDistanceToNowStrict(parseISO(item.createdAt || new Date().toISOString()), {
      addSuffix: true,
      locale: vi,
    });

    console.log('item', item)

    return (
      <TouchableOpacity
        className={`flex-row items-center px-4 py-3 
          ${item.isRead ? 'bg-transparent' : 'bg-green-50 dark:bg-green-900/20'}`
        }
        onPress={() => handleMarkRead(item)}
      >
        <Image
          source={{
            uri:
              item?.Actor?.avatarUrl || item?.actorAvatar ||
              'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg',
          }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="text-base font-semibold text-black dark:text-white" numberOfLines={2}>
            {item.Actor?.fullName || item.Actor?.username || item?.actorName || 'Ai đó'}
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

  const renderDefaultMessage = (item) => {
    switch (item.type) {
      case 'like': return 'đã thích bài viết của bạn';
      case 'comment': return 'đã bình luận bài viết của bạn';
      case 'share': return 'đã chia sẻ bài viết của bạn';
      case 'follow': return 'đã bắt đầu theo dõi bạn';
      case 'message': return 'đã gửi cho bạn một tin nhắn mới';
      default: return 'đã tương tác với bạn';
    }
  };

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {NOTIFICATION_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              onPress={() => setSelectedFilter(filter.value)}
              className={`mx-1 px-3 py-1 rounded-full border ${selectedFilter === filter.value
                ? 'bg-green-700 border-green-500'
                : 'border-gray-300 dark:border-gray-600'
                }`
              }
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
        </ScrollView>
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