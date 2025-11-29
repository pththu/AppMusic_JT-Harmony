import CustomButton from "@/components/custom/CustomButton";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useNavigate } from "@/hooks/useNavigate";
import useAuthStore from "@/store/authStore";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePlayerStore } from "@/store/playerStore";
import { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useFollowStore } from "@/store/followStore";
import { useHistoriesStore } from "@/store/historiesStore";
import { useBoardingStore } from "@/store/boardingStore";
import MoodSelectionModal from "@/components/modals/MoodSelectionModal";
import ActivitySelectionModal from "@/components/modals/ActivitySelectionModal";
import { useNotificationStore } from "@/store/notificationStore";
import HomeListSection from "@/components/section/HomeListSection";
import { formatDataFavorites, formatDataFollowedArtists, formatDataHistories, formatDescription } from "@/utils";
import { ACTIVITIES, MOODS } from "@/constants/data";
import QuickActionChip from "@/components/common/QuickActionChip";
import { useMusicAction } from "@/hooks/useMusicAction";
import { useHomeData } from "@/hooks/useHomeData";
import { usePlaylistData } from "@/hooks/usePlaylistData";
import Icon from "react-native-vector-icons/Ionicons";

export default function HomeScreen() {

  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const { warning } = useCustomAlert();
  const {
    handleSelectPlaylist,
    handleSelectAlbum,
    handleSelectArtist,
    savePlaylistToListeningHistory,
  } = useMusicAction();

  const listTrack = usePlayerStore((state) => state.listTrack);
  const user = useAuthStore((state) => state.user);
  const isGuest = useAuthStore((state) => state.isGuest);
  const isMiniPlayerVisible = usePlayerStore((state) => state.isMiniPlayerVisible);
  const currentPlaylist = usePlayerStore((state) => state.currentPlaylist);
  const selectedMood = useBoardingStore((state) => state.selectedMood);
  const selectedActivity = useBoardingStore((state) => state.selectedActivity);
  const listenHistory = useHistoriesStore((state) => state.listenHistory);
  const favoriteItems = useFavoritesStore((state) => state.favoriteItems);
  const artistFollowed = useFollowStore((state) => state.artistFollowed);

  const setSelectedMood = useBoardingStore((state) => state.setSelectedMood);
  const setSelectedActivity = useBoardingStore((state) => state.setSelectedActivity);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);

  const setQueue = usePlayerStore((state) => state.setQueue);
  const playPlaylist = usePlayerStore((state) => state.playPlaylist);

  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const greetingTranslateY = useRef(new Animated.Value(20)).current;
  const unreadNotificationCount = useNotificationStore((state) => state.unreadCount);
  const hasNotification = unreadNotificationCount > 0;

  const hasHistories = listenHistory?.length > 0 ? true : false;
  const hasFavorites = favoriteItems?.length > 0 ? true : false;
  const hasFollowedArtists = artistFollowed?.length > 0 ? true : false;

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

  // ============== Helpers ==============
  const getCurrentMoodLabel = () => {
    const mood = MOODS.find(m => m.id === selectedMood?.id);
    return mood ? mood.label : 'Bình thường';
  };

  const getCurrentActivityLabel = () => {
    const activity = ACTIVITIES.find(a => a.id === selectedActivity?.id);
    return activity ? activity.label : 'Không làm gì đặc biệt';
  };

  const formattedFavoriteItems = useMemo(() => formatDataFavorites(favoriteItems), [favoriteItems]);
  const formattedListenHistory = useMemo(() => formatDataHistories(listenHistory), [listenHistory]);
  const formattedArtistFollowed = useMemo(() => formatDataFollowedArtists(artistFollowed), [artistFollowed]);

  const {
    dataForYou,
    dataRecommendations,
    isLoading,
    setIsLoading,
  } = useHomeData(
    queryParam,
    formattedListenHistory,
    formattedFavoriteItems,
    formattedArtistFollowed,
    selectedActivity,
    selectedMood,
  );

  const {
    fetchTracks,
  } = usePlaylistData(currentPlaylist);

  // ============== END Helpers ==============
  const handlePlayPlaylist = async () => {
    await fetchTracks(currentPlaylist);
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
    savePlaylistToListeningHistory();
  };

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
          <TouchableOpacity className="mr-4 relative"
           onPress={() => navigate("Activity")}
          >
            <Icon name="notifications-outline" size={28} color={colorScheme === "dark" ? "white" : "black"} />
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

      {/* --- Quick Action Menu (Moods & Activities) --- */}
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

        <HomeListSection
          title="Danh sách phát phổ biến"
          isLoading={isLoading.playlistForYou}
          data={dataForYou.playlistsForYou.filter((_, index) => index !== 0)}
          onSelectPlaylist={handleSelectPlaylist}
          onSelectAlbum={handleSelectAlbum}
          onSelectArtist={handleSelectArtist}
          onSelectTrack={() => { }}
        />

        <HomeListSection
          title="Nghệ sĩ đề xuất cho bạn"
          isLoading={isLoading.artistsForYou}
          data={dataForYou.artistsForYou}
          onSelectPlaylist={handleSelectPlaylist}
          onSelectAlbum={handleSelectAlbum}
          onSelectArtist={handleSelectArtist}
          onSelectTrack={() => { }}
        />

        <HomeListSection
          title="Album chọn lọc dành cho bạn"
          isLoading={isLoading.albumsForYou}
          data={dataForYou.albumsForYou}
          onSelectPlaylist={handleSelectPlaylist}
          onSelectAlbum={handleSelectAlbum}
          onSelectArtist={handleSelectArtist}
          onSelectTrack={() => { }}
        />

        <HomeListSection
          title={`Phù hợp với hoạt động ${selectedActivity?.label || ''}`}
          isLoading={isLoading.baseOnActivities}
          data={dataRecommendations.baseOnActivities}
          onSelectPlaylist={handleSelectPlaylist}
          onSelectAlbum={handleSelectAlbum}
          onSelectArtist={handleSelectArtist}
          onSelectTrack={() => { }}
        />
        <HomeListSection
          title={`Thích hợp để nghe khi ${selectedMood?.label || ''}`}
          isLoading={isLoading.baseOnMoods}
          data={dataRecommendations.baseOnMoods}
          onSelectPlaylist={handleSelectPlaylist}
          onSelectAlbum={handleSelectAlbum}
          onSelectArtist={handleSelectArtist}
          onSelectTrack={() => { }}
        />
        {!isGuest && (
          <>
            {hasFollowedArtists && (
              <HomeListSection
                title="Dựa trên nghệ sĩ bạn theo dõi"
                isLoading={isLoading.baseOnFollowedArtists}
                data={dataRecommendations.baseOnFollowedArtists}
                onSelectPlaylist={handleSelectPlaylist}
                onSelectAlbum={handleSelectAlbum}
                onSelectArtist={handleSelectArtist}
                onSelectTrack={() => { }}
              />
            )}
            {hasFavorites && (
              <HomeListSection
                title="Có thể bạn sẽ thích"
                data={dataRecommendations.baseOnFavoriteItems}
                isLoading={isLoading.baseOnFavoriteItems}
                onSelectPlaylist={handleSelectPlaylist}
                onSelectAlbum={handleSelectAlbum}
                onSelectArtist={handleSelectArtist}
                onSelectTrack={() => { }}
              />
            )}
            {hasHistories && (
              <HomeListSection
                title="Đề xuất dựa trên lịch sử nghe của bạn"
                data={dataRecommendations.baseOnHistory}
                isLoading={isLoading.baseOnHistory}
                onSelectPlaylist={handleSelectPlaylist}
                onSelectAlbum={handleSelectAlbum}
                onSelectArtist={handleSelectArtist}
                onSelectTrack={() => { }}
              />
            )}
          </>
        )}

        <HomeListSection
          title="Danh sách phát thịnh hành"
          isLoading={isLoading.playlistTrending}
          data={dataForYou.playlistsTrending}
          onSelectPlaylist={handleSelectPlaylist}
          onSelectAlbum={handleSelectAlbum}
          onSelectArtist={handleSelectArtist}
          onSelectTrack={() => { }}
        />

        <HomeListSection
          title="Thích hợp nghe vào khung giờ này"
          isLoading={isLoading.baseOnTimeOfDay}
          data={dataRecommendations.baseOnTimeOfDay}
          onSelectPlaylist={handleSelectPlaylist}
          onSelectAlbum={handleSelectAlbum}
          onSelectArtist={handleSelectArtist}
          onSelectTrack={() => { }}
        />

        <HomeListSection
          title="Album phổ biến"
          isLoading={isLoading.albumsTrending}
          data={dataForYou.albumsTrending}
          onSelectPlaylist={handleSelectPlaylist}
          onSelectAlbum={handleSelectAlbum}
          onSelectArtist={handleSelectArtist}
          onSelectTrack={() => { }}
        />

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
