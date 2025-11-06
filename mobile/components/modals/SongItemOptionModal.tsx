// components/modals/SongItemOptionModal.js
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  useColorScheme,
  Image,
  TouchableOpacity,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// Component OptionItem (Giữ nguyên từ code của bạn)
const OptionItem = ({ iconName, text, onPress, isDestructive = false, colorScheme }) => (
  <TouchableOpacity onPress={onPress} className="flex-row items-center py-4">
    <Feather
      name={iconName}
      size={24}
      color={isDestructive ? "#ef4444" : `${colorScheme === "dark" ? "#a0a0a0" : "#4b5563"}`}
    />
    <Text
      className={`text-base ml-5 font-medium ${isDestructive ? "text-red-500" : `${colorScheme === "dark" ? "text-white" : "text-black"}`}`}
    >
      {text}
    </Text>
  </TouchableOpacity>
);

// Modal cho SongItem
const SongItemOptionModal = ({
  isVisible,
  setIsVisible,
  track, // Dùng 'track' thay vì 'data'
  onAddToQueue,
  onAddToPlaylist,
  onViewAlbum,
  onRemoveFromPlaylist,
  onViewArtist,
  onShare,
  isMine, // Cần biết playlist này có phải của tôi không
}) => {
  const colorScheme = useColorScheme();
  const slideAnim = useRef(new Animated.Value(500)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Animate In
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]).start();
    } else {
      // Animate Out
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
        Animated.timing(slideAnim, { toValue: 500, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
      ]).start();
    }
  }, [isVisible]);

  const handleClose = () => setIsVisible(false);

  // Tối ưu: Không render gì cả nếu không visible
  if (!isVisible) {
    return null;
  }

  const artistName = track?.artists?.map(a => a?.name).join(', ');

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <Pressable onPress={handleClose} className="flex-1 justify-end">
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0, 0, 0, 0.5)", opacity: backdropOpacity }]} />
        <Animated.View style={[{ transform: [{ translateY: slideAnim }] }]}>
          {/* Ngăn modal đóng khi nhấn vào nội dung */}
          <Pressable onPress={() => { }} className={`${colorScheme === "dark" ? "bg-[#0B1215]" : "bg-white"} w-full rounded-t-2xl p-4 pb-6`}>
            <View className="w-12 h-0.5 bg-gray-500 rounded-full self-center mb-4" />

            {/* Thông tin bài hát */}
            <View className="flex-row items-center mb-4 px-2">
              <Image
                source={{ uri: track?.imageUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg' }}
                className="w-16 h-16 rounded-lg mr-4"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className={`text-lg font-bold ${colorScheme === "dark" ? "text-white" : "text-black"}`} numberOfLines={1}>
                  {track?.name}
                </Text>
                <Text className={`text-sm ${colorScheme === "dark" ? "text-gray-400" : "text-gray-500"}`} numberOfLines={1}>
                  {artistName}
                </Text>
              </View>
            </View>

            {/* Các tùy chọn */}
            <View className={`border-t ${colorScheme === 'dark' ? 'border-gray-600' : 'border-gray-200'} mb-4`}>
              <OptionItem text="Thêm vào hàng đợi" iconName="list" onPress={onAddToQueue} colorScheme={colorScheme} />
              <OptionItem text="Thêm vào playlist..." iconName="plus-circle" onPress={onAddToPlaylist} colorScheme={colorScheme} />
              <OptionItem text="Xem album" iconName="disc" onPress={onViewAlbum} colorScheme={colorScheme} />
              <OptionItem text="Xem nghệ sĩ" iconName="user" onPress={onViewArtist} colorScheme={colorScheme} />
              <OptionItem text="Chia sẻ" iconName="share-2" onPress={onShare} colorScheme={colorScheme} />
              {isMine && (
                <OptionItem text="Xóa khỏi playlist này" iconName="trash-2" onPress={onRemoveFromPlaylist} isDestructive={true} colorScheme={colorScheme} />
              )}
            </View>

            <TouchableOpacity
              onPress={handleClose}
              className="bg-[#22c55e] rounded-full py-3 items-center justify-center mt-2"
            >
              <Text className="text-white text-base font-bold">Đóng</Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

export default SongItemOptionModal;