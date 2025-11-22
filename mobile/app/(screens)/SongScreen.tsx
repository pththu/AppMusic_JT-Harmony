import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import TrackCommentsModal from "@/components/modals/TrackCommentsModal";
import ArtistsSection from "@/components/artists/ArtistsSection";
import { useNavigate } from "@/hooks/useNavigate";
import { usePlayerStore } from "@/store/playerStore";
import { router } from "expo-router";
import { albumData, trackData } from "@/constants/data";
import SongItem from "@/components/items/SongItem";
import TextTicker from "react-native-text-ticker";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { ShareTrack } from "@/services/musicService";
import useAuthStore from "@/store/authStore";
import { AddFavoriteItem, RemoveFavoriteItem } from "@/services/favoritesService";
import { useFavoritesStore } from "@/store/favoritesStore";
import { fetchCoversBySongId } from "@/services/coverService";
import CoverItem from "@/components/items/CoverItem";
import PlayerProgressBar from "@/components/player/PlayerProgressBar";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function SongScreen() {
  const { navigate } = useNavigate();
  const { info, error, success } = useCustomAlert();
  const colorScheme = useColorScheme();

  const user = useAuthStore((state) => state.user);
  // const playbackPosition = usePlayerStore((state) => state.playbackPosition)
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  // const duration = usePlayerStore((state) => state.duration);
  const isShuffled = usePlayerStore((state) => state.isShuffled);
  const queue = usePlayerStore((state) => state.queue);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const favoriteItems = useFavoritesStore((state) => state.favoriteItems);
  const addFavoriteItem = useFavoritesStore((state) => state.addFavoriteItem);
  const removeFavoriteItem = useFavoritesStore((state) => state.removeFavoriteItem);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setPlaybackPosition = usePlayerStore((state) => state.setPlaybackPosition);
  const setRepeatMode = usePlayerStore((state) => state.setRepeatMode);
  const setIsShuffled = usePlayerStore((state) => state.setIsShuffled);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);
  const playTrackFromQueue = usePlayerStore((state) => state.playTrackFromQueue);
  const shuffleQueue = usePlayerStore((state) => state.shuffleQueue);
  const unShuffleQueue = usePlayerStore((state) => state.unShuffleQueue);
  const removeTrackFromQueue = usePlayerStore((state) => state.removeTrackFromQueue);
  const updateTrack = usePlayerStore((state) => state.updateTrack);

  const primaryIconColor = colorScheme === 'dark' ? 'white' : 'black';
  const secondaryIconColor = colorScheme === 'dark' ? '#888' : 'gray';

  const [isRepeat, setIsRepeat] = useState(false);
  const [isRepeatOne, setIsRepeatOne] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [progress, setProgress] = useState(0);
  const [trackCommentsVisible, setTrackCommentsVisible] = useState(false);
  const [defaultTimecodeMs, setDefaultTimecodeMs] = useState<number | null>(null);

  //get height window

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) {
      return "0:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // const handleCommentAtCurrentTime = () => {
  //   const timecodeMs = Math.max(0, Math.floor((playbackPosition || 0) * 1000));
  //   setDefaultTimecodeMs(timecodeMs);
  //   setTrackCommentsVisible(true);
  // };

  // State cho covers
  const [covers, setCovers] = useState<any[]>([]);
  const [loadingCovers, setLoadingCovers] = useState(false);

  // Load covers khi component mount
  useEffect(() => {
    const loadCovers = async () => {
      if (currentTrack?.id) {
        setLoadingCovers(true);
        try {
          const coversData = await fetchCoversBySongId(currentTrack.id);
          setCovers(coversData.slice(0, 3)); // Chỉ lấy top 3 covers
        } catch (error) {
          console.error('Error loading covers:', error);
        } finally {
          setLoadingCovers(false);
        }
      }
    };
    loadCovers();
  }, [currentTrack?.id]);

  const handleSelectQueue = () => {
    if (!currentTrack) return;
    navigate("QueueScreen");
  };

  const handleSelectTrack = (track) => {
    setCurrentTrack(track);
    // navigate('SongScreen');
  }

  const handlePlayPrevious = () => {
    console.log('preve')
    if (!currentTrack) return;
    if (currentIndex === 0) {
      setPlaybackPosition(0);
    }
    playPrevious();
  }

  const handlePlayNext = () => {
    console.log('next')
    playNext();
  }

  const handleShufflePlay = () => {
    console.log('handleShufflePlay: ', isShuffled)
    if (isShuffled) {
      unShuffleQueue();
    } else {
      shuffleQueue();
    }
    setIsShuffled(!isShuffled);
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
        console.log(response.data)
        if (response.success) {
          success('Đã chia sẻ');
          currentTrack.id = response.data.trackId;
          setCurrentTrack(currentTrack);
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
    try {
      console.log('un')
      setIsLoading(true);
      // console.log(favoriteItems)
      const favoriteItem = favoriteItems.find(
        (item) => item?.itemType === 'track' && (item?.itemId === track?.id || item?.itemSpotifyId === track?.spotifyId)
      );

      if (!favoriteItem) {
        error('Bài hát không có trong mục yêu thích.');
        return;
      }

      const response = await RemoveFavoriteItem(favoriteItem.id);
      if (response.success) {
        removeFavoriteItem(favoriteItem);
        setIsFavorite(false);
        setIsLoading(false);
      }
    } catch (err) {
      console.log(err);
      error('Lỗi khi xóa bài hát khỏi mục yêu thích.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = async (track) => {
    try {
      setIsLoading(true);
      console.log('fav')
      const response = await AddFavoriteItem({
        itemType: 'track',
        itemId: track.id,
        itemSpotifyId: track.spotifyId
      });
      if (response.success) {
        setIsFavorite(true);
        console.log('response.data ui', response.data)
        addFavoriteItem(response.data[0]);
      }
    } catch (err) {
      console.log(err)
      error('Lỗi khi thêm bài hát vào mục yêu thích.');
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   if (duration > 0) {
  //     const percentage = (playbackPosition / duration) * 100;
  //     setProgress(percentage);
  //   } else {
  //     setProgress(0);
  //   }
  // }, [playbackPosition, duration]);

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
    // console.log('current', currentTrack)
    if (favoriteItems) {
      const isFavorite = favoriteItems.some(
        (item) => item?.itemType === 'track' && (item?.itemSpotifyId === currentTrack?.spotifyId || (currentTrack?.id !== null && item?.itemId === currentTrack?.id))
      );
      setIsFavorite(isFavorite);
    }
  }, []);

  const handleViewAllCovers = () => {
    // Navigate to SocialScreen with covers filter
    navigate("SocialScreen", { filter: "covers", songId: currentTrack.id });
  };

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
          <TouchableOpacity
            className="mr-4 p-4"
            onPress={() => {
              if (isFavorite) {
                handleUnFavorite(currentTrack);
              } else {
                handleFavorite(currentTrack);
              }
            }}
            activeOpacity={0.5}
          >
            <Icon name={isFavorite ? "favorite" : "favorite-border"} size={20} color={isFavorite ? '#ef4444' : primaryIconColor} />
          </TouchableOpacity>
          <TouchableOpacity className="mr-4 p-4" activeOpacity={0.5}>
            <Icon name="download" size={20} color={primaryIconColor} />
          </TouchableOpacity>
          <TouchableOpacity className="p-4" onPress={() => handleShareTrack(currentTrack)} activeOpacity={0.5}>
            <Icon name="share" size={20} color={primaryIconColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row justify-between items-center mb-3 px-6">
        <TouchableOpacity onPress={handleShufflePlay} className="p-4">
          <Icon name="shuffle" size={24} color={isShuffled ? '#22c55e' : secondaryIconColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPrevious} className="p-4">
          <Icon name="skip-previous" size={30} color={primaryIconColor} />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white rounded-full p-4 shadow-lg"
          onPress={togglePlayPause}
        >
          <Icon
            name={isPlaying ? "pause" : "play-arrow"}
            size={40}
            color={'black'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayNext} className="p-4">
          <Icon name="skip-next" size={30} color={primaryIconColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRepeat} className="p-4">
          <Icon name={isRepeatOne ? 'repeat-one' : 'repeat'} size={24} color={isRepeat ? '#22c55e' : secondaryIconColor} />
        </TouchableOpacity>
      </View>

      <PlayerProgressBar />

      {/* Comment at current time */}
      {/* <View className="items-end px-3 mb-4">
        <TouchableOpacity onPress={handleCommentAtCurrentTime} className="px-3 py-1 rounded-full bg-indigo-500 flex-row items-center">
          <Icon name="comment" size={16} color="#fff" />
          <Text className="text-white font-semibold ml-2">Bình luận tại {formatTime(playbackPosition)}</Text>
        </TouchableOpacity>
      </View> */}

      {/* Track Comments Modal */}
      {/* <TrackCommentsModal
        visible={trackCommentsVisible}
        onClose={() => setTrackCommentsVisible(false)}
        trackId={currentTrack?.id}
        defaultTimecodeMs={defaultTimecodeMs}
        onUserPress={(userId) => navigate("ProfileSocialScreen", { userId })}
      /> */}

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
      {/* Community Covers Section */}
      {covers.length > 0 && (
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-black dark:text-white text-lg font-bold">Community Covers</Text>
            <TouchableOpacity onPress={handleViewAllCovers}>
              <Text className="text-gray-600 dark:text-gray-400 text-base">Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {/* {covers.map((cover, index) => (
            <CoverItem
              key={cover.id || index}
              item={cover}
              onPress={() => {
                // Handle cover press - maybe play the cover
                console.log('Play cover:', cover);
              }}
              onUserPress={(userId) => navigate("ProfileSocialScreen", { userId })}
              onVotePress={() => {
                // Handle vote
                console.log('Vote for cover:', cover.id);
              }}
            />
          ))} */}
        </View>
      )}

    </View>
  );

  return (
    // <SafeAreaView className="flex-1">
    <ScrollView className={`flex-1 ${colorScheme === 'dark' ? 'bg-[#0E0C1F]' : 'bg-white'}`}
    >
      {isLoading && (
        <View className="absolute top-0 right-0 left-0 bottom-0 z-10 bg-black/50 justify-start items-center"
        >
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      )}
      <View className="px-4 pt-4">
        <ListHeader />
        {
          queue.slice(0, 5)
            .map((item, index) => (
              <View key={index.toString().concat(item.spotifyId)}>
                {renderUpNextItem({ item, index })}
              </View>
            ))
        }
        {/* <LyricsSection /> */}
      </View>
      <ArtistsSection artists={currentTrack.artists} onPress={() => { }} />
    </ScrollView>
    // </SafeAreaView>
  );
}
