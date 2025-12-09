import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  useColorScheme,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useCustomAlert } from "@/hooks/useCustomAlert";

interface ChatOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    id: number;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
  onViewProfile: () => void;
  onDeleteConversation: () => void;
}

const ChatOptionsModal: React.FC<ChatOptionsModalProps> = ({
  visible,
  onClose,
  user,
  onViewProfile,
  onDeleteConversation,
}) => {
  const colorScheme = useColorScheme();
  const { confirm } = useCustomAlert();
  const isDark = colorScheme === "dark";

  const baseTextColor = isDark ? "text-white" : "text-black";
  const baseIconColor = isDark ? "#ffffff" : "#000000";
  const separatorColor = isDark ? "border-gray-700" : "border-gray-200";

  const handleDeleteConversation = () => {
    confirm(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa cuộc trò chuyện với ${user.fullName}?`,
      () => {
        onDeleteConversation();
        onClose();
      }
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/50">
          <TouchableWithoutFeedback>
            {/* Modal Container */}
            <View className="w-full bg-white dark:bg-[#0E0C1F] rounded-t-2xl shadow-2xl p-4">
              {/* Thanh kéo (Handle) */}
              <View className="items-center mb-4">
                <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </View>

              {/* Thông tin người dùng */}
              <View className="items-center mb-6">
                <Image
                  source={{
                    uri: user.avatarUrl || "https://via.placeholder.com/80",
                  }}
                  className="w-20 h-20 rounded-full mb-3"
                />
                <Text className={`text-xl font-bold ${baseTextColor}`}>
                  @{user.username}
                </Text>
                <Text className={`text-xl font-bold ${baseTextColor}`}>
                  {user.fullName}
                </Text>
              </View>

              {/* Tùy chọn */}
              <TouchableOpacity
                className={`flex-row items-center p-3 border-b ${separatorColor}`}
                onPress={() => {
                  onViewProfile();
                  onClose();
                }}
              >
                <Icon name="user" size={20} color="#3b82f6" />
                <Text className={`ml-3 text-base ${baseTextColor}`}>
                  Xem trang cá nhân
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-row items-center p-3`}
                onPress={handleDeleteConversation}
              >
                <Icon name="trash-2" size={20} color="#ef4444" />
                <Text className={`ml-3 text-base text-red-500 font-medium`}>
                  Xóa cuộc trò chuyện
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ChatOptionsModal;
