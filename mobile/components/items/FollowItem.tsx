import { useNavigate } from "@/hooks/useNavigate";
import useAuthStore from "@/store/authStore";
import { useFollowStore } from "@/store/followStore";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";

const FollowItem = ({ user, onCloseModal, onToggleFollow }) => {
  const { navigate } = useNavigate();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const userFollowees = useFollowStore((state) => state.userFollowees);

  // State để quản lý trạng thái follow của người dùng này
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false); // State để quản lý trạng thái loading khi gọi API
  const isCurrentUser = currentUserId === user.id; // Kiểm tra xem người dùng trong danh sách có phải là chính mình không

  const handleUserNavigate = () => {
    onCloseModal();
    navigate("ProfileSocialScreen", { userId: user.id });
  };

  const followButtonClass = isFollowing
    ? "bg-transparent border border-red-500"
    : "bg-green-600";

  const followButtonText = isFollowing ? "Hủy Theo dõi" : "Theo dõi";

  const checkIsFollowing = useCallback(() => {
    if (!user) {
      setIsFollowing(false);
      return;
    }
    for (const followedUser of userFollowees) {
      if (followedUser.id === user.id) {
        setIsFollowing(true);
        return;
      }
    }
    setIsFollowing(false);
  }, [user.id, userFollowees, setIsFollowing]);

  useEffect(() => {
    checkIsFollowing();
  }, [checkIsFollowing, userFollowees, setIsFollowing]);

  return (
    <TouchableOpacity
      className="flex-row items-center p-3 border-b border-gray-200 dark:border-gray-800"
      onPress={handleUserNavigate}
    >
      <Image
        source={{ uri: user.avatarUrl || "default_avatar_url" }}
        className="w-10 h-10 rounded-full mr-3"
      />
      <View className="flex-1">
        <Text className="font-bold text-base text-black dark:text-white">
          {user.username}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {user.fullName}
        </Text>
      </View>

      {/* NÚT FOLLOW/UNFOLLOW - Chỉ hiển thị khi không phải là chính mình */}
      {!isCurrentUser && (
        <TouchableOpacity
          onPress={() => onToggleFollow(user, isFollowing)}
          className={`px-3 py-1 rounded-full ${followButtonClass}`}
          disabled={loading} // Vô hiệu hóa khi đang xử lý API
        >
          {loading ? (
            <ActivityIndicator
              color={isFollowing ? "#4F46E5" : "#4F46E5"}
            />
          ) : (
            <Text
              className={`text-sm font-semibold ${isFollowing ? "text-red-500" : "text-white"}`}
            >
              {followButtonText}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default FollowItem;