import CustomButton from "@/components/custom/CustomButton";
import AlbumItem from "@/components/items/AlbumItem";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Button,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigate } from "@/hooks/useNavigate";
import useAuthStore from "@/store/authStore";
import { artistData } from "@/constants/data";
import ArtistItem from "@/components/artists/ArtistItem";
import { useCustomAlert } from "@/hooks/useCustomAlert";

import { useTheme } from "@/components/ThemeContext";
import { GetAlbumsForYou, GetArtistsForYou, GetPlaylistsForYou } from "@/services/musicService";
import { set } from "date-fns";
import { da, tr } from "date-fns/locale";
import { SafeAreaView } from "react-native-safe-area-context";

// const tabs = [
//   { id: "forYou", label: "Dành cho bạn" },
//   { id: "trending", label: "Thịnh hành" }
// ];

export default function HomeScreen() {
  const { navigate } = useNavigate();
  const { theme } = useTheme();
  const { success, error } = useCustomAlert();
  const user = useAuthStore((state) => state.user);
  const colorScheme = useColorScheme();
  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const greetingTranslateY = useRef(new Animated.Value(20)).current;
  const [hasNotification] = useState(true);

  const iconColor = theme === 'light' ? '#000' : '#fff';

  const [queryParam, setQueryParam] = useState({
    playlistForYou: ["Chill Hits", "kpop", "tình yêu", "thời thanh xuân"],
    albumForYou: ["BTS", "love", "2025"],
    playlistTrending: ["Vietnam đang hot", "Thịnh Hành", "Viral 2025"],
    albumTrending: ["Adele", "Ed Sheeran", "2025"],
    artistName: ["bts", "buitruonglinh", "Hoàng Dũng"],
  });
  const [dataForYou, setDataForYou] = useState({
    playlistsForYou: [],
    albumsForYou: [],
    playlistsTrending: [],
    albumsTrending: [],
    artistsForYou: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(greetingOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(greetingTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [greetingOpacity, greetingTranslateY]);

  const formatDescription = (description: string) => {
    const maxLength = 100;
    if (description.length > maxLength) {
      return description.substring(0, maxLength - 3) + '...';
    }
    return description;
  };

  useEffect(() => {
    const fetchPlaylistsForYou = async () => {
      try {
        const response = await GetPlaylistsForYou(queryParam.playlistForYou);
        if (response.success) {
          setDataForYou((prev) => ({
            ...prev,
            playlistsForYou: response.data
          }));
        }
      } catch (error) {
        console.log('Error fetching playlists: ', error);
      }
    };

    const fetchAlbumsForYou = async () => {
      try {
        const response = await GetAlbumsForYou(queryParam.albumForYou);
        if (response.success) {
          setDataForYou((prev) => ({
            ...prev,
            albumsForYou: response.data
          }));
        }
      } catch (error) {
        console.log('Error fetching albums: ', error);
      }
    };

    const fetchTrendingPlaylists = async () => {
      try {
        const response = await GetPlaylistsForYou(queryParam.playlistTrending);
        if (response.success) {
          setDataForYou((prev) => ({
            ...prev,
            playlistsTrending: response.data
          }));
        }
      } catch (error) {
        console.log('Error fetching trending playlists: ', error);
      }
    };

    const fetchTrendingAlbums = async () => {
      try {
        const response = await GetAlbumsForYou(queryParam.albumTrending);
        if (response.success) {
          setDataForYou((prev) => ({
            ...prev,
            albumsTrending: response.data
          }));
        }
      } catch (error) {
        console.log('Error fetching trending albums: ', error);
      }
    };

    const fetchArtistsForYou = async () => {
      try {
        const response = await GetArtistsForYou(queryParam.artistName);
        if (response.success) {
          console.log('artist', response.data[0]);
          setDataForYou((prev) => ({
            ...prev,
            artistsForYou: response.data
          }));
        }
      } catch (error) {
        console.log('Error fetching artists: ', error);
      }
    };

    Promise.all([
      fetchPlaylistsForYou(),
      fetchAlbumsForYou(),
      fetchTrendingPlaylists(),
      fetchTrendingAlbums(),
      fetchArtistsForYou()
    ]).finally(() => setIsLoading(false));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0E0C1F]">
      <View className={`fixed flex-row justify-between items-center mx-5 mb-4 `}>
        <Text className="text-black dark:text-white text-2xl font-bold">
          Hi, {String(user?.fullName || user?.username)} 👋
        </Text>
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4 relative">
            <Icon name="notifications-outline" size={28} color={iconColor} />
            {hasNotification && (
              <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigate("Profile")}>
            <Image
              source={{ uri: user?.avatarUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg' }}
              className="w-10 h-10 rounded-full"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        {/* Featuring Today Card */}
        <View className="mb-6 w-full h-64 rounded-lg overflow-hidden">
          <ImageBackground
            source={{ uri: dataForYou.playlistsForYou[0]?.imageUrl }}
            className="w-full h-full justify-end"
            resizeMode="cover"
          >
            <View className="flex-1 items-end justify-end bg-black/50">
              <View className="p-4 w-full h-full items-start justify-end">
                <Text className="text-white text-xl font-bold">
                  {dataForYou.playlistsForYou[0]?.name}
                </Text>
                <Text className="text-gray-300 text-wrap text-sm">
                  {formatDescription(dataForYou.playlistsForYou[0]?.description || '')}
                </Text>
                <CustomButton
                  title="Play"
                  onPress={() => { }}
                  className="mt-2 bg-green-500 px-4 py-2 rounded-full"
                />
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Recently Played Horizontal List */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
              Danh sách phát đề xuất cho bạn
            </Text>
          </View>
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={dataForYou.playlistsForYou.filter((_, index) => index !== 0)}
              keyExtractor={(item) => item.spotifyId}
              renderItem={({ item }) => (
                <AlbumItem
                  title={item.name}
                  image={item.imageUrl}
                  onPress={() => { }}
                />
              )}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>

        <View className="mb-6">
          <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
            Album chọn lọc dành cho bạn
          </Text>
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={dataForYou.albumsForYou.filter((_, index) => index !== 0)}
              keyExtractor={(item) => item.spotifyId}
              renderItem={({ item }) => (
                <AlbumItem
                  title={item.name}
                  image={item.imageUrl}
                  onPress={() => { }}
                />
              )}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>

        <View className="mb-6">
          <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
            Danh sách phát thịnh hành
          </Text>
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={dataForYou.playlistsTrending.filter((_, index) => index !== 0)}
              keyExtractor={(item) => item.spotifyId}
              renderItem={({ item }) => (
                <AlbumItem
                  title={item.name}
                  image={item.imageUrl}
                  onPress={() => { }}
                />
              )}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>

        <View className="mb-6">
          <Text className={`text-lg font-bold mb-4 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
            Nghệ sĩ bạn phù hợp với bạn
          </Text>
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <FlatList
              data={dataForYou.artistsForYou}
              horizontal
              keyExtractor={(item) => item.spotifyId}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <ArtistItem
                  name={item.name}
                  image={item?.imageUrl || item?.imgUrl}
                  onPress={() =>
                    navigate("ArtistScreen", { artist: JSON.stringify(item) })
                  }
                />
              )}
            />
          )}
        </View>

        <View className="mb-6">
          <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
            Album phổ biến
          </Text>
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={dataForYou.albumsTrending.filter((_, index) => index !== 0)}
              keyExtractor={(item) => item.spotifyId}
              renderItem={({ item }) => (
                <AlbumItem
                  title={item.name}
                  image={item.imageUrl}
                  onPress={() => { }}
                />
              )}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
