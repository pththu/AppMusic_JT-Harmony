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
import { da } from "date-fns/locale";



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

const PlaylistOptionModal = ({
  isVisible,
  setIsVisible,
  data,
  onAddToPlaylist = () => { },
  onShare = () => { },
  onDownload = () => { },
  onEdit = () => { },
  onDelete = () => { },
  onAddTrack = () => { },
  onAddToQueue = () => { },
}) => {

  const colorScheme = useColorScheme();
  const animationDuration = 350;
  const slideAnim = useRef(new Animated.Value(500)).current; // slideAnim: 0 = hiện, 500 = ẩn
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [actuallyVisible, setActuallyVisible] = useState(isVisible);

  useEffect(() => {
    setActuallyVisible(true);
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
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
  };

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

        <Animated.View
          style={[
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View className={`${colorScheme === "dark" ? "bg-[#0B1215]" : "bg-white"}`}>
            <Pressable
              onPress={() => { }}
              className={`w-full rounded-t-2xl p-4 pb-6`}
            >
              <View className="w-12 h-0.5 bg-gray-500 rounded-full self-center mb-4" />
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
                    {data?.totalTracks || 0} bài hát • tạo bởi {data?.owner?.name || 'không xác định'}
                  </Text>
                </View>
              </View>

              <View className={`border-t ${colorScheme === 'dark' ? 'border-gray-600' : 'border-gray-200'} mb-4`}>
                {data?.id && <OptionItem text="Chỉnh sửa playlist" iconName="edit-3" onPress={onEdit} colorScheme={colorScheme} />}
                <OptionItem text="Thêm vào playlist khác" iconName="plus-circle" onPress={onAddToPlaylist} colorScheme={colorScheme} />
                <OptionItem text="Thêm vào hàng đợi" iconName="list" onPress={onAddToQueue} colorScheme={colorScheme} />
                {data?.id && <OptionItem text="Thêm bài hát" iconName="plus" onPress={onAddTrack} colorScheme={colorScheme} />}
                <OptionItem text="Tải xuống" iconName="download-cloud" onPress={onDownload} colorScheme={colorScheme} />
                <OptionItem text="Chia sẻ" iconName="share-2" onPress={onShare} colorScheme={colorScheme} />
                {data?.id && <OptionItem text="Xóa playlist" iconName="trash-2" onPress={onDelete} isDestructive={true} colorScheme={colorScheme} />}
              </View>

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

export default PlaylistOptionModal;