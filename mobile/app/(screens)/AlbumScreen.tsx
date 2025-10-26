import { View, Text, useColorScheme, Animated, Image, Pressable, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router';
import { usePlayerStore } from '@/store/playerStore';
import { useNavigate } from '@/hooks/useNavigate';
import SongItem from '@/components/items/SongItem';
import { Ionicons } from '@expo/vector-icons';
import { albumData, trackData } from '@/constants/data';
import Icon from "react-native-vector-icons/Ionicons";

const AlbumScreen = () => {
  const params = useLocalSearchParams();
  const [album, setAlbum] = useState(null);
  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong);
  const { navigate } = useNavigate();
  const colorScheme = useColorScheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const iconColor = colorScheme === 'light' ? '#000' : '#fff';


  useEffect(() => {
    const albumData = params.album ? JSON.parse(params.album as string) : null;
    setAlbum(albumData);
  }, []);

  useEffect(() => {
    if (album) {
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
  }, [album]);

  const handleSelectSong = (song) => {
    setCurrentSong(song);
    navigate('SongScreen');
  }

  const renderRecentlyPlayedItem = ({ item }) => (
    <SongItem
      title={item?.name}
      subtitle={item?.artists.map(a => a).join(', ')} // Nối tên nghệ sĩ thành một chuỗi
      image={item?.imageUrl || ''}
      onPress={() => handleSelectSong(item)} // Truyền cả mảng artists
      onOptionsPress={() => { }}
    />
  );

  const renderHeader = () => (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View className="mb-6 w-full h-64 items-center rounded-lg overflow-hidden shadow-black/30 shadow-lg">
        <Image
          source={{ uri: album?.imageUrl }}
          className="w-64 h-64 rounded-lg"
        />
      </View>
      <View className="flex-1 items-end justify-end">
        <View className="w-full h-full items-start justify-end gap-2">
          <Text className={`text-2xl font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
            {album?.name}
          </Text>
          {/* owner */}
          <View className="flex-row items-end justify-start gap-2">
            <Image
              source={{ uri: album?.artists[0]?.imageUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg' }}
              className="w-5 h-5 rounded-full mt-2"
            />
            <Text className={`text-gray-300 text-sm mt-1 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {album?.artists.length > 1 ? "Nhiều nghệ sĩ" : album?.artists[0]?.name || 'không xác định'}
            </Text>
          </View>
          <View className="flex-row items-center justify-start gap-2">
            <Text className={`text-gray-300 text-sm mt-1 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray600'}`}>
              {album?.totalTracks} bài hát
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
      </View>
      <Text className="text-black dark:text-white text-xl font-bold mb-4">
        Danh sách bài hát
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView className={`flex-1  ${colorScheme === 'dark' ? 'bg-[#0E0C1F]' : 'bg-white'}`}>
      {/* Header với nút Back */}
      <View className={`flex-row justify-between items-center mx-5`}>
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Icon name="arrow-back-outline" size={28} color={iconColor} />
        </TouchableOpacity>
      </View>

      {/* Danh sách bài hát */}
      {albumData ? (
        <FlatList
          data={trackData}
          renderItem={renderRecentlyPlayedItem}
          keyExtractor={(item) => item.spotifyId}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải playlist...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

export default AlbumScreen