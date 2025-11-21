import CustomButton from "@/components/custom/CustomButton";
import AlbumItem from "@/components/items/AlbumItem";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigate } from "@/hooks/useNavigate";
import useAuthStore from "@/store/authStore";
import ArtistItem from "@/components/artists/ArtistItem";
import { useCustomAlert } from "@/hooks/useCustomAlert";

import { useTheme } from "@/components/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import PlaylistItem from "@/components/items/PlaylistItem";
import { GetAlbumsForYou, GetArtistsForYou, GetMyPlaylists, GetPlaylistsForYou } from "@/services/musicService";
import { usePlayerStore } from "@/store/playerStore";
import { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";
import { GetFavoriteItemsGrouped } from "@/services/favoritesService";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useArtistStore } from "@/store/artistStore";
import { GetArtistFollowed } from "@/services/followService";
import { useNotificationStore } from "@/store/notificationStore";

export default function HomeScreen() {
  const { navigate } = useNavigate();
  const { theme } = useTheme();
  const { success, error } = useCustomAlert();
  const user = useAuthStore((state) => state.user);
  const isMiniPlayerVisible = usePlayerStore((state) => state.isMiniPlayerVisible);
  const setCurrentPlaylist = usePlayerStore((state) => state.setCurrentPlaylist);
  const setCurrentAlbum = usePlayerStore((state) => state.setCurrentAlbum);
  const setCurrentArtist = useArtistStore((state) => state.setCurrentArtist);
  const setMyPlaylists = usePlayerStore((state) => state.setMyPlaylists);
  const setFavoriteItems = useFavoritesStore((state) => state.setFavoriteItems);
  const setArtistFollowed = useArtistStore((state) => state.setArtistFollowed);
  const colorScheme = useColorScheme();
  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const greetingTranslateY = useRef(new Animated.Value(20)).current;
  const totalMarginBottom = isMiniPlayerVisible ? MINI_PLAYER_HEIGHT : 0;
  const iconColor = theme === 'light' ? '#000' : '#fff';
  const unreadNotificationCount = useNotificationStore((state) => state.unreadCount);
  const hasNotification = unreadNotificationCount > 0;

  const [queryParam, setQueryParam] = useState({
    playlistForYou: ["Chill Hits", "kpop", "tình yêu", "thời thanh xuân"],
    albumForYou: ["BTS", "Love Yourself", "buitruonglinh"],
    playlistTrending: ["Vietnam đang hot", "Thịnh Hành", "Viral 2025"],
    albumTrending: ["Adele", "Ed Sheeran", "mtp"],
    artistNames: ["BTS", "buitruonglinh", "Hoàng Dũng", "Taylor Swift"],
    genres: ["k-pop", "rock", "hip hop"],
  });
  const [dataForYou, setDataForYou] = useState({
    playlistsForYou: [],
    albumsForYou: [],
    playlistsTrending: [],
    albumsTrending: [],
    artistsForYou: [],
  });
  const [isLoading, setIsLoading] = useState({
    playlistForYou: true,
    albumsForYou: true,
    playlistTrending: true,
    albumsTrending: true,
    artistsForYou: true,
  });

  const handleSelectPlaylist = (playlist) => {
    setCurrentPlaylist(playlist);
    navigate("PlaylistScreen");
  };

  const handleSelectAlbum = (album) => {
    setCurrentAlbum(album);
    navigate("AlbumScreen");
  };

  const handleSelectArtist = (artist) => {
    setCurrentArtist(artist);
    navigate("ArtistScreen");
  }

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
    const fetchMyPlaylists = async () => {
      try {
        const response = await GetMyPlaylists();
        if (response.success) {
          setMyPlaylists(response.data);
        }
      } catch (error) {
        console.log("Lỗi khi lấy playlist của tôi:", error);
      }
    }

    const fetchPlaylistsForYou = async () => {
      try {
        const response = await GetPlaylistsForYou(queryParam.playlistForYou);
        if (response.success) {
          setDataForYou((prev) => ({
            ...prev,
            playlistsForYou: response.data
          }));
          setIsLoading((prev) => ({ ...prev, playlistForYou: false }));
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
          setIsLoading((prev) => ({ ...prev, albumsForYou: false }));
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
          setIsLoading((prev) => ({ ...prev, playlistTrending: false }));
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
          setIsLoading((prev) => ({ ...prev, albumsTrending: false }));
        }
      } catch (error) {
        console.log('Error fetching trending albums: ', error);
      }
    };

    const fetchArtistsForYou = async () => {
      try {
        const response = await GetArtistsForYou({
          artistNames: queryParam.artistNames,
          genres: queryParam.genres
        });
        if (response.success) {
          setDataForYou((prev) => ({
            ...prev,
            artistsForYou: response.data
          }));
          setIsLoading((prev) => ({ ...prev, artistsForYou: false }));
        }
      } catch (error) {
        console.log('Error fetching artists: ', error);
      }
    };

    const fetchFavoritesItem = async () => {
      try {
        const response = await GetFavoriteItemsGrouped();
        if (response.success) {
          setFavoriteItems(response.data);
        }
      } catch (error) {
        console.log('errorr fetch favorites: ', error);
      }
    }

    const fetchArtistFollowed = async () => {
      try {
        const response = await GetArtistFollowed();
        if (response.success) {
          setArtistFollowed(response.data);
        }
      } catch (error) {
        console.log('error fetch follow artist', error);
      }
    }

    fetchPlaylistsForYou()
    fetchAlbumsForYou()
    fetchTrendingPlaylists()
    fetchTrendingAlbums()
    fetchArtistsForYou()
    fetchMyPlaylists();
    fetchFavoritesItem();
    fetchArtistFollowed();
  }, []);

  return (
    <SafeAreaView
      className={`flex-1 pt-4 ${colorScheme === "dark" ? "bg-black" : "bg-white"} `}
      style={{ marginBottom: isMiniPlayerVisible ? MINI_PLAYER_HEIGHT : 0 }}
    >
      <View className={`fixed flex-row justify-between items-center mx-5 mb-4 `}>
        <Text className="text-black dark:text-white text-2xl font-bold">
          Hi, {String(user?.fullName || user?.username)} 👋
        </Text>
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4 relative" onPress={() => navigate('Activity')}>
            <Icon name="notifications-outline" size={28} color={iconColor} />
            {hasNotification && (
              <View className="absolute -top-1 -right-1 min-w-[16px] px-1 h-4 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-[10px] text-white font-semibold">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </Text>
              </View>
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
                  title="Phát"
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
          {isLoading.playlistForYou ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={dataForYou.playlistsForYou.filter((_, index) => index !== 0)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <PlaylistItem
                  item={item}
                  totalTrack={item.totalTracks || 0}
                  onPress={() => handleSelectPlaylist(item)}
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
          {isLoading.albumsForYou ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={dataForYou.albumsForYou.filter((_, index) => index !== 0)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <AlbumItem
                  title={item.name}
                  image={item.imageUrl}
                  onPress={() => handleSelectAlbum(item)}
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
          {isLoading.playlistTrending ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={dataForYou.playlistsTrending.filter((_, index) => index !== 0)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <PlaylistItem
                  item={item}
                  totalTrack={item.totalTracks || 0}
                  onPress={() => handleSelectPlaylist(item)}
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
          {isLoading.artistsForYou ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <FlatList
              data={dataForYou.artistsForYou}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <ArtistItem
                  name={item.name}
                  image={item?.imageUrl || item?.imgUrl}
                  onPress={() => handleSelectArtist(item)}
                />
              )}
            />
          )}
        </View>

        <View className="mb-6">
          <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
            Album phổ biến
          </Text>
          {isLoading.albumsTrending ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={dataForYou.albumsTrending.filter((_, index) => index !== 0)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <AlbumItem
                  title={item.name}
                  image={item.imageUrl}
                  onPress={() => handleSelectAlbum(item)}
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
