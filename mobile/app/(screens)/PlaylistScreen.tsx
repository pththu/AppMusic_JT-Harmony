import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigate } from "@/hooks/useNavigate";
import { useRoute } from "@react-navigation/native"; // Dùng để lấy data được truyền qua
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useTheme } from "@/components/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/custom/CustomButton";
import { router, useLocalSearchParams } from "expo-router";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { trackData } from "@/constants/data";
import SongItem from "@/components/items/SongItem";
import { usePlayerStore } from "@/store/playerStore";

export default function PlaylistScreen() {
  const colorScheme = useColorScheme();
  const [playlist, setPlaylist] = useState(null);
  const params = useLocalSearchParams();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const iconColor = colorScheme === 'light' ? '#000' : '#fff';

  useEffect(() => {
    const playlistData = params.playlist ? JSON.parse(params.playlist as string) : null;
    setPlaylist(playlistData);
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

  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong);
  const { navigate } = useNavigate();

  const handleSelectSong = (song) => {
    setCurrentSong(song);
    navigate('SongScreen');
  }

  const renderRecentlyPlayedItem = ({ item }: { item: (typeof trackData)[0]; }) => (
    <SongItem
      title={item.name}
      subtitle={item.artists.map(a => a).join(', ')} // Nối tên nghệ sĩ thành một chuỗi
      image={item.imageUrl || ''}
      onPress={() => handleSelectSong(item)} // Truyền cả mảng artists
      onOptionsPress={() => { }}
    />
  );

  const renderHeader = () => (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View className="mb-6 w-full h-64 items-center rounded-lg overflow-hidden shadow-black/30 shadow-lg">
        <Image
          source={{ uri: playlist?.imageUrl }}
          className="w-64 h-64 rounded-lg"
        />
      </View>
      <View className="flex-1 items-end justify-end">
        <View className="w-full h-full items-start justify-end gap-2">
          <Text className={`text-2xl font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
            {playlist?.name}
          </Text>
          {/* owner */}
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
            <Icon
              name={playlist?.isPublic ? "lock-closed-outline" : "lock-open-outline"}
              size={12} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
            />
            <Text className={`text-gray-300 text-sm mt-1 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {playlist?.totalTracks} bài hát
            </Text>
          </View>
          <View className="flex-row items-start justify-start gap-2">
            <Text className={`text-white text-wrap text-md ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {playlist?.description || ''}
            </Text>
          </View>
          <View className="flex-row justify-between items-center w-full">
            <View className="flex-row">
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
            <View className="flex-row items-center justify-start gap-2">
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
      </View>
      <Text className="text-black dark:text-white text-xl font-bold mb-4">
        Danh sách bài hát
      </Text>
    </Animated.View>
  );

  const renderSongItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center mb-4"
      onPress={() => { }}
    >
      <Image
        source={{ uri: item.imageUrl }}
        className="w-12 h-12 rounded-lg"
      />
      <View className="flex-1 ml-3">
        <Text className="text-black dark:text-white font-semibold" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm">
          {item.artist}
        </Text>
      </View>
      <Text className="text-gray-600 dark:text-gray-400 text-sm mr-2">
        {item.duration}
      </Text>
      <TouchableOpacity onPress={() => { }}>
        <Icon name="ellipsis-vertical" size={20} color={iconColor} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (!playlist) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-[#0E0C1F] justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải playlist...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1  ${colorScheme === 'dark' ? 'bg-[#0E0C1F]' : 'bg-white'}`}>
      {/* Header với nút Back */}
      <View className={`flex-row justify-between items-center mx-5`}>
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Icon name="arrow-back-outline" size={28} color={iconColor} />
        </TouchableOpacity>
      </View>

      {/* Danh sách bài hát */}
      <FlatList
        data={trackData}
        renderItem={renderRecentlyPlayedItem}
        keyExtractor={(item) => item.spotifyId}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }} // Tương đương 'px-5' của ScrollView
      />
    </SafeAreaView>
  );
}