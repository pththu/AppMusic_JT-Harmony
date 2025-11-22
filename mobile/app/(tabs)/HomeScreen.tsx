import CustomButton from "@/components/custom/CustomButton";
import AlbumItem from "@/components/items/AlbumItem";
import React, { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { GetAlbumsForYou, GetArtistsForYou, GetPlaylistsForYou, GetTracksByPlaylistId } from "@/services/musicService";
import { usePlayerStore } from "@/store/playerStore";
import { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useFollowStore } from "@/store/followStore";
import { SaveToListeningHistory } from "@/services/historiesService";
import { useHistoriesStore } from "@/store/historiesStore";
import {
  GenerateFromActivity, GenerateFromFavorites, GenerateFromFollowedArtists,
  GenerateFromHistories, GenerateFromMood, GenerateFromTimeOfDay, GetRecommendationsByUser
} from "@/services/recommendationService";
import { SearchTracks } from "@/services/searchService";
import { useBoardingStore } from "@/store/boardingStore";
import MoodSelectionModal from "@/components/modals/MoodSelectionModal";
import ActivitySelectionModal from "@/components/modals/ActivitySelectionModal";
import { useNotificationStore } from "@/store/notificationStore";

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

const MOODS = [
  { id: 'happy', label: 'Vui vẻ 😊' },
  { id: 'sad', label: 'Buồn 😢' },
  { id: 'focused', label: 'Tập trung 🧠' },
  { id: 'chill', label: 'Chill 🍃' },
  { id: 'energetic', label: 'Năng động ⚡' },
  { id: 'romantic', label: 'Lãng mạn 🌹' },
  { id: 'sleepy', label: 'Buồn ngủ 😴' },
  { id: 'angry', label: 'Bực bội 😡' },
  { id: 'motivated', label: 'Có động lực 🚀' },
  { id: 'stressed', label: 'Căng thẳng 😰' },
  { id: 'nostalgic', label: 'Hoài niệm � ' },
  { id: 'boring', label: 'Chán nản 😐' },
  { id: "heartbroken", label: 'Đau khổ 💔' },
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

// chọn activity và mood
const QuickActionChip = ({ icon, label, isActive, onPress, colorScheme }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center px-4 py-2 rounded-full mr-3 border ${isActive
      ? 'bg-green-500 border-green-500'
      : colorScheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
      }`}
  >
    <Icon name={icon} size={18} color={isActive ? '#fff' : (colorScheme === 'dark' ? '#ccc' : '#555')} />
    <Text className={`ml-2 font-medium ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
      {label}
    </Text>
  </TouchableOpacity>
);

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
  const recommendBasedOnMood = useBoardingStore((state) => state.recommendBasedOnMood);
  const recommendBasedOnFavorites = useBoardingStore((state) => state.recommendBasedOnFavorites);
  const recommendBasedOnFollowedArtists = useBoardingStore((state) => state.recommendBasedOnFollowedArtists);
  const recommendBasedOnHistories = useBoardingStore((state) => state.recommendBasedOnHistories);
  const recommendBasedOnTimeOfDay = useBoardingStore((state) => state.recommendBasedOnTimeOfDay);
  const listenHistory = useHistoriesStore((state) => state.listenHistory);
  const favoriteItems = useFavoritesStore((state) => state.favoriteItems);
  const artistFollowed = useFollowStore((state) => state.artistFollowed);

  const setSelectedMood = useBoardingStore((state) => state.setSelectedMood);
  const setSelectedActivity = useBoardingStore((state) => state.setSelectedActivity);
  const setRecommendBasedOnActivity = useBoardingStore((state) => state.setRecommendBasedOnActivity);
  const setRecommendBasedOnMood = useBoardingStore((state) => state.setRecommendBasedOnMood);
  const setRecommendBasedOnFollowedArtists = useBoardingStore((state) => state.setRecommendBasedOnFollowedArtists);
  const setRecommendBasedOnFavorites = useBoardingStore((state) => state.setRecommendBasedOnFavorites);
  const setRecommendBasedOnHistories = useBoardingStore((state) => state.setRecommendBasedOnHistories);
  const setRecommendBasedOnTimeOfDay = useBoardingStore((state) => state.setRecommendBasedOnTimeOfDay);

  const setCurrentPlaylist = usePlayerStore((state) => state.setCurrentPlaylist);
  const setCurrentAlbum = usePlayerStore((state) => state.setCurrentAlbum);
  const setCurrentArtist = useFollowStore((state) => state.setCurrentArtist);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setListTrack = usePlayerStore((state) => state.setListTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);


  const addListenHistory = useHistoriesStore((state) => state.addListenHistory);
  const playPlaylist = usePlayerStore((state) => state.playPlaylist);

  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const greetingTranslateY = useRef(new Animated.Value(20)).current;
  const iconColor = theme === 'light' ? '#000' : '#fff';
  const unreadNotificationCount = useNotificationStore((state) => state.unreadCount);
  const hasNotification = unreadNotificationCount > 0;

  const [isMoodModalVisible, setMoodModalVisible] = useState(false);
  const [isActivityModalVisible, setActivityModalVisible] = useState(false);

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

  const [dataRecommendations, setDataRecommendations] = useState({
    baseOnHistory: [],
    baseOnMoods: [],
    baseOnActivities: [],
    baseOnTimeOfDay: [],
    baseOnFavoriteItems: [],
    // baseOnGenres: [],
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

  // ============== Helpers ==============
  const getCurrentMoodLabel = () => {
    const mood = MOODS.find(m => m.id === selectedMood?.id);
    return mood ? mood.label : 'Bình thường';
  };

  const getCurrentActivityLabel = () => {
    const activity = ACTIVITIES.find(a => a.id === selectedActivity?.id);
    return activity ? activity.label : 'Không làm gì đặc biệt';
  };

  const shuffleData = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * lấy và định dạng dữ liệu favorite
   * {
   * type: 'playlist' | 'album' | 'track',
   * name: string,
   * artists?: string,
   * description?: string,
   * }
   */
  const formatDataFavorites = (data) => {
    const formatData = [];
    for (const item of data) {
      if ((item.itemType === 'track' || item.itemType === 'album') && item.item) {
        formatData.push({
          type: item.itemType,
          name: item.item.name,
          artists: item.item.artists.map(artist => artist.name).join(', '),
        })
      } else if (item.itemType === 'playlist' && item.item) {
        formatData.push({
          type: item.itemType,
          name: item.item.name,
          description: item.item.description || '',
        })
      }
    }
    return formatData;
  }

  /**
   * lấy và định dạng dữ liệu lịch sử nghe
   * {
   *  type: 'playlist' | 'album' | 'track' | 'artist',
      name: string,
      artists?: string,
      description?: string,
      durationListened?: number,
      playCount: number,
      updatedAt: string,
   * }
   */
  const formatDataHistories = (data) => {
    const formatData = [];
    for (const item of data) {
      if (item.itemType === 'track' && item.item) {
        formatData.push({
          type: item.itemType,
          name: item.item.name,
          artists: item.item.artists.map(artist => artist.name).join(', '),
          playCount: item.playCount,
          durationListened: item.durationListened,
        })
      } else if (item.itemType === 'playlist' && item.item) {
        formatData.push({
          type: item.itemType,
          name: item.item.name,
          description: item.item.description || '',
          playCount: item.playCount,
        })
      } else if (item.itemType === 'artist' && item.item) {
        formatData.push({
          type: item.itemType,
          name: item.item.name,
          playCount: item.playCount,
        })
      } else if (item.itemType === 'album' && item.item) {
        formatData.push({
          type: item.itemType,
          name: item.item.name,
          artists: item.item.artists.map(artist => artist.name).join(', '),
          playCount: item.playCount,
        })
      }
    }
    return formatData;
  }

  const formatDataFollowedArtists = (data) => {
    const formatData = [];
    for (const item of data) {
      if (item.artist) {
        formatData.push({
          name: item.artist.name,
          followedAt: item.createdAt,
        })
      }
    }
    return formatData;
  }


  // ============== END Helpers ==============

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

  const handleMoodUpdate = (newMood) => {
    if (!newMood) return;
    setSelectedMood(newMood);
    setIsLoading(prev => ({ ...prev, baseOnMoods: true }));

  };

  const handleActivityUpdate = (newActivity) => {
    if (!newActivity) return;
    setSelectedActivity(newActivity);
    setIsLoading(prev => ({ ...prev, baseOnActivities: true }));
  };

  const fetchPlaylistsForYou = useCallback(async () => {
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
  }, [queryParam.playlistForYou]);

  const fetchAlbumsForYou = useCallback(async () => {
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
  }, [queryParam.albumForYou]);

  const fetchTrendingPlaylists = useCallback(async () => {
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
  }, [queryParam.playlistTrending]);

  const fetchTrendingAlbums = useCallback(async () => {
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
  }, [queryParam.albumTrending]);

  const fetchArtistsForYou = useCallback(async () => {
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
  }, [queryParam.artistNames, queryParam.genres]);

  const fetchTracks = useCallback(async (playlist) => {
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
  }, []);

  const fetchGenericRecommendation = useCallback(async (dataItems, keyStateName) => {
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

      if (result.length > 0) {
        setDataRecommendations(prev => ({
          ...prev,
          [keyStateName]: shuffleData(result)
        }));
      }
    } catch (e) {
      console.log(`Error fetching ${keyStateName}`, e);
    } finally {
      setIsLoading(prev => ({ ...prev, [keyStateName]: false }));
    }
  }, []);

  useEffect(() => {
    Promise.all([
      fetchPlaylistsForYou(),
      fetchAlbumsForYou(),
      fetchTrendingPlaylists(),
      fetchTrendingAlbums(),
      fetchArtistsForYou()
    ])
    GenerateFromTimeOfDay().then(response => {
      if (response.success) {
        setRecommendBasedOnTimeOfDay(response.data);
        fetchGenericRecommendation(response.data, 'baseOnTimeOfDay');
      }
    });
  }, []);

  useEffect(() => {
    if (listenHistory.length > 0) {
      GenerateFromHistories(formatDataHistories(listenHistory)).then(response => {
        console.log(response)
        if (response.success) {
          setRecommendBasedOnHistories(response.data);
          fetchGenericRecommendation(response.data, 'baseOnHistory');
        }
      });
    }
  }, [user?.id, listenHistory]);

  useEffect(() => {
    if (favoriteItems.length > 0) {
      GenerateFromFavorites(formatDataFavorites(favoriteItems)).then(response => {
        if (response.success) {
          setRecommendBasedOnFavorites(response.data);
          fetchGenericRecommendation(response.data, 'baseOnFavoriteItems');
        }
      });
    }
  }, [user?.id, favoriteItems]);

  useEffect(() => {
    if (artistFollowed.length > 0) {
      GenerateFromFollowedArtists(formatDataFollowedArtists(artistFollowed)).then(response => {
        if (response.success) {
          setRecommendBasedOnFollowedArtists(response.data);
          fetchGenericRecommendation(response.data, 'baseOnFollowedArtists');
        }
      });
    }
  }, [user?.id, artistFollowed]);

  useEffect(() => {
    if (selectedActivity) {
      setIsLoading(prev => ({ ...prev, baseOnActivities: true }));
      try {
        GenerateFromActivity(selectedActivity?.label).then(response => {
          if (response.success) {
            setRecommendBasedOnActivity(response.data);
            fetchGenericRecommendation(response.data, 'baseOnActivities');
          }
        });
      } catch (error) {
        console.log('Error generating activity recommendations:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, baseOnActivities: false }));
      }
    }
  }, [selectedActivity, user?.id])

  useEffect(() => {
    if (selectedMood) {
      try {
        GenerateFromMood(selectedMood?.label).then(response => {
          if (response.success) {
            setRecommendBasedOnMood(response.data);
            fetchGenericRecommendation(response.data, 'baseOnMoods');
          }
        });
      } catch (error) {
        console.log('Error generating mood recommendations:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, baseOnMoods: false }));
      }
    }
  }, [selectedMood, user?.id]);

  return (
    <SafeAreaView
      className={`flex-1 pt-4 ${colorScheme === "dark" ? "bg-black" : "bg-white"} `}
      style={{ marginBottom: isMiniPlayerVisible ? MINI_PLAYER_HEIGHT : 0 }}
    >
      {/* Header: Greetings & Avatar */}
      <View className={`fixed flex-row justify-between items-center mx-5 mb-4 `}>
        <Text className="text-black dark:text-white text-2xl font-bold">
          Hi, {isGuest ? "Guest" : String(user?.fullName || user?.username)} 👋
        </Text>
        <View className="flex-row items-center">
          {/* <TouchableOpacity className="mr-4 relative">
            <Icon name="notifications-outline" size={28} color={iconColor} />
            {hasNotification && (
              <View className="absolute -top-1 -right-1 min-w-[16px] px-1 h-4 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-[10px] text-white font-semibold">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity> */}
          <TouchableOpacity onPress={() => navigate("Profile")}>
            <Image
              source={{ uri: user?.avatarUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg' }}
              className="w-10 h-10 rounded-full"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- NEW: Quick Action Menu (Moods & Activities) --- */}
      <View className="mb-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {/* Nút chọn Mood */}
          <QuickActionChip
            icon={selectedMood?.icon || 'happy-outline'}
            label={getCurrentMoodLabel()}
            isActive={!!selectedMood}
            colorScheme={colorScheme}
            onPress={() => setMoodModalVisible(true)}
          />

          {/* Nút chọn Activity */}
          <QuickActionChip
            icon={selectedActivity?.icon || 'fitness-outline'}
            label={getCurrentActivityLabel()}
            isActive={!!selectedActivity}
            colorScheme={colorScheme}
            onPress={() => setActivityModalVisible(true)}
          />
        </ScrollView>
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
          <View className="flex-row justify-between items-center mb-2">
            <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
              Danh sách phát phổ biến
            </Text>
          </View>
          {isLoading.playlistForYou ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
            </View>
          ) : (
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
          )}
        </View>

        <View className="mb-6">
          <Text className={`text-lg font-bold mb-4 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
            Nghệ sĩ bạn phù hợp với bạn
          </Text>
          {isLoading.artistsForYou ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
            </View>
          ) : (
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
          )}
        </View>
        <View className="mb-6">
          <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
            Album chọn lọc dành cho bạn
          </Text>
          {isLoading.albumsForYou ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
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
            Phù hợp với hoạt động {selectedActivity?.label || ''}
          </Text>
          {isLoading.baseOnActivities ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
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
          )}
        </View>

        <View className="mb-6">
          <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
            Dựa trên tâm trạng của bạn
          </Text>
          {isLoading.baseOnMoods ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
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
          )}
        </View>

        {!isGuest && (
          <>
            <View className="mb-6">
              <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                Có thể bạn sẽ thích
              </Text>
              {isLoading.baseOnFavoriteItems ? (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color="#22c55e" />
                  <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
                </View>
              ) : (
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
              )}
            </View>
            <View className="mb-6">
              <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                Dựa trên lịch sử nghe của bạn
              </Text>
              {isLoading.baseOnHistory ? (
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
          </>
        )}
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
          )}
        </View>

        <View className="mb-6">
          <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
            Thích hợp nghe vào khung giờ này
          </Text>
          {isLoading.baseOnTimeOfDay ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
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
          )}
        </View>
        {!isGuest && (
          <View className="mb-6">
            <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
              Đề xuất dựa trên những nghệ sĩ bạn theo dõi
            </Text>
            {isLoading.baseOnFollowedArtists ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#22c55e" />
                <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
              </View>
            ) : (
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
            )}
          </View>
        )}
      </ScrollView>
      {/* MODALS */}
      <MoodSelectionModal
        visible={isMoodModalVisible}
        onClose={() => setMoodModalVisible(false)}
        onConfirm={handleMoodUpdate}
      />

      <ActivitySelectionModal
        visible={isActivityModalVisible}
        onClose={() => setActivityModalVisible(false)}
        onConfirm={handleActivityUpdate}
      />
    </SafeAreaView>
  );
}
