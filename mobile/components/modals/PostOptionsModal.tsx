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

interface PostOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onReport: () => void;
  onHide: () => void;
  onEdit?: () => void; // Nếu bài đăng là của người dùng hiện tại
  onDelete?: () => void; // Nếu bài đăng là của người dùng hiện tại
  isUserPost?: boolean; // Xác định xem đây có phải bài đăng của user hiện tại không
}

const PostOptionsModal: React.FC<PostOptionsModalProps> = ({
  visible,
  onClose,
  onReport,
  onHide,
  onEdit,
  onDelete,
  isUserPost = false,
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
      // Animation trượt từ dưới lên
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/50">
          <TouchableWithoutFeedback>
            <View className="w-full bg-white dark:bg-[#0E0C1F] rounded-t-2xl shadow-2xl p-4">
              {/* Thanh kéo (Handle) */}
              <View className="items-center mb-4">
                <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </View>

              {/* Tiêu đề */}
              <Text
                className={`text-xl font-bold text-center mb-4 ${baseTextColor}`}
              >
                Tùy chọn bài viết
              </Text>

              {/* Báo cáo bài viết */}
              <TouchableOpacity
                className={`flex-row items-center p-3 border-b ${separatorColor}`}
                onPress={() => {
                  onReport();
                  onClose();
                }}
              >
                <Icon name="flag" size={20} color="#f59e0b" />
                <Text className={`ml-3 text-base ${baseTextColor}`}>
                  Báo cáo bài viết
                </Text>
              </TouchableOpacity>

              {/* Ẩn bài viết */}
              <TouchableOpacity
                className={`flex-row items-center p-3 border-b ${separatorColor}`}
                onPress={() => {
                  onHide();
                  onClose();
                }}
              >
                <Icon name="eye-off" size={20} color="#3b82f6" />
                <Text className={`ml-3 text-base ${baseTextColor}`}>
                  Ẩn bài viết
                </Text>
              </TouchableOpacity>

              {/* -------------------- CÁC TÙY CHỌN DÀNH CHO BÀI VIẾT CỦA BẠN -------------------- */}
              {isUserPost && (
                <View>
                  {/* Chỉnh sửa chú thích */}
                  <TouchableOpacity
                    className={`flex-row items-center p-3 border-b ${separatorColor}`}
                    onPress={() => {
                      if (onEdit) onEdit();
                      onClose();
                    }}
                  >
                    <Icon name="edit-3" size={20} color="#10b981" />
                    <Text className={`ml-3 text-base ${baseTextColor}`}>
                      Chỉnh sửa chú thích
                    </Text>
                  </TouchableOpacity>

                  {/* Xóa bài viết */}
                  <TouchableOpacity
                    className={`flex-row items-center p-3`}
                    onPress={() => {
                      if (onDelete) onDelete();
                      onClose();
                    }}
                  >
                    <Icon name="trash-2" size={20} color="#ef4444" />
                    <Text className={`ml-3 text-base text-red-500 font-medium`}>
                      Xóa bài viết
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* -------------------- NÚT HỦY -------------------- */}
              {/* <TouchableOpacity
                className="mt-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl"
                onPress={onClose}
              >
                <Text className={`text-base font-bold text-center ${baseTextColor}`}>
                  Hủy
                </Text>
              </TouchableOpacity> */}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default PostOptionsModal;
