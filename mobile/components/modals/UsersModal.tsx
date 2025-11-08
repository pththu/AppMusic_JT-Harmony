import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";

interface UsersModalProps {
  isVisible: boolean;
  onClose: () => void;
  users: any[];
  loadingUsers: boolean;
  colorScheme: "light" | "dark" | null;
  onOpenRestrictedModal: () => void;
  onStartLongPress: (user: any) => void;
  onCancelLongPress: () => void;
}

export default function UsersModal({
  isVisible,
  onClose,
  users,
  loadingUsers,
  colorScheme,
  onOpenRestrictedModal,
  onStartLongPress,
  onCancelLongPress,
}: UsersModalProps) {
  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <SafeAreaView
          className={`flex-1 ${colorScheme === "dark" ? "bg-gray-900" : "bg-white"}`}
        >
          <TouchableWithoutFeedback>
            {/* Header modal */}
            <View
              className={`flex-row items-center justify-between p-4 border-b ${
                colorScheme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <TouchableOpacity onPress={onClose} className="p-2">
                <Icon
                  name="x"
                  size={24}
                  color={colorScheme === "dark" ? "white" : "black"}
                />
              </TouchableOpacity>
              <Text
                className={`text-xl font-bold ${
                  colorScheme === "dark" ? "text-white" : "text-black"
                }`}
              >
                Chọn người dùng
              </Text>
              <TouchableOpacity onPress={onOpenRestrictedModal} className="p-2">
                <Icon
                  name="user-x"
                  size={24}
                  color={colorScheme === "dark" ? "white" : "black"}
                />
              </TouchableOpacity>
            </View>

            {/* Danh sách users */}
            {loadingUsers ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#4F46E5" />
              </View>
            ) : (
              <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPressIn={() => onStartLongPress(item)}
                    onPressOut={onCancelLongPress}
                    className={`flex-row items-center px-4 py-3 border-b ${
                      colorScheme === "dark"
                        ? "border-gray-700"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      source={{
                        uri: item.avatarUrl || "https://via.placeholder.com/60",
                      }}
                      className="w-12 h-12 rounded-full mr-4 bg-gray-300"
                    />
                    <View className="flex-1">
                      <Text
                        className={`text-lg font-bold ${
                          colorScheme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {item.fullName}
                      </Text>
                      <Text
                        className={`text-sm ${
                          colorScheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        @{item.username}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
