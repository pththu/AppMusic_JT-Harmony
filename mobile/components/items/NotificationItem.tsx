// components/items/NotificationItem.tsx
import { useNavigate } from "@/hooks/useNavigate";
import {
  NotificationItem as NotificationItemType,
  formatNotificationMessage,
  getNotificationColor,
  getNotificationIcon,
} from "@/store/notificationStore";
import { formatDistanceToNowStrict } from "date-fns";
import { vi } from "date-fns/locale";
import React from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

interface NotificationItemProps {
  notification: NotificationItemType;
  onPress?: (notification: NotificationItemType) => void;
  onMarkRead?: (notificationId: number | string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkRead,
}) => {
  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const isDark = colorScheme === "dark";

  // Format time ago
  const timeAgo = formatDistanceToNowStrict(new Date(notification.createdAt), {
    addSuffix: true,
    locale: vi,
  });

  // Get icon và color dựa trên type
  const iconName = getNotificationIcon(notification.type);
  const iconColor = getNotificationColor(notification.type);

  // Format message
  const message = formatNotificationMessage(notification);

  // Handle press
  const handlePress = () => {
    // Đánh dấu đã đọc
    if (!notification.isRead && onMarkRead) {
      onMarkRead(notification.id);
    }

    // Navigate dựa trên type
    if (onPress) {
      onPress(notification);
    } else {
      handleNavigate();
    }
  };

  // Navigate logic
  const handleNavigate = () => {
    const { metadata } = notification;

    switch (notification.type) {
      case "message":
        if (metadata?.conversationId) {
          navigate("ChatScreen", {
            conversationId: metadata.conversationId,
            user: {
              id: notification.actorId,
              username: notification.Actor?.username || "",
              fullName: notification.Actor?.fullName || "",
              avatarUrl: notification.Actor?.avatarUrl || null,
            },
          });
        }
        break;

      case "comment":
      case "like":
      case "share":
        if (metadata?.postId) {
          navigate("PostDetailScreen", { postId: metadata.postId });
        }
        break;

      case "follow":
        if (notification.actorId) {
          navigate("ProfileSocialScreen", { userId: notification.actorId });
        }
        break;

      default:
        break;
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`flex-row items-start p-4 border-b ${
        isDark ? "border-gray-700" : "border-gray-200"
      } ${!notification.isRead ? (isDark ? "bg-gray-800/50" : "bg-blue-50") : ""}`}
      activeOpacity={0.7}
    >
      {/* Avatar hoặc Icon */}
      <View className="mr-3">
        {notification.Actor?.avatarUrl || notification.actorAvatar ? (
          <View className="relative">
            <Image
              source={{
                uri:
                  notification.actorAvatar ||
                  notification.Actor?.avatarUrl ||
                  "https://via.placeholder.com/40",
              }}
              className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600"
            />
            {/* Icon overlay */}
            <View
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center"
              style={{ backgroundColor: iconColor }}
            >
              <Icon name={iconName} size={12} color="#fff" />
            </View>
          </View>
        ) : (
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: iconColor + "20" }}
          >
            <Icon name={iconName} size={24} color={iconColor} />
          </View>
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        {/* Message */}
        <Text
          className={`text-sm leading-5 ${
            isDark ? "text-white" : "text-gray-900"
          } ${!notification.isRead ? "font-semibold" : ""}`}
        >
          {message}
        </Text>

        {/* Metadata content snippet */}
        {notification.metadata?.contentSnippet && (
          <Text
            className={`text-sm mt-1 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
            numberOfLines={2}
          >
            "{notification.metadata.contentSnippet}"
          </Text>
        )}

        {/* Time ago */}
        <Text
          className={`text-xs mt-1 ${
            isDark ? "text-gray-500" : "text-gray-500"
          }`}
        >
          {timeAgo}
        </Text>
      </View>

      {/* Unread indicator */}
      {!notification.isRead && (
        <View className="ml-2">
          <View className="w-2 h-2 rounded-full bg-blue-500" />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationItem;