import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  useColorScheme,
  Image,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigate } from "@/hooks/useNavigate";
import Icon from "react-native-vector-icons/Feather";
import { fetchLikesByPostId, UserInfo } from "../../services/socialApi";

interface LikeModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
}

interface LikeItemProps {
  user: {
    id: number;
    userId: number;
    postId: number;
    likedAt: string;
    User: UserInfo;
  };
  onCloseModal: () => void;
}

// LikeItem
const LikeItem: React.FC<LikeItemProps> = ({ user, onCloseModal }) => {
  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();

  // --- HÀM XỬ LÝ NHẤN VÀO USER HOẶC AVATAR ---
  const handleUserNavigate = () => {
    // Đóng Modal trước
    onCloseModal();
    // Điều hướng đến ProfileSocialScreen
    navigate("ProfileSocialScreen", { userId: user.userId });
  };

  return (
    <TouchableOpacity
      className="flex-row items-center p-3 border-b border-gray-200 dark:border-gray-800"
      onPress={handleUserNavigate}
    >
      <Image
        source={{ uri: user?.User?.avatarUrl || "default_avatar_url" }}
        className="w-10 h-10 rounded-full mr-3"
      />
      <View className="flex-1">
        <Text className="font-bold text-base text-black dark:text-white">
          @{user?.User?.username}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {user?.User?.fullName}
        </Text>
      </View>
      <Icon name="heart" size={20} color="#ef4444" />
    </TouchableOpacity>
  );
};

// LikeModal
export default function LikeModal({
  visible,
  onClose,
  postId,
}: LikeModalProps) {
  const colorScheme = useColorScheme();
  const [data, setData] = useState<
    {
      id: number;
      userId: number;
      postId: number;
      likedAt: string;
      User: UserInfo;
    }[]
  >([]); // State để lưu danh sách người dùng đã like
  const [loading, setLoading] = useState(true); // State để quản lý trạng thái tải dữ liệu

  // --- HÀM LẤY DỮ LIỆU ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await fetchLikesByPostId(postId);
      setData(fetchedUsers);
    } catch (error) {
      console.error("Lỗi khi tải danh sách likes:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách người đã thích.");
    } finally {
      setLoading(false);
    }
  };

  // Tự động tải dữ liệu khi modal được mở
  useEffect(() => {
    if (visible && postId) {
      fetchData();
    }
  }, [visible, postId]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/50 dark:bg-black/80">
          <TouchableWithoutFeedback>
            <View
              className={`h-3/4 rounded-t-3xl p-0 ${colorScheme === "dark" ? "bg-[#0E0C1F]" : "bg-white"}`}
            >
              {/* Header */}
              <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <Text className="text-xl font-bold text-black dark:text-white">
                  Người đã thích
                </Text>
                <TouchableOpacity onPress={onClose} className="p-1">
                  <Icon
                    name="x"
                    size={24}
                    color={colorScheme === "dark" ? "#fff" : "#000"}
                  />
                </TouchableOpacity>
              </View>

              {/* Content */}
              {loading ? (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color="#4F46E5" />
                </View>
              ) : (
                <FlatList
                  data={data}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <LikeItem user={item} onCloseModal={onClose} />
                  )}
                  ListEmptyComponent={() => (
                    <View className="p-8 items-center">
                      <Text className="text-gray-500 dark:text-gray-400">
                        Chưa có ai thích bài viết này.
                      </Text>
                    </View>
                  )}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
