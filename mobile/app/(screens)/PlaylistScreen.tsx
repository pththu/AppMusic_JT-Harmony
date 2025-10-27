import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Pressable,
  // ScrollView, // Không dùng ScrollView thường nữa
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  StyleSheet, // Thêm StyleSheet
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigate } from "@/hooks/useNavigate";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import SongItem from "@/components/items/SongItem";
import { usePlayerStore } from "@/store/playerStore";
import { GetTracksByPlaylistId } from "@/services/musicService";

// Hằng số để xác định khi nào bắt đầu mờ/hiện header
// 256px là chiều cao của ảnh (h-64). Bạn có thể điều chỉnh
const HEADER_SCROLL_THRESHOLD = 256;

export default function PlaylistScreen() {
  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong);
  const { navigate } = useNavigate();
  const colorScheme = useColorScheme();
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const params = useLocalSearchParams();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const iconColor = colorScheme === 'light' ? '#000' : '#fff';
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const playlistData = params.playlist ? JSON.parse(params.playlist as string) : null;
    setPlaylist(playlistData);

    const fetchTracks = async () => {
      if (playlistData) {
        const response = await GetTracksByPlaylistId(playlistData.spotifyId);
        if (response.success) {
          setTracks(response.data);
          setIsLoading(false);
        }
      }
    };

    fetchTracks();
  }, []);

  useEffect(() => {
    if (playlist) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [playlist]);

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_THRESHOLD, HEADER_SCROLL_THRESHOLD + 30],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerBgOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_THRESHOLD / 2, HEADER_SCROLL_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleSelectSong = (song) => {
    setCurrentSong(song);
    navigate('SongScreen');
  }

  const renderRecentlyPlayedItem = ({ item, index }) => (
    <SongItem
      title={item.name}
      key={index}
      subtitle={item.artists.map(a => a.name).join(', ')}
      image={item.imageUrl || ''}
      onPress={() => handleSelectSong(item)}
      onOptionsPress={() => { }}
    />
  );

  const bgColor = colorScheme === 'dark' ? '#0E0C1F' : '#fff';

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }] }}
      className={`flex-1 ${colorScheme === 'dark' ? 'bg-[#0E0C1F]' : 'bg-white'}`}>
      <View>
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: bgColor,
            opacity: headerBgOpacity,
            zIndex: -1,
          }}
        />
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View className="flex-row justify-between items-center h-14 px-5">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Icon name="arrow-back-outline" size={28} color={iconColor} />
            </TouchableOpacity>
            <Animated.Text
              style={{ opacity: headerTitleOpacity }}
              className={`flex-1 text-center font-bold text-lg ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}
              numberOfLines={1}
            >
              {playlist?.name}
            </Animated.Text>
            <View className="w-8" />
          </View>
        </SafeAreaView>
      </View>
      <Animated.ScrollView
        className="flex-1"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View className="w-full h-64 items-center rounded-lg overflow-hidden">
          <Image
            source={{ uri: playlist?.imageUrl }}
            className="w-64 h-64 rounded-lg"
          />
        </View>
        <View className="px-4 mt-2 gap-2">
          <Text className={`text-2xl font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
            {playlist?.name}
          </Text>
          <View className="flex-row items-end justify-start gap-2">
            <Image
              source={{ uri: playlist?.owner?.imageUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg' }}
              className="w-5 h-5 rounded-full mt-2"
            />
            <Text className={`text-gray-300 text-sm mt-1 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {playlist?.owner?.name || 'không xác định'}
            </Text>
          </View>
          <View className="flex-row items-center justify-start gap-2">
            <MaterialIcons
              name={playlist?.isPublic ? "public" : "lock-outline"}
              size={12} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
            />
            <Text className={`text-gray-300 text-sm mt-1 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {playlist?.totalTracks} bài hát
            </Text>
          </View>
          <View className="flex-row items-start justify-start gap-2">
            <Text className={`text-white text-wrap text-md ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {playlist?.description || '...'}
            </Text>
          </View>
          <View className="flex-row justify-between items-center w-full">
            <View className="flex-row items-center justify-start gap-4">
              <Pressable onPress={() => { }}>
                <Ionicons
                  name="share-social"
                  color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                  size={22} />
              </Pressable>
              <Pressable onPress={() => { }}>
                <Ionicons
                  name="ellipsis-vertical"
                  color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                  size={22} />
              </Pressable>
            </View>
            <View className="flex-row items-center justify-start gap-4">
              <Pressable onPress={() => { }}>
                <Ionicons
                  name="shuffle"
                  color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                  size={24} />
              </Pressable>
              <Pressable onPress={() => { }}>
                <Ionicons
                  name="play-circle"
                  color="#22c55e"
                  size={48} />
              </Pressable>
            </View>
          </View>
        </View>
        <View className="px-4">
          <Text className="text-black dark:text-white text-xl font-bold mb-4">
            Danh sách bài hát
          </Text>
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải playlist...</Text>
            </View>
          ) : (
            tracks.map((item, index) => {
              return (
                renderRecentlyPlayedItem({ item, index })
              )
            })
          )}
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
}