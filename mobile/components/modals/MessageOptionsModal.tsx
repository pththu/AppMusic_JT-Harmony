import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

interface MessageOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onReply: () => void;
  onDelete: () => void;
  onHide: () => void;
  isMyMessage?: boolean; // Xác định xem đây có phải tin nhắn của user hiện tại không
}

const MessageOptionsModal: React.FC<MessageOptionsModalProps> = ({
  visible,
  onClose,
  onReply,
  onDelete,
  onHide,
  isMyMessage = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const baseTextColor = isDark ? "text-white" : "text-black";
  const baseIconColor = isDark ? "#ffffff" : "#000000";
  const separatorColor = isDark ? "border-gray-700" : "border-gray-200";

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
            <View className="w-full bg-white dark:bg-[#0E0C1F] rounded-t-2xl shadow-2xl p-4">
              <View className="items-center mb-4">
                <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </View>

              <Text
                className={`text-xl font-bold text-center mb-4 ${baseTextColor}`}
              >
                Tùy chọn tin nhắn
              </Text>

              {/* Trả lời */}
              <TouchableOpacity
                className={`flex-row items-center p-3 border-b ${separatorColor}`}
                onPress={() => {
                  onReply();
                  onClose();
                }}
              >
                <Icon name="corner-up-left" size={20} color="#10b981" />
                <Text className={`ml-3 text-base ${baseTextColor}`}>
                  Trả lời
                </Text>
              </TouchableOpacity>

              {/* Xóa (chỉ hiển thị nếu là tin nhắn của mình) */}
              {isMyMessage && (
                <TouchableOpacity
                  className={`flex-row items-center p-3 border-b ${separatorColor}`}
                  onPress={() => {
                    onDelete();
                    onClose();
                  }}
                >
                  <Icon name="trash-2" size={20} color="#ef4444" />
                  <Text className={`ml-3 text-base text-red-500 font-medium`}>
                    Xóa
                  </Text>
                </TouchableOpacity>
              )}

              {/* Ẩn */}
              <TouchableOpacity
                className={`flex-row items-center p-3`}
                onPress={() => {
                  onHide();
                  onClose();
                }}
              >
                <Icon name="eye-off" size={20} color="#3b82f6" />
                <Text className={`ml-3 text-base ${baseTextColor}`}>Ẩn</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MessageOptionsModal;
