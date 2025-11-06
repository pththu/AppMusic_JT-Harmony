import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialIcons";

import LyricsSection from "@/components/LyricsSection";
import ArtistsSection from "@/components/artists/ArtistsSection";
import { useNavigate } from "@/hooks/useNavigate";
import { usePlayerStore } from "@/store/playerStore";
import { useQueueStore } from "@/store/queueStore";
import { router } from "expo-router";
import { useTheme } from "@/components/ThemeContext";
import { albumData, trackData } from "@/constants/data";
import { SafeAreaView } from "react-native-safe-area-context";
import SongItem from "@/components/items/SongItem";
import TextTicker from "react-native-text-ticker";
import { is } from "date-fns/locale";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { ShareTrack } from "@/services/musicService";
import useAuthStore from "@/store/authStore";
import { AddFavoriteItem } from "@/services/favoritesService";
import { useFavoritesStore } from "@/store/favoritesStore";

const screenWidth = Dimensions.get("window").width;

export default function SongScreen() {
  const { navigate } = useNavigate();
  const { info, error, success } = useCustomAlert();
  const colorScheme = useColorScheme();

  const user = useAuthStore((state) => state.user);
  const playbackPosition = usePlayerStore((state) => state.playbackPosition)
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const duration = usePlayerStore((state) => state.duration);
  const queue = usePlayerStore((state) => state.queue);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const favoriteItems = useFavoritesStore((state) => state.favoriteItems);
  const addFavoriteItem = useFavoritesStore((state) => state.addFavoriteItem);
  const removeFavoriteItem = useFavoritesStore((state) => state.removeFavoriteItem);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setPlaybackPosition = usePlayerStore((state) => state.setPlaybackPosition);
  const setRepeatMode = usePlayerStore((state) => state.setRepeatMode);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);
  const shuffleQueue = usePlayerStore((state) => state.shuffleQueue);
  const unShuffleQueue = usePlayerStore((state) => state.unShuffleQueue);
  const removeTrackFromQueue = usePlayerStore((state) => state.removeTrackFromQueue);
  const updateTrack = usePlayerStore((state) => state.updateTrack);

  const primaryIconColor = colorScheme === 'dark' ? 'white' : 'black';
  const secondaryIconColor = colorScheme === 'dark' ? '#888' : 'gray';

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isRepeatOne, setIsRepeatOne] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [progress, setProgress] = useState(0);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) {
      return "0:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };


  const handleSelectQueue = () => {
    if (!currentTrack) return;
    navigate("QueueScreen");
  };

  const handleSelectTrack = (track) => {
    setCurrentTrack(track);
    navigate('SongScreen');
  }

  const handlePlayPrevious = () => {
    if (!currentTrack) return;
    if (currentIndex === 0) {
      setPlaybackPosition(0);
    }
    playPrevious();
  }

  const handlePlayNext = () => {
    playNext();
  }

  const handleShufflePlay = () => {
    console.log('handleShufflePlay: ', isShuffle)

    if (isShuffle) {
      unShuffleQueue();
    } else {
      shuffleQueue();
    }
    setIsShuffle(!isShuffle);
  };

  const handleRepeat = () => {
    if (isRepeat && isRepeatOne) {
      setIsRepeat(false);
      setIsRepeatOne(false);
      setRepeatMode('none');
    } else if (!isRepeat && !isRepeatOne) {
      setIsRepeat(true);
      setIsRepeatOne(false);
      setRepeatMode('all');
    } else if (isRepeat && !isRepeatOne) {
      setIsRepeat(true);
      setIsRepeatOne(true);
      setRepeatMode('one');
    }
  }

  const handleRemoveTrackFromQueue = (track) => {
    try {
      removeTrackFromQueue([track]);
    } catch (err) {
      console.log('Error removing track from queue: ', err);
      error('Lỗi khi xóa bài hát khỏi danh sách chờ');
    }
  };

  const handleShareTrack = async (track) => {
    try {
      const artistName = track.artists?.map(a => a.name).join(', ');
      let shareMessage = `${user?.fullName}: `;

      if (track?.name) {
        shareMessage += `Nghe thử bài hát này: ${track.name} - ${artistName}\n\n`;
      } else {
        shareMessage += `Bài đăng của ${user?.fullName}\n\n`;
      }

      // Thêm URL hình ảnh nếu có
      if (track?.imageUrl) {
        shareMessage += `${track?.imageUrl}\n\n`;
      }

      // Thêm liên kết đến bài viết
      const postLink = `app://post/${track?.id}`; // Deep link giả định
      shareMessage += `Xem bài hát: ${postLink}`;

      const result = await Share.share({
        message: shareMessage,
        // url: postLink,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(result.activityType)
        } else {
          console.log('Chia sẻ thành công!');
        }
        // Update share count after successful share
        const response = await ShareTrack({
          trackId: track?.id,
          trackSpotifyId: track?.spotifyId
        });
        if (response.success) {
          success('Đã chia sẻ');
          currentTrack.id = response.data.trackId;
          updateTrack(currentTrack);
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
      }
    } catch (err) {
      console.log(err);
      error('Lỗi khi chia sẻ bài hát.');
    }
  };

  const handleUnFavorite = async (track) => {
    info('Chức năng đang phát triển...');
  };

  const handleFavorite = async (track) => {
    info('Chức năng đang phát triển...');
    try {
      const response = await AddFavoriteItem({
        itemType: 'track',
        itemId: track.id,
        itemSpotifyId: track.spotifyId
      });
      if (response.success) {
        success('Đã thêm bài hát vào mục yêu thích.');
        console.log(response.data)
        addFavoriteItem({
          id: response.data.id,
          itemType: 'track',
          itemId: track.id,
          itemSpotifyId: track.spotifyId
        });
      }
    } catch (err) {
      console.log(err)
      error('Lỗi khi thêm bài hát vào mục yêu thích.');
    }
  };

  useEffect(() => {
    if (duration > 0) {
      // Tính toán tỷ lệ phần trăm (giá trị từ 0 đến 100)
      const percentage = (playbackPosition / duration) * 100;
      setProgress(percentage);
    } else {
      setProgress(0); // Reset nếu không có duration
    }
  }, [playbackPosition, duration]);

  useEffect(() => {
    if (repeatMode === 'none') {
      setIsRepeat(false);
      setIsRepeatOne(false);
    } else if (repeatMode === 'all') {
      setIsRepeat(true);
      setIsRepeatOne(false);
    } else if (repeatMode === 'one') {
      setIsRepeat(true);
      setIsRepeatOne(true);
    }
  }, [repeatMode])

  useEffect(() => {
    const isFavorite = favoriteItems.some(
      (item) => item.itemId === currentTrack.id && item.itemType === 'track'
    );
    setIsFavorite(isFavorite);
  }, [favoriteItems]);

  const renderUpNextItem = ({ item, index }) => (
    <SongItem
      item={item}
      key={index}
      isQueueItem={true}
      image={item.imageUrl || ''}
      onPress={() => handleSelectTrack(item)}
      onOptionsPress={() => handleRemoveTrackFromQueue(item)}
    />
  );

  const ListHeader = () => (
    <View>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color={primaryIconColor} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className={`${colorScheme === 'dark' ? 'text-white' : 'text-black'} text-base font-semibold`}>
            {currentTrack.name}
          </Text>
        </View>
      </View>

      {/* Album Art */}
      <View className="items-center mb-4">
        <View className="relative">
          <Image
            source={{ uri: currentTrack.imageUrl || albumData.find(album => album.name === currentTrack.album)?.imageUrl || '' }}
            style={{ width: screenWidth - 32, height: screenWidth - 32 }}
            className="rounded-xl"
            resizeMode="cover"
            onError={(e) => {
              console.log("Image load error:", e.nativeEvent.error);
            }}
          />
        </View>
      </View>

      {/* Song Info and Action Buttons */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <TextTicker
            style={{
              color: colorScheme === 'dark' ? 'white' : 'black',
              fontSize: 20,
              fontWeight: 'bold'
            }}
            duration={10000}
            loop
            bounce={false}
            repeatSpacer={50}
            marqueeDelay={500}
          >
            {currentTrack.name}
          </TextTicker>
          <Text className={`${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-base`}>
            {currentTrack.artists?.map((a) => a.name).join(", ")}
          </Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity className="mr-4" onPress={() => {
            if (isFavorite) {
              handleUnFavorite(currentTrack);
              setIsFavorite(false);
            } else {
              handleFavorite(currentTrack);
              setIsFavorite(true);
            }
          }}>
            <Icon name="favorite-border" size={20} color={primaryIconColor} />
          </TouchableOpacity>
          <TouchableOpacity className="mr-4">
            <Icon name="download" size={20} color={primaryIconColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleShareTrack(currentTrack)}>
            <Icon name="share" size={20} color={primaryIconColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row justify-between items-center mb-3 px-6">
        <TouchableOpacity onPress={handleShufflePlay}>
          <Icon name="shuffle" size={24} color={isShuffle ? '#22c55e' : secondaryIconColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPrevious}>
          <Icon name="skip-previous" size={30} color={primaryIconColor} />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white rounded-full p-2 shadow-lg"
          onPress={togglePlayPause}
        >
          <Icon
            name={isPlaying ? "pause" : "play-arrow"}
            size={40}
            color={'black'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayNext}>
          <Icon name="skip-next" size={30} color={primaryIconColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRepeat}>
          <Icon name={isRepeatOne ? 'repeat-one' : 'repeat'} size={24} color={isRepeat ? '#22c55e' : secondaryIconColor} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="flex-row items-center px-3 mb-3">
        <Text className={`${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs w-8 text-center`}>
          {formatTime(playbackPosition)}
        </Text>
        <View className={`flex-1 h-1 ${colorScheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-sm mx-2`}>
          <View
            className={`h-1 ${colorScheme === 'dark' ? 'bg-green-700' : 'bg-green-500'} rounded-sm`}
            style={{ width: `${progress}%` }}
          />
        </View>
        <Text className={`${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-800'} text-xs w-8 text-center`}>
          {formatTime(duration)}
        </Text>
      </View>

      {/* Up Next Header */}
      <View className={`flex-row justify-between items-center mb-2`}>
        <Text className={`${colorScheme === 'dark' ? 'text-white' : 'text-black'} text-lg font-bold`}>Phát kế tiếp</Text>
        <TouchableOpacity onPress={() => handleSelectQueue()}>
          <Text className={`${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-base`}>Danh sách chờ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListFooter = () => (
    <View>
      <LyricsSection />
      <ArtistsSection artists={currentTrack.artists} />
    </View>
  );

  return (
    // <SafeAreaView className="flex-1">
    <ScrollView className={`flex-1 ${colorScheme === 'dark' ? 'bg-[#0E0C1F]' : 'bg-white'} px-4 pt-4`}>
      <ListHeader />
      {
        queue.slice(0, 5)
          .map((item, index) => (
            <View key={index.toString().concat(item.spotifyId)}>
              {renderUpNextItem({ item, index })}
            </View>
          ))
      }
      <ListFooter />
    </ScrollView>
    // </SafeAreaView>
  );
}
