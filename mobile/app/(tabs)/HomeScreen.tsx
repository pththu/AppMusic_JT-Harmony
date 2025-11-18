import CustomButton from "@/components/custom/CustomButton";
import AlbumItem from "@/components/items/AlbumItem";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
import ArtistItem from "@/components/artists/ArtistItem";
import { useCustomAlert } from "@/hooks/useCustomAlert";

import { useTheme } from "@/components/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import PlaylistItem from "@/components/items/PlaylistItem";
import { GetAlbumsForYou, GetArtistsForYou, GetMyPlaylists, GetPlaylistsForYou, GetTracksByPlaylistId } from "@/services/musicService";
import { usePlayerStore } from "@/store/playerStore";
import { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";
import { GetFavoriteItemsGrouped } from "@/services/favoritesService";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useArtistStore } from "@/store/artistStore";
import { GetArtistFollowed } from "@/services/followService";
import { GetListeningHistory, GetSearchHistory, SaveToListeningHistory } from "@/services/historiesService";
import { useHistoriesStore } from "@/store/historiesStore";
import { GetRecommendationsByUser } from "@/services/recommendationService";
import { SearchTracks } from "@/services/searchService";
import { useBoardingStore } from "@/store/boardingStore";


const ACTIVITIES = [
  { id: 'workout', label: 'Tập luyện', icon: 'barbell-outline' },
  { id: 'study', label: 'Học tập', icon: 'school-outline' },
  { id: 'commute', label: 'Di chuyển', icon: 'bus-outline' },
  { id: 'sleep', label: 'Ngủ', icon: 'moon-outline' },
  { id: 'party', label: 'Tiệc tùng', icon: 'musical-notes-outline' },
  { id: 'gaming', label: 'Chơi game', icon: 'game-controller-outline' },
  { id: 'relax', label: 'Thư giãn', icon: 'leaf-outline' },
  { id: 'focus', label: 'Tập trung', icon: 'eye-outline' },
  { id: 'running', label: 'Chạy bộ', icon: 'walk-outline' },
  { id: 'yoga', label: 'Yoga', icon: 'body-outline' },
  { id: 'cooking', label: 'Nấu ăn', icon: 'restaurant-outline' },
  { id: 'reading', label: 'Đọc sách', icon: 'book-outline' },
  { id: 'meditation', label: 'Thiền', icon: 'medkit-outline' },
  { id: 'driving', label: 'Lái xe', icon: 'car-outline' },
];

