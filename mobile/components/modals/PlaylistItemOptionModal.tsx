import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  useColorScheme,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";

// Component con cho từng lựa chọn trong Modal
const OptionButton = ({ iconName, text, onPress }) => {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "text-white" : "text-black";
  const iconColor = colorScheme === "dark" ? "white" : "black";

  return (
    <TouchableOpacity
      className="flex-row items-center p-4 w-full"
      onPress={onPress}
    >
      <Icon name={iconName} size={24} color={iconColor} />
      <Text className={`ml-4 text-lg ${textColor}`}>{text}</Text>
    </TouchableOpacity>
  );
};

const PlaylistItemOptionModal = ({
  isVisible,
  onClose,
  isMyPlaylist,
  onEdit,
  onDelete,
  onRemoveFromSaved,
  onShare,
  onAddToPlaylist,
  onAddToQueue,
  playlistName = "playlist",
  imageUrl = "https://res.cloudinary.com/chaamz03/image/upload/v1761533935/kltn/playlist_default.png",
}) => {
  const colorScheme = useColorScheme();
  const modalBg = colorScheme === "dark" ? "bg-gray-900" : "bg-white";
  const textColor = colorScheme === "dark" ? "text-white" : "text-black";

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <SafeAreaView>
          <Pressable
            className={`${modalBg} rounded-t-2xl p-4`}
            onPress={() => { }}
          >
            <View className="w-12 h-0.5  self-center bg-gray-400 rounded-full mb-3" />
            <View className="w-full h-20 flex-row items-center mb-4 px-2">
              <Image
                source={{ uri: imageUrl }}
                className="w-16 h-16 rounded-lg mr-4"
                resizeMode="cover"
              />
              <Text className={`text-md flex-1 font-bold ${colorScheme === "dark" ? "text-white" : "text-black"}`} >
                {playlistName}
              </Text>
            </View>

            {isMyPlaylist ? (
              <>
                <OptionButton
                  iconName="pencil-outline"
                  text="Chỉnh sửa thông tin"
                  onPress={onEdit}
                />
                <OptionButton
                  iconName="trash-outline"
                  text="Xóa danh sách phát"
                  onPress={onDelete}
                />
              </>
            ) : (
              // Lựa chọn cho playlist "Đã lưu"
              <OptionButton
                iconName="remove-circle-outline"
                text="Xóa khỏi danh sách đã lưu"
                onPress={onRemoveFromSaved}
              />
            )}

            {/* Lựa chọn chung */}
            <OptionButton
              iconName="share-social-outline"
              text="Chia sẻ"
              onPress={onShare}
            />
            <OptionButton
              iconName="add-circle-outline"
              text="Thêm vào playlist"
              onPress={onAddToPlaylist}
            />
            <OptionButton
              iconName="list"
              text="Thêm vào hàng đợi"
              onPress={onAddToQueue}
            />
            {/* Nút Hủy */}
            <TouchableOpacity
              className={`mt-4 items-center p-4 bg-[#22c55e] rounded-full`}
              onPress={onClose}
            >
              <Text className={`font-bold text-lg text-white`}>Đóng</Text>
            </TouchableOpacity>
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
};

export default PlaylistItemOptionModal;