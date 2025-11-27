import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Pressable,
  useColorScheme,
  ImageBackground, // Thêm StyleSheet để tạo bóng
} from 'react-native';
import { useRouter } from 'expo-router';
import SongItem from '@/components/items/SongItem';
import CustomButton from '@/components/custom/CustomButton';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigate } from '@/hooks/useNavigate';
import { useFollowStore } from '@/store/followStore';
import { AddTracksToPlaylists } from '@/services/musicService';
import { usePlayerStore } from '@/store/playerStore';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import useAuthStore from '@/store/authStore';
import AddTrackToPlaylistsModal from '@/components/modals/AddTrackToPlaylistsModal';
import SongItemOptionModal from '@/components/modals/SongItemOptionModal';
import ArtistSelectionModal from '@/components/modals/ArtistSelectionModal';
import ArtistOptionModal from '@/components/modals/ArtistOptionModal';
import { FollowArtist, UnfollowArtist } from '@/services/followService';
import { useMusicAction } from '@/hooks/useMusicAction';
import { useArtistData } from '@/hooks/useArtistData';

export default function ArtistScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const { info, error, success, warning } = useCustomAlert();

  const isGuest = useAuthStore((state) => state.isGuest);
  const currentArtist = useFollowStore((state) => state.currentArtist);
  const isFollowing = useFollowStore((state) => state.isFollowing);
  const popularTracks = useFollowStore((state) => state.popularTracks);
  const albums = useFollowStore((state) => state.albums);
  const artistFollowed = useFollowStore((state) => state.artistFollowed);
  const isShuffled = usePlayerStore((state) => state.isShuffled);

  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setCurrentArtist = useFollowStore((state) => state.setCurrentArtist);
  const setIsFollowing = useFollowStore((state) => state.setIsFollowing);
  const setCurrentAlbum = usePlayerStore((state) => state.setCurrentAlbum);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const setIsShuffled = usePlayerStore((state) => state.setIsShuffled);
  const addArtistFollowed = useFollowStore((state) => state.addArtistFollowed);
  const removeArtistFollowed = useFollowStore((state) => state.removeArtistFollowed);
  const updateTotalTracksInMyPlaylists = usePlayerStore((state) => state.updateTotalTracksInMyPlaylists);
  const playPlaylist = usePlayerStore((state) => state.playPlaylist);
  const shuffleQueue = usePlayerStore((state) => state.shuffleQueue);
  const unShuffleQueue = usePlayerStore((state) => state.unShuffleQueue);

  const [artistOptionModalVisible, setArtistOptionModalVisible] = useState(false);
  const [isShowingAllTracks, setIsShowingAllTracks] = useState(false);

  const primaryIconColor = colorScheme === 'dark' ? 'white' : 'black';

  const {
    selectedTrack,
    songModalVisible,
    artistModalVisible,
    addTrackToPlaylistModalVisible,

    handleSelectArtist,
    handleAddTrackToQueue,
    handleTrackAddToPlaylist,
    handleShareTrack,
    handleShareArtist,
    handlePlayTrack,
    handleTrackViewAlbum,
    handleTrackViewArtist,
    handleTrackOptionPress,
    handleConfirmAddTrackToPlaylists,
    setAddTrackToPlaylistModalVisible,
    saveArtistToListeningHistory,
    setSongModalVisible,
    setArtistModalVisible,
  } = useMusicAction();

  const {
    isLoading,
    setIsLoading,
  } = useArtistData(currentArtist);


  // const handleConfirmAddTrackToPlaylists = async (playlistIds) => {
  //   if (!playlistIds || playlistIds.length === 0) {
  //     warning("Vui lòng chọn ít nhất một playlist.");
  //     return;
  //   }
  //   if (!selectedTrack) {
  //     error("Lỗi", "Không tìm thấy bài hát đã chọn.");
  //     return;
  //   }

  //   try {
  //     const trackSpotifyIds = [selectedTrack.spotifyId];
  //     const response = await AddTracksToPlaylists({
  //       playlistIds: playlistIds,
  //       trackSpotifyIds: trackSpotifyIds
  //     });

  //     if (response.success) {
  //       playlistIds.forEach(id => {
  //         updateTotalTracksInMyPlaylists(id, 1);
  //       });
  //       success('Đã thêm bài hát vào playlist thành công!');
  //     }
  //   } catch (err) {
  //     error('Lỗi', 'Đã có lỗi xảy ra khi thêm bài hát.' + err.message);
  //   } finally {
  //     setAddTrackToPlaylistModalVisible(false);
  //   }
  // };

  const handlePlayTopTracks = async () => {
    if (popularTracks.length === 0) {
      warning("Không có bài hát để phát.");
      return;
    }

    playPlaylist(popularTracks, 0);
    const queueData = popularTracks.slice(1);
    setCurrentTrack(popularTracks[0]);
    setQueue(queueData);

    saveArtistToListeningHistory();
  }

  const handleToggleShuffle = () => {
    if (isShuffled) {
      unShuffleQueue();
    } else {
      shuffleQueue();
    }
    setIsShuffled(!isShuffled);
  };

  const handleToggleFollow = async () => {
    if (isGuest) {
      info("Hãy đăng nhập để sử dụng chức năng này.");
      return;
    }

    if (isFollowing) {
      handleUnfollow();
    } else {
      handleFollow();
    }
  };

  const handleFollow = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, following: true }));
      const response = await FollowArtist({
        artistId: currentArtist?.id || null,
        artistSpotifyId: currentArtist?.spotifyId
      });

      if (response.success) {
        if (!currentArtist?.id) {
          currentArtist.id = response.data.artistId;
          setCurrentArtist(currentArtist);
        }
        addArtistFollowed(response.data);
        currentArtist.totalFollower += 1;
        setCurrentArtist(currentArtist);
        setIsFollowing(true);
      }
    } catch (err) {
      error('Lỗi khi theo dõi nghệ sĩ. Vui lòng thử lại sau: ' + err.message);
    } finally {
      setIsLoading((prev) => ({ ...prev, following: false }));
    }
  };

  const handleUnfollow = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, following: true }));
      const followId = artistFollowed.find(f => f.artistSpotifyId === currentArtist.spotifyId)?.id;
      if (!followId) {
        error('Bạn chưa theo dõi nghệ sĩ này.');
        return;
      }
      const response = await UnfollowArtist({
        followId: followId
      });
      if (response.success) {
        setIsFollowing(false);
        currentArtist.totalFollower -= 1;
        setCurrentArtist(currentArtist);
        removeArtistFollowed(followId);
      }
    } catch (err) {
      error('Lỗi khi hủy theo dõi nghệ sĩ. Vui lòng thử lại sau: ' + err.message);
    } finally {
      setIsLoading((prev) => ({ ...prev, following: false }));
    }
  }

  const handleBlock = async () => {
    if (isGuest) {
      warning("Hãy đăng nhập để sử dụng chức năng này.");
      return;
    }
    info('Chức năng đang phát triển');
  };

  const renderSongItem = ({ item, index }) => (
    <SongItem
      key={item.id || item.spotifyId}
      item={item}
      image={item.imageUrl || ''}
      onPress={() => handlePlayTrack(item, index)}
      onOptionsPress={() => handleTrackOptionPress(item)}
    />
  );

  const renderAlbumItem = ({ item }) => (
    <TouchableOpacity
      key={item.id || item.spotifyId}
      className="mr-4 w-36"
      onPress={() => {
        setCurrentAlbum(item);
        navigate('AlbumScreen')
      }}
    >
      <Image
        source={{ uri: item.imageUrl }}
        className="w-36 h-36 rounded-lg bg-gray-300"
      />
      <Text
        className="text-black dark:text-white text-sm font-semibold mt-2"
        numberOfLines={1}
      >
        {item.name}
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 text-xs">
        {item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'Album'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-white dark:bg-[#0E0C1F]">
      {isLoading.following && (
        <View className="absolute top-0 right-0 left-0 bottom-0 z-10 bg-black/50 justify-center items-center">
          <View className='mt-10'>
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        </View>
      )}

      <View className='w-full h-96'>
        <View className='mt-5 w-full h-80'>
          <ImageBackground
            source={{ uri: currentArtist?.imageUrl || '' }}
            className='w-full h-full'
          />
          <TouchableOpacity
            className='absolute top-5 left-4 p-2 bg-black/50 rounded-full'
            onPress={() => router.back()}
          >
            <Icon name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-black dark:text-white text-3xl font-bold mt-2 px-4">
          {currentArtist?.name || 'Nghệ sĩ'}
        </Text>
      </View>

      <View className="px-4 mt-2">
        <View className="flex-row items-center mb-6 gap-2">
          <CustomButton
            title={isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
            onPress={() => handleToggleFollow()}
            iconName={isFollowing ? 'checkmark' : 'add'}
          />
          <CustomButton
            title=""
            onPress={() => setArtistOptionModalVisible(true)}
            iconName="ellipsis-vertical"
          />
          <View className="flex-1" />
          <Pressable onPress={handleToggleShuffle}>
            <Icon
              name="shuffle"
              color={isShuffled ? '#22c55e' : primaryIconColor}
              size={28} />
          </Pressable>
          <CustomButton
            title=""
            onPress={handlePlayTopTracks}
            iconName="play"
          />
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-black dark:text-white text-xl font-bold">
            Bài hát nổi bật
          </Text>
          <TouchableOpacity onPress={() => setIsShowingAllTracks(!isShowingAllTracks)}>
            <Text className="text-gray-600 dark:text-gray-400 font-semibold">
              {isShowingAllTracks ? 'Ẩn bớt' : 'Xem tất cả'}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading.topTracks ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#22c55e" />
            <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
          </View>
        ) : (
          <ScrollView className="mb-4">
            {(isShowingAllTracks ? popularTracks : popularTracks.slice(0, 5)).map((item, index) => {
              return (
                <View key={item.id || item.spotifyId}>
                  {renderSongItem({ item, index })}
                </View>
              )
            })}

          </ScrollView>
        )}

        {/* Danh sách Album */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-black dark:text-white text-xl font-bold">
              Album
            </Text>
          </View>
          {isLoading.albums ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
            </View>
          ) : (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="pb-4">
              {albums.map((item) => {
                return (
                  <View key={item.spotifyId}>
                    {renderAlbumItem({ item })}
                  </View>
                )
              })}
            </ScrollView>
          )}
        </View>
      </View>
      <View className="h-20" />
      {addTrackToPlaylistModalVisible && selectedTrack && (
        <AddTrackToPlaylistsModal
          isVisible={addTrackToPlaylistModalVisible}
          setIsVisible={setAddTrackToPlaylistModalVisible}
          trackToAdd={selectedTrack}
          currentPlaylistIdToExclude={null}
          onAddToPlaylist={handleConfirmAddTrackToPlaylists}
          onCreateNewPlaylist={() => {
            setAddTrackToPlaylistModalVisible(false);
            info("Chức năng đang phát triển");
          }}
        />
      )}

      {songModalVisible && selectedTrack && (
        <SongItemOptionModal
          isVisible={songModalVisible}
          setIsVisible={setSongModalVisible}
          track={selectedTrack}
          isMine={false}
          onAddToQueue={() => handleAddTrackToQueue(selectedTrack)}
          onAddToPlaylist={handleTrackAddToPlaylist}
          onRemoveFromPlaylist={() => { }}
          onViewAlbum={() => handleTrackViewAlbum(selectedTrack)}
          onViewArtist={() => handleTrackViewArtist(selectedTrack)}
          onShare={() => handleShareTrack(selectedTrack)}
        />
      )}

      {artistModalVisible && selectedTrack && (
        <ArtistSelectionModal
          isVisible={artistModalVisible}
          setIsVisible={setArtistModalVisible}
          artists={selectedTrack.artists}
          onSelectArtist={handleSelectArtist}
        />
      )}

      {artistOptionModalVisible && (
        <ArtistOptionModal
          isVisible={artistOptionModalVisible}
          setIsVisible={setArtistOptionModalVisible}
          data={currentArtist}
          isFollowing={isFollowing}
          onFollow={handleToggleFollow}
          onShare={handleShareArtist}
          onBlock={handleBlock}
        />
      )}
    </ScrollView>
  );
}