const ArtistItemHome = ({ name, image, onPress }) => {

  const colorScheme = useColorScheme();
  const imageDefault = 'https://res.cloudinary.com/chaamz03/image/upload/v1763270755/kltn/JT_Harmony_aoi1iv.png';
  return (
    <TouchableOpacity className="items-center mr-4 mb-4" onPress={onPress}>
      <Image source={{ uri: image || imageDefault }} className="w-32 h-32 rounded-full mb-1 border-2 border-green-400" />
      <Text className={`text-${colorScheme === "dark" ? "white" : "black"} text-sm text-center w-16`} numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {

  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const { theme } = useTheme();
  const { info, error, success, confirm, warning } = useCustomAlert();
  const listTrack = usePlayerStore((state) => state.listTrack);
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isGuest = useAuthStore((state) => state.isGuest);
  const isMiniPlayerVisible = usePlayerStore((state) => state.isMiniPlayerVisible);
  const currentPlaylist = usePlayerStore((state) => state.currentPlaylist);
  const selectedMood = useBoardingStore((state) => state.selectedMood);
  const selectedActivity = useBoardingStore((state) => state.selectedActivity);
  const recommendBasedOnActivity = useBoardingStore((state) => state.recommendBasedOnActivity);
  const setCurrentPlaylist = usePlayerStore((state) => state.setCurrentPlaylist);
  const setCurrentAlbum = usePlayerStore((state) => state.setCurrentAlbum);
  const setCurrentArtist = useArtistStore((state) => state.setCurrentArtist);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setListTrack = usePlayerStore((state) => state.setListTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const setMyPlaylists = usePlayerStore((state) => state.setMyPlaylists);
  const setFavoriteItems = useFavoritesStore((state) => state.setFavoriteItems);
  const setArtistFollowed = useArtistStore((state) => state.setArtistFollowed);
  const setListenHistory = useHistoriesStore((state) => state.setListenHistory);
  const setSearchHistory = useHistoriesStore((state) => state.setSearchHistory);
  const addListenHistory = useHistoriesStore((state) => state.addListenHistory);
  const playPlaylist = usePlayerStore((state) => state.playPlaylist);

  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const greetingTranslateY = useRef(new Animated.Value(20)).current;
  const iconColor = theme === 'light' ? '#000' : '#fff';

  const [queryParam, setQueryParam] = useState({
    playlistForYou: ["Nhạc trẻ phổ biến", "2025", "Đang hot", "Mới"],
    albumForYou: ["Yêu", "buitruonglinh", "Taylor Swift", "Ed Sheeran"],
    playlistTrending: ["Vietnam đang hot", "Thịnh Hành", "Viral 2025"],
    albumTrending: ["Adele", "Ed Sheeran", "mtp"],
    artistNames: ["BTS", "buitruonglinh", "Hoàng Dũng", "Taylor Swift"],
    genres: ["pop", "v-pop", "hip hop"],
  });
  const [dataForYou, setDataForYou] = useState({
    playlistsForYou: [],
    albumsForYou: [],
    playlistsTrending: [],
    albumsTrending: [],
    artistsForYou: [],
  });
  const [queryRecommendations, setQueryRecommendations] = useState({
    baseOnHistory: [],
    baseOnMoods: [],
    baseOnActivities: [],
    baseOnTimeOfDay: [],
    baseOnFavoriteItems: [],
    baseOnGenres: [],
    baseOnFollowedArtists: [],
  });
  const [dataRecommendations, setDataRecommendations] = useState({
    baseOnHistory: [],
    baseOnMoods: [],
    baseOnActivities: [],
    baseOnTimeOfDay: [],
    baseOnFavoriteItems: [],
    baseOnGenres: [],
    baseOnFollowedArtists: [],
  });
  const [isLoading, setIsLoading] = useState({
    playlistForYou: true,
    albumsForYou: true,
    playlistTrending: true,
    albumsTrending: true,
    artistsForYou: true,
    baseOnHistory: true,
    baseOnMoods: true,
    baseOnActivities: true,
    baseOnTimeOfDay: true,
    baseOnFavoriteItems: true,
    baseOnGenres: true,
    baseOnFollowedArtists: true,
  });

  const shuffleData = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  const [hasNotification] = useState(true);

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

  const handlePlayPlaylist = async () => {

    await fetchTracks(currentPlaylist);
    console.log('handlePlay')
    if (!listTrack || listTrack.length === 0) {
      warning('Playlist không có bài hát để phát!');
      return;
    }

    playPlaylist(listTrack, 0);
    const queueData = listTrack.filter((item, index) => {
      if (index > 0) return item;
    });
    setQueue(queueData);
    setCurrentTrack(listTrack[0])
    await savePlaylistToListeningHistory();
  };

  const savePlaylistToListeningHistory = () => {
    if (!currentPlaylist) return;
    const payload = {
      itemType: 'playlist',
      itemId: currentPlaylist?.id || '',
      itemSpotifyId: currentPlaylist?.spotifyId,
      durationListened: 0
    };
    SaveToListeningHistory(payload).then((response) => {
      if (response.success) {
        if (response.updated) {
          console.log('Cập nhật lịch sử nghe playlist thành công:', response.data);
        } else {
          console.log('Tạo mới lịch sử nghe playlist thành công:', response.data);
          addListenHistory(response.data);
        }
      }
    });
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

  const fetchMyPlaylists = async () => {
    try {
      const response = await GetMyPlaylists();
      if (response.success) {
        console.log('response data ui my playlist: ', response.data)
        setMyPlaylists(response.data);
      } else {
        setMyPlaylists([]);
      }
    } catch (error) {
      console.log("Lỗi khi lấy playlist của tôi:", error);
    }
  }

  const fetchHistory = async () => {
    const [responseListen, responseSearch] = await Promise.all([
      GetListeningHistory(),
      GetSearchHistory()
    ]);
    if (responseSearch.success) {
      setSearchHistory(responseSearch.data);
    } else {
      setSearchHistory([]);
    }
    if (responseListen.success) {
      setListenHistory(responseListen.data);
    } else {
      setListenHistory([]);
    }
  }

  const fetchTracks = async (playlist) => {
    if (playlist?.spotifyId) {
      const response = await GetTracksByPlaylistId({
        playlistId: playlist?.spotifyId,
        type: 'api'
      });
      if (response.success) {
        setListTrack(response.data);
      } else {
        setListTrack([]);
      }
    } else {
      const response = await GetTracksByPlaylistId({
        playlistId: playlist?.id,
        type: 'local'
      });
      if (response.success) {
        setListTrack(response.data);
      } else {
        setListTrack([]);
      }
    }
  };

  const fetchQueryRecommendations = async () => {
    try {
      const response = await GetRecommendationsByUser();
      if (response.success) {
        const data = response.data;
        const newQueryData = {
          baseOnHistory: [],
          baseOnMoods: [],
          baseOnActivities: [],
          baseOnTimeOfDay: [],
          baseOnFavoriteItems: [],
          baseOnGenres: [],
          baseOnFollowedArtists: [],
        };

        for (let item of data) {
          const payload = { query: item.query, type: item.type };
          switch (item.reason) {
            case 'history': newQueryData.baseOnHistory.push(payload); break;
            case 'genres': newQueryData.baseOnGenres.push(payload); break;
            case 'favorites': newQueryData.baseOnFavoriteItems.push(payload); break;
            case 'timeOfDay': newQueryData.baseOnTimeOfDay.push(payload); break;
            case 'activity': newQueryData.baseOnActivities.push(payload); break;
            case 'followedArtists': newQueryData.baseOnFollowedArtists.push(payload); break;
            case 'mood': newQueryData.baseOnMoods.push(payload); break;
          }
        }
        setQueryRecommendations(newQueryData);
        return newQueryData;
      }
      return null;
    } catch (error) {
      console.log('Error fetching recommendations: ', error);
      return null;
    }
  }

  const fetchGenericRecommendation = async (dataItems, keyStateName) => {
    if (!dataItems || dataItems.length === 0) {
      setIsLoading(prev => ({ ...prev, [keyStateName]: false }));
      return;
    }

    let groups = { artistNames: [], playlistNames: [], albumNames: [], genres: [], trackName: null };
    for (let item of dataItems) {
      const itemType = item.type;
      switch (itemType) {
        case 'playlist': groups.playlistNames.push(item.query); break;
        case 'album': groups.albumNames.push(item.query); break;
        case 'artist': groups.artistNames.push(item.query); break;
        case 'track': groups.trackName = item.query; break;
        case 'genre': groups.genres.push(item.query); break;
      }
    }

    try {
      const [resPlaylist, resAlbum, resArtist, resTrack] = await Promise.all([
        groups.playlistNames.length > 0 ? GetPlaylistsForYou(groups.playlistNames) : null,
        groups.albumNames.length > 0 ? GetAlbumsForYou(groups.albumNames) : null,
        groups.artistNames.length > 0 ? GetArtistsForYou({ artistNames: groups.artistNames, genres: groups.genres }) : null,
        groups.trackName ? SearchTracks({ trackName: groups.trackName, limit: 5 }) : null,
      ]);

      let result = [];
      if (resPlaylist?.success) result = [...result, ...resPlaylist.data];
      if (resAlbum?.success) result = [...result, ...resAlbum.data];
      if (resArtist?.success) result = [...result, ...resArtist.data];
      if (resTrack?.success) {
        const tracks = resTrack.data.map((track) => ({ ...track, type: 'track' }));
        result = [...result, ...tracks];
      }

      // console.log('result', result)
      if (result.length > 0) {
        setDataRecommendations(prev => ({
          ...prev,
          [keyStateName]: shuffleData(result)
        }));
        setIsLoading(prev => ({ ...prev, [keyStateName]: false }));
      }
    } catch (e) {
      console.log(`Error fetching ${keyStateName}`, e);
    }
  }

  const fetchDataRecommendations = async (inputData) => {
    if (!inputData) return;

    fetchGenericRecommendation(recommendBasedOnActivity, 'baseOnActivities');

    // fetchGenericRecommendation(inputData.baseOnHistory, 'baseOnHistory').then(() =>
    //   setTimeout(() => {
    //     fetchGenericRecommendation(inputData.baseOnActivities, 'baseOnActivities')
    //   }, 500)
    // )

    const queue = [
      { data: inputData.baseOnMoods, key: 'baseOnMoods' },
      { data: inputData.baseOnTimeOfDay, key: 'baseOnTimeOfDay' },
      { data: inputData.baseOnFavoriteItems, key: 'baseOnFavoriteItems' },
      { data: inputData.baseOnGenres, key: 'baseOnGenres' },
      { data: inputData.baseOnFollowedArtists, key: 'baseOnFollowedArtists' },
    ]

    for (const item of queue) {
      await new Promise(r => setTimeout(r, 800)); // Delay nhỏ để né 429
      fetchGenericRecommendation(item.data, item.key); // Không cần await nếu muốn chạy ngầm hoàn toàn
    }
  }

  useEffect(() => {
    fetchPlaylistsForYou()
    fetchAlbumsForYou()
    fetchTrendingPlaylists()
    fetchTrendingAlbums()
    fetchArtistsForYou()
  }, []);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      fetchMyPlaylists();
      fetchHistory();
      fetchFavoritesItem();
      fetchArtistFollowed();
      fetchQueryRecommendations().then((dataInput) => {
        if (dataInput) {
          fetchDataRecommendations(dataInput);
        }
      });
      fetchGenericRecommendation(recommendBasedOnActivity, 'baseOnActivities');
    }
  }, [isLoggedIn, user?.id]);

  return (
    <SafeAreaView
      className={`flex-1 pt-4 ${colorScheme === "dark" ? "bg-black" : "bg-white"} `}
      style={{ marginBottom: isMiniPlayerVisible ? MINI_PLAYER_HEIGHT : 0 }}
    >
      <View className={`fixed flex-row justify-between items-center mx-5 mb-4 `}>
        <Text className="text-black dark:text-white text-2xl font-bold">
          Hi, {isGuest ? "Guest" : String(user?.fullName || user?.username)} 👋
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
        <Pressable
          onPress={() => handleSelectPlaylist(dataForYou.playlistsForYou[0])}
          className="mb-6 w-full h-64 rounded-lg overflow-hidden">
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
                  onPress={() => handlePlayPlaylist()}
                  className="mt-2 bg-green-500 px-4 py-2 rounded-full"
                />
              </View>
            </View>
          </ImageBackground>
        </Pressable>

        {/* Recently Played Horizontal List */}
        <View className="mb-6">
          {isLoading.playlistForYou ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <>
              <View className="flex-row justify-between items-center mb-2">
                <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                  Danh sách phát phổ biến
                </Text>
              </View>
              <FlatList
                horizontal
                initialNumToRender={5}
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
            </>
          )}
        </View>

        <View className="mb-6">
          {isLoading.artistsForYou ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <>
              <Text className={`text-lg font-bold mb-4 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                Nghệ sĩ bạn phù hợp với bạn
              </Text>
              <FlatList
                data={dataForYou.artistsForYou}
                horizontal
                initialNumToRender={5}
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
            </>
          )}
        </View>
        <View className="mb-6">
          {isLoading.albumsForYou ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <>
              <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                Album chọn lọc dành cho bạn
              </Text>
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
            </>
          )}
        </View>

        <View className="mb-6">
          <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
            Dựa trên lịch sử nghe của bạn
          </Text>
          {isLoading.playlistTrending ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              initialNumToRender={5}
              data={dataRecommendations.baseOnHistory}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => {
                if (item.type === 'playlist') {
                  return (
                    <PlaylistItem
                      item={item}
                      totalTrack={item.totalTracks || 0}
                      onPress={() => handleSelectPlaylist(item)}
                    />
                  );
                } else if (item.type === 'album') {
                  return (
                    <AlbumItem
                      title={item.name}
                      image={item.imageUrl}
                      onPress={() => handleSelectAlbum(item)}
                    />
                  );
                } else if (item.type === 'artist') {
                  return (
                    <ArtistItemHome
                      name={item.name}
                      image={item?.imageUrl || item?.imgUrl}
                      onPress={() => handleSelectArtist(item)}
                    />
                  );
                }
              }}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>

        <View className="mb-6">
          {isLoading.playlistTrending ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <>
              <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                Phù hợp với hoạt động {selectedActivity?.label || ''}
              </Text>
              <FlatList
                horizontal
                initialNumToRender={5}
                data={dataRecommendations.baseOnActivities}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => {
                  if (item.type === 'playlist') {
                    return (
                      <PlaylistItem
                        item={item}
                        totalTrack={item.totalTracks || 0}
                        onPress={() => handleSelectPlaylist(item)}
                      />
                    );
                  } else if (item.type === 'album') {
                    return (
                      <AlbumItem
                        title={item.name}
                        image={item.imageUrl}
                        onPress={() => handleSelectAlbum(item)}
                      />
                    );
                  } else if (item.type === 'artist') {
                    return (
                      <ArtistItemHome
                        name={item.name}
                        image={item?.imageUrl || item?.imgUrl}
                        onPress={() => handleSelectArtist(item)}
                      />
                    );
                  }
                }}
                showsHorizontalScrollIndicator={false}
              />
            </>
          )}
        </View>

        <View className="mb-6">
          {isLoading.playlistTrending ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <>
              <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                Dựa trên tâm trạng của bạn
              </Text>
              <FlatList
                horizontal
                initialNumToRender={5}
                data={dataRecommendations.baseOnMoods}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => {
                  if (item.type === 'playlist') {
                    return (
                      <PlaylistItem
                        item={item}
                        totalTrack={item.totalTracks || 0}
                        onPress={() => handleSelectPlaylist(item)}
                      />
                    );
                  } else if (item.type === 'album') {
                    return (
                      <AlbumItem
                        title={item.name}
                        image={item.imageUrl}
                        onPress={() => handleSelectAlbum(item)}
                      />
                    );
                  } else if (item.type === 'artist') {
                    return (
                      <ArtistItemHome
                        name={item.name}
                        image={item?.imageUrl || item?.imgUrl}
                        onPress={() => handleSelectArtist(item)}
                      />
                    );
                  }
                }}
                showsHorizontalScrollIndicator={false}
              />
            </>
          )}
        </View>

        <View className="mb-6">
          {isLoading.playlistTrending ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <>
              <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                Có thể bạn sẽ thích
              </Text>
              <FlatList
                horizontal
                initialNumToRender={5}
                data={dataRecommendations.baseOnFavoriteItems}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => {
                  if (item.type === 'playlist') {
                    return (
                      <PlaylistItem
                        item={item}
                        totalTrack={item.totalTracks || 0}
                        onPress={() => handleSelectPlaylist(item)}
                      />
                    );
                  } else if (item.type === 'album') {
                    return (
                      <AlbumItem
                        title={item.name}
                        image={item.imageUrl}
                        onPress={() => handleSelectAlbum(item)}
                      />
                    );
                  } else if (item.type === 'artist') {
                    return (
                      <ArtistItemHome
                        name={item.name}
                        image={item?.imageUrl || item?.imgUrl}
                        onPress={() => handleSelectArtist(item)}
                      />
                    );
                  }
                }}
                showsHorizontalScrollIndicator={false}
              />
            </>
          )}
        </View>

        <View className="mb-6">
          {isLoading.playlistTrending ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <>
              <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                Danh sách phát thịnh hành
              </Text>
              <FlatList
                horizontal
                initialNumToRender={5}
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
            </>
          )}
        </View>

        <View className="mb-6">
          {isLoading.playlistTrending ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <>
              <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                Thích hợp nghe vào khung giờ này
              </Text>
              <FlatList
                horizontal
                initialNumToRender={5}
                data={dataRecommendations.baseOnTimeOfDay}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => {
                  if (item.type === 'playlist') {
                    return (
                      <PlaylistItem
                        item={item}
                        totalTrack={item.totalTracks || 0}
                        onPress={() => handleSelectPlaylist(item)}
                      />
                    );
                  } else if (item.type === 'album') {
                    return (
                      <AlbumItem
                        title={item.name}
                        image={item.imageUrl}
                        onPress={() => handleSelectAlbum(item)}
                      />
                    );
                  } else if (item.type === 'artist') {
                    return (
                      <ArtistItemHome
                        name={item.name}
                        image={item?.imageUrl || item?.imgUrl}
                        onPress={() => handleSelectArtist(item)}
                      />
                    );
                  }
                }}
                showsHorizontalScrollIndicator={false}
              />
            </>
          )}
        </View>

        <View className="mb-6">
          {isLoading.albumsTrending ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <>
              <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                Album phổ biến
              </Text>
              <FlatList
                horizontal
                initialNumToRender={5}
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
            </>
          )}
        </View>
        <View className="mb-6">
          {isLoading.playlistTrending ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <>
              <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                Đề xuất dựa trên những nghệ sĩ bạn theo dõi
              </Text>
              <FlatList
                horizontal
                initialNumToRender={5}
                data={dataRecommendations.baseOnFollowedArtists}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => {
                  if (item.type === 'playlist') {
                    return (
                      <PlaylistItem
                        item={item}
                        totalTrack={item.totalTracks || 0}
                        onPress={() => handleSelectPlaylist(item)}
                      />
                    );
                  } else if (item.type === 'album') {
                    return (
                      <AlbumItem
                        title={item.name}
                        image={item.imageUrl}
                        onPress={() => handleSelectAlbum(item)}
                      />
                    );
                  } else if (item.type === 'artist') {
                    return (
                      <ArtistItemHome
                        name={item.name}
                        image={item?.imageUrl || item?.imgUrl}
                        onPress={() => handleSelectArtist(item)}
                      />
                    );
                  }
                }}
                showsHorizontalScrollIndicator={false}
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
