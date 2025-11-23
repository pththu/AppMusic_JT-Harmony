import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import FollowItem from "../items/FollowItem";

// FollowListModal
export default function FollowListModal({
  data,
  visible,
  onClose,
  listType,
  handleToggleFollow = (user, isFollowing) => { }
}) {
  const colorScheme = useColorScheme();
  const title = listType === "followers" ? "Người Theo Dõi" : "Đang Theo Dõi"; // Tiêu đề modal

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
                  {title}
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
              <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <FollowItem
                    user={item}
                    onCloseModal={onClose}
                    onToggleFollow={handleToggleFollow}
                  />
                )}
                ListEmptyComponent={() => (
                  <View className="p-8 items-center">
                    <Text className="text-gray-500 dark:text-gray-400">
                      Không có ai trong danh sách này.
                    </Text>
                  </View>
                )}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
