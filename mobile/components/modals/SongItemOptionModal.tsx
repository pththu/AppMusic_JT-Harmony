// components/modals/SongItemOptionModal.js
import React, { useEffect, useRef, useState } from "react";
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
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Entypo, Feather } from "@expo/vector-icons";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { AddFavoriteItem, RemoveFavoriteItem } from "@/services/favoritesService";

const screenHeight = Dimensions.get("window").height;

// Component OptionItem (Giữ nguyên từ code của bạn)
const OptionItem = ({ iconName, text, onPress, isDestructive = false, colorScheme, isFavorite = false }) => (
  <TouchableOpacity onPress={onPress} className="flex-row items-center py-4">
    <Entypo
      name={iconName}
      size={24}
      color={isDestructive ? "#ef4444" : (isFavorite ? "#ef4444" : (colorScheme === "dark" ? "white" : "black"))}
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
  onViewAlbum = () => { },
  onRemoveFromPlaylist = () => { },
  onViewArtist,
  onShare,
  isMine, // Cần biết playlist này có phải của tôi không
}) => {
  const colorScheme = useColorScheme();
  const { info, error, success } = useCustomAlert();
  const favoriteItems = useFavoritesStore((state) => state.favoriteItems);
  const addFavoriteItem = useFavoritesStore((state) => state.addFavoriteItem);
  const removeFavoriteItem = useFavoritesStore((state) => state.removeFavoriteItem);
  const slideAnim = useRef(new Animated.Value(500)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUnFavorite = async () => {
    try {
      console.log('un')
      setIsLoading(true);
      const favoriteItem = favoriteItems.find(
        (item) => item?.itemType === 'track' && (item?.itemId === track?.id || item?.itemSpotifyId === track?.spotifyId)
      );

      if (!favoriteItem) {
        error('Bài hát không có trong mục yêu thích.');
        return;
      }

      const response = await RemoveFavoriteItem(favoriteItem.id);
      if (response.success) {
        removeFavoriteItem(favoriteItem);
        setIsFavorite(false);
        setIsLoading(false);
      }
    } catch (err) {
      console.log(err);
      error('Lỗi khi xóa bài hát khỏi mục yêu thích.');
    } finally {
      setIsVisible(false);
    }
  };

  const handleFavorite = async () => {
    try {
      setIsLoading(true);
      console.log('fav')
      const response = await AddFavoriteItem({
        itemType: 'track',
        itemId: track.id,
        itemSpotifyId: track.spotifyId
      });
      if (response.success) {
        setIsFavorite(true);
        setIsLoading(false);
        console.log('response.data ui', response.data)
        addFavoriteItem(response.data[0]);
      }
    } catch (err) {
      console.log(err)
      error('Lỗi khi thêm bài hát vào mục yêu thích.');
    } finally {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    // console.log('current', track);
    if (favoriteItems) {
      const isFavorite = favoriteItems.some(
        (item) => item?.itemType === 'track' && (item?.itemSpotifyId === track?.spotifyId || (track?.id !== null && item?.itemId === track?.id))
      );
      setIsFavorite(isFavorite);
    }
  }, []);

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
      {isLoading && (
        <View className="absolute top-0 right-0 left-0 bottom-0 z-10 bg-black/50 justify-center items-center"
          style={{
            height: screenHeight
          }}
        >
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      )}
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
              <OptionItem text="Yêu thích" iconName="heart" onPress={isFavorite ? handleUnFavorite : handleFavorite} colorScheme={colorScheme} isFavorite={isFavorite} />
              <OptionItem text="Thêm vào hàng đợi" iconName="add-to-list" onPress={onAddToQueue} colorScheme={colorScheme} />
              <OptionItem text="Thêm vào playlist..." iconName="circle-with-plus" onPress={onAddToPlaylist} colorScheme={colorScheme} />
              <OptionItem text="Xem album" iconName="book" onPress={onViewAlbum} colorScheme={colorScheme} />
              <OptionItem text="Xem nghệ sĩ" iconName="user" onPress={onViewArtist} colorScheme={colorScheme} />
              <OptionItem text="Chia sẻ" iconName="share" onPress={onShare} colorScheme={colorScheme} />
              {isMine && (
                <OptionItem text="Xóa khỏi playlist này" iconName="trash" onPress={onRemoveFromPlaylist} isDestructive={true} colorScheme={colorScheme} />
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