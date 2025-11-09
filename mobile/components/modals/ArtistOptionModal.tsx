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
import React, { useEffect, useRef, useState } from "react";
import { Feather } from "@expo/vector-icons";

// --- Bắt đầu Component OptionItem (Giữ nguyên) ---
const OptionItem = ({ iconName, text, onPress, isDestructive = false, colorScheme }) => (
  <TouchableOpacity onPress={onPress} className="flex-row items-center py-4">
    <Feather
      name={iconName}
      size={24}
      color={isDestructive ? "#ef4444" : `${colorScheme === "dark" ? "#a0a0a0" : "#4b5563"}`}
    />
    <Text
      className={`text-base ml-5 font-medium 
        ${isDestructive ? "text-red-500" : `${colorScheme === "dark" ? "text-white" : "text-black"}`}`}
    >
      {text}
    </Text>
  </TouchableOpacity>
);
// --- Kết thúc Component OptionItem ---


// --- Bắt đầu ArtistOptionModal ---
const ArtistOptionModal = ({
  isVisible,
  setIsVisible,
  data, // Đây là object 'artist'
  isFollowing = false,
  onFollow = () => { },
  onShare = () => { },
  onBlock = () => { },
}) => {

  const colorScheme = useColorScheme();
  const animationDuration = 350;
  // slideAnim: 0 = hiện, 500 = ẩn
  const slideAnim = useRef(new Animated.Value(500)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  // State này dùng để render modal trước khi animation chạy
  const [actuallyVisible, setActuallyVisible] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      // Nếu modal được set là visible
      setActuallyVisible(true); // 1. Mount component
      // 2. Chạy animation "hiện"
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: animationDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0, // Trượt vào
          duration: animationDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Nếu modal được set là invisible
      // 1. Chạy animation "ẩn"
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: animationDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 500, // Trượt ra
          duration: animationDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 2. Unmount component SAU KHI animation kết thúc
        setActuallyVisible(false);
      });
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false); // Kích hoạt useEffect
  };

  // Nếu chưa mount, không render gì
  if (!actuallyVisible) {
    return null;
  }

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={actuallyVisible}
      onRequestClose={handleClose}
    >
      {/* Lớp nền mờ */}
      <Pressable
        onPress={handleClose}
        className="flex-1 justify-end"
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0, 0, 0, 0.5)" },
            { opacity: backdropOpacity },
          ]}
        />

        {/* Nội dung Modal (trượt lên) */}
        <Animated.View
          style={[
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View className={`${colorScheme === "dark" ? "bg-[#0B1215]" : "bg-white"}`}>
            {/* Thêm Pressable ở đây để ngăn việc nhấn vào modal bị "click xuyên" */}
            <Pressable
              onPress={() => { }}
              className={`w-full rounded-t-2xl p-4 pb-6`}
            >
              {/* Tay nắm */}
              <View className="w-12 h-0.5 bg-gray-500 rounded-full self-center mb-4" />

              {/* Header thông tin Artist */}
              <View className="flex-row items-center mb-4 px-2">
                <Image
                  source={{ uri: data?.imageUrl }}
                  className="w-16 h-16 rounded-lg mr-4"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text className={`text-lg font-bold ${colorScheme === "dark" ? "text-white" : "text-black"}`} >
                    {data?.name}
                  </Text>
                  <Text className={`text-sm ${colorScheme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Nghệ sĩ
                  </Text>
                </View>
              </View>

              {/* Danh sách tùy chọn */}
              <View className={`border-t ${colorScheme === 'dark' ? 'border-gray-600' : 'border-gray-200'} mb-4`}>
                <OptionItem
                  text={isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
                  iconName={isFollowing ? "user-check" : "user-plus"}
                  onPress={onFollow}
                  colorScheme={colorScheme}
                  isDestructive={isFollowing} // "Bỏ theo dõi" là hành động destructive
                />
                <OptionItem
                  text="Chia sẻ"
                  iconName="share-2"
                  onPress={onShare}
                  colorScheme={colorScheme}
                />
                <OptionItem
                  text="Chặn nhạc của nghệ sĩ này"
                  iconName="slash" // Icon "cấm"
                  onPress={onBlock}
                  isDestructive={true} // Hành động destructive
                  colorScheme={colorScheme}
                />
              </View>

              {/* Nút đóng */}
              <TouchableOpacity
                onPress={handleClose}
                className="bg-[#22c55e] rounded-full py-3 items-center justify-center mt-2"
              >
                <Text className="text-white text-base font-bold">Đóng</Text>
              </TouchableOpacity>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default ArtistOptionModal;