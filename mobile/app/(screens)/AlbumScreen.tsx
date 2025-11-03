import { View, Text, useColorScheme, Animated, Image, Pressable, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { usePlayerStore } from '@/store/playerStore';
import { useNavigate } from '@/hooks/useNavigate';
import SongItem from '@/components/items/SongItem';
import { Ionicons } from '@expo/vector-icons';
import Icon from "react-native-vector-icons/Ionicons";
import { GetTracksByAlbumId } from '@/services/musicService';

const HEADER_SCROLL_THRESHOLD = 256;

const AlbumScreen = () => {
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const params = useLocalSearchParams();

  const { navigate } = useNavigate();
  const colorScheme = useColorScheme();
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const iconColor = colorScheme === 'light' ? '#000' : '#fff';
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const albumData = params.album ? JSON.parse(params.album as string) : null;
    setAlbum(albumData);

    const fetchTracks = async () => {
      if (albumData) {
        const response = await GetTracksByAlbumId(albumData.spotifyId);
        if (response.success) {
          response.data?.map(track => {
            track.imageUrl = albumData.imageUrl;
          })
          setTracks(response.data);
          setIsLoading(false);
        }
      }
    };

    fetchTracks();
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

  const handleSelectTrack = (track) => {
    setCurrentTrack(track);
    navigate('SongScreen');
  }

  const renderRecentlyPlayedItem = ({ item, index }) => (
    <SongItem
      item={item}
      key={index}
      image={item?.imageUrl || ''}
      onPress={() => handleSelectTrack(item)}
      onOptionsPress={() => { }}
    />
  );

  const bgColor = colorScheme === 'dark' ? '#0E0C1F' : '#fff';

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }] }}
      className={`flex-1 top-0 ${colorScheme === 'dark' ? 'bg-[#0E0C1F]' : 'bg-white'}`}>
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
              {album?.name}
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
        <View className="w-full h-64 items-center rounded-lg ">
          <Image
            source={{ uri: album?.imageUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg' }}
            className="w-64 h-64 rounded-lg"
          />
        </View>
        <View className="px-4 mt-2 gap-2">
          <Text className={`text-2xl font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
            {album?.name}
          </Text>
          <View className="flex-row items-end justify-start gap-2">
            <Image
              source={{ uri: album?.artists[0]?.imageUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg' }}
              className="w-5 h-5 rounded-full mt-2"
            />
            <Text className={`text-gray-300 text-sm mt-1 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {album?.artists.length > 1 ? 'Nhiều nghệ sĩ' : album?.artists[0]?.name || 'Không xác định'}
            </Text>
          </View>
          <View className="flex-row items-center justify-start gap-2">
            <Text className={`text-gray-300 text-sm mt-1 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
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
        <View className="px-4">
          <Text className="text-black dark:text-white text-xl font-bold mb-4">
            Danh sách bài hát
          </Text>
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải album...</Text>
            </View>
          ) : (
            tracks?.map((item, index) => {
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

export default AlbumScreen