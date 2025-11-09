import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Share, // Thêm StyleSheet để tạo bóng
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import HeaderBackButton from '@/components/button/HeaderBackButton';
import SongItem from '@/components/items/SongItem';
import CustomButton from '@/components/custom/CustomButton';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigate } from '@/hooks/useNavigate';
import { useArtistStore } from '@/store/artistStore';
import { AddTracksToPlaylists, GetAlbumsOfArtist, GetTopTracksOfArtist, ShareTrack } from '@/services/musicService';
import { usePlayerStore } from '@/store/playerStore';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import useAuthStore from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import AddTrackToPlaylistsModal from '@/components/modals/AddTrackToPlaylistsModal';
import SongItemOptionModal from '@/components/modals/SongItemOptionModal';
import ArtistSelectionModal from '@/components/modals/ArtistSelectionModal';

export default function ArtistScreen() {
  const router = useRouter();
  const { navigate } = useNavigate();
  const { info, error, success, confirm, warning } = useCustomAlert();

  const user = useAuthStore((state) => state.user);
  const currentArtist = useArtistStore((state) => state.currentArtist);
  const isFollowing = useArtistStore((state) => state.isFollowing);
  const totalFollowers = useArtistStore((state) => state.totalFollowers);
  const popularTracks = useArtistStore((state) => state.popularTracks);
  const albums = useArtistStore((state) => state.albums);
  const listTrack = usePlayerStore((state) => state.listTrack);
  const favoriteItems = useFavoritesStore((state) => state.favoriteItems);
  const setPopularTracks = useArtistStore((state) => state.setPopularTracks);
  const setAlbums = useArtistStore((state) => state.setAlbums);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setListTrack = usePlayerStore((state) => state.setListTrack);
  const setIsFollowing = useArtistStore((state) => state.setIsFollowing);
  const setCurrentAlbum = usePlayerStore((state) => state.setCurrentAlbum);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const addTrackToQueue = usePlayerStore((state) => state.addTrackToQueue);
  const addFollower = useArtistStore((state) => state.addFollower);
  const updateTrack = usePlayerStore((state) => state.updateTrack);
  const updateTotalTracksInMyPlaylists = usePlayerStore((state) => state.updateTotalTracksInMyPlaylists);
  const removeFollower = useArtistStore((state) => state.removeFollower);
  const playPlaylist = usePlayerStore((state) => state.playPlaylist);
  const shuffleQueue = usePlayerStore((state) => state.shuffleQueue);
  const unShuffleQueue = usePlayerStore((state) => state.unShuffleQueue);

  const [selectedTrack, setSelectedTrack] = useState(null);
  const [artistModalVisible, setArtistModalVisible] = useState(false);
  const [songModalVisible, setSongModalVisible] = useState(false);
  const [addTrackToPlaylistModalVisible, setAddTrackToPlaylistModalVisible] = useState(false);
  const [isShowingAllTracks, setIsShowingAllTracks] = useState(false);

  const [isLoading, setIsLoading] = useState({
    topTracks: true,
    albums: true,
  });

  const handleSongAddToPlaylist = () => {
    setSongModalVisible(false);
    setAddTrackToPlaylistModalVisible(true);
  };

  const handleSelectArtist = (artist) => {
    navigate("ArtistScreen", { artist: JSON.stringify(artist) });
    setArtistModalVisible(false);
  };

  const handleSongOptionsPress = (track) => {
    setSelectedTrack(track); // Lưu bài hát đã chọn
    console.log('track', track);
    setSongModalVisible(true); // Mở modal
  };

  const handleSongAddToQueue = (track) => {
    addTrackToQueue([track]);
    setSongModalVisible(false);
  };

  const handleSongShare = async (track) => {
    try {
      console.log('share: ', selectedTrack);
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
          selectedTrack.id = response.data.trackId;
          updateTrack(selectedTrack);
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
      }
    } catch (err) {
      console.log(err);
      error('Lỗi khi chia sẻ bài hát.');
    }
    setSongModalVisible(false);
  };

  const handleSongViewArtist = (track) => {
    if (!track.artists || track.artists.length === 0) {
      warning("Không tìm thấy thông tin nghệ sĩ.");
      return;
    }
    if (track.artists.length === 1) {
      navigate("ArtistScreen", { artist: JSON.stringify(track.artists[0]) });
      setSongModalVisible(false);
    } else {
      setSongModalVisible(false);
      setArtistModalVisible(true);
    }
  };

  const handleSongViewAlbum = (track) => {
    if (track.album && track.album.spotifyId) {
      const albumData = {
        ...track.album,
        artists: track.artists || [],
      };
      navigate("AlbumScreen", { album: JSON.stringify(albumData) });
      setSongModalVisible(false);
    } else {
      warning("Không tìm thấy thông tin album.");
    }
  };

  const handleConfirmAddTrackToPlaylists = async (playlistIds) => {
    if (!playlistIds || playlistIds.length === 0) {
      warning("Vui lòng chọn ít nhất một playlist.");
      return;
    }
    if (!selectedTrack) {
      error("Lỗi", "Không tìm thấy bài hát đã chọn.");
      return;
    }

    try {
      const trackSpotifyIds = [selectedTrack.spotifyId];
      const response = await AddTracksToPlaylists({
        playlistIds: playlistIds,
        trackSpotifyIds: trackSpotifyIds
      });

      if (response.success) {
        playlistIds.forEach(id => {
          updateTotalTracksInMyPlaylists(id, 1);
        });
        success('Đã thêm bài hát vào playlist thành công!');
      }
    } catch (err) {
      console.log(err);
      error('Lỗi', 'Đã có lỗi xảy ra khi thêm bài hát.');
    } finally {
      setAddTrackToPlaylistModalVisible(false);
    }
  };

  const handlePlayTrack = (track,) => {
    const playIndex = listTrack.findIndex(t =>
      (t.spotifyId && t.spotifyId === track.spotifyId) ||
      (t.id && t.id === track.id)
    );

    if (playIndex === -1) return;
    playPlaylist(listTrack, playIndex);
    const queueData = listTrack.slice(playIndex + 1);

    setCurrentTrack(track);
    setQueue(queueData);
  };



  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        const response = await GetTopTracksOfArtist(currentArtist.spotifyId);
        if (response.success === true) {
          setPopularTracks(response.data);
          setIsLoading((prev) => ({ ...prev, topTracks: false }));

        }
      } catch (err) {
        console.log('Error fetching top tracks:', err);
      }
    }

    const fetchAlbums = async () => {
      try {
        const response = await GetAlbumsOfArtist(currentArtist.spotifyId);
        if (response.success === true) {
          setAlbums(response.data);
          setIsLoading((prev) => ({ ...prev, albums: false }));
        }
      } catch (err) {
        console.log('Error fetching albums:', err);
      }
    }

    console.log('curret artist: ', currentArtist);
    if (currentArtist) {
      fetchTopTracks();
      fetchAlbums();
    }
  }, [currentArtist]);

  const displayedTracks = useMemo(() => {
    if (isShowingAllTracks) {
      return popularTracks; // Hiển thị tất cả
    }
    return popularTracks.slice(0, 5); // Chỉ hiển thị 5
  }, [popularTracks, isShowingAllTracks]);

  const renderSongItem = ({ item }: { item: any }) => (
    <SongItem
      item={item}
      image={item.imageUrl || ''}
      onPress={() => handlePlayTrack(item)}
      onOptionsPress={() => handleSongOptionsPress(item)}
    />
  );

  const renderAlbumItem = ({ item }: { item: any }) => (
    <TouchableOpacity
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
      <View className="relative w-full h-80">
        <Image
          source={{ uri: currentArtist?.imageUrl }}
          className="w-full h-full object-cover"
        />
        <View className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Header */}
        <View className="absolute top-0 left-0 right-0 p-4 z-10 flex-row items-center">
          <HeaderBackButton onPress={() => router.back()} />
          <View className="flex-1" />
        </View>

        {/* Tên nghệ sĩ */}
        <Text className="absolute bottom-4 left-4 text-white text-4xl font-extrabold">
          {currentArtist.name}
        </Text>
      </View>

      <View className="p-4">
        <View className="flex-row items-center mb-6 gap-2">
          <CustomButton
            title={isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
            onPress={() => { }}
            iconName={isFollowing ? 'checkmark' : 'add'}
          />
          <CustomButton
            title=""
            onPress={() => { }}
            iconName="ellipsis-vertical"
          />
          <View className="flex-1" />
          <CustomButton
            title=""
            onPress={() => { }}
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
          <FlatList
            // +++ 3. CẬP NHẬT DATA ĐỂ HIỂN THỊ +++
            data={isShowingAllTracks ? popularTracks : popularTracks.slice(0, 5)}
            keyExtractor={(item) => item.spotifyId || item.id.toString()}
            renderItem={renderSongItem}
            scrollEnabled={false}
          />
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
            <FlatList
              data={albums}
              renderItem={renderAlbumItem}
              keyExtractor={(item) => item.spotifyId}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            />
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
          onAddToQueue={() => handleSongAddToQueue(selectedTrack)}
          onAddToPlaylist={handleSongAddToPlaylist}
          onRemoveFromPlaylist={() => { }}
          onViewAlbum={() => handleSongViewAlbum(selectedTrack)}
          onViewArtist={() => handleSongViewArtist(selectedTrack)}
          onShare={() => handleSongShare(selectedTrack)}
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
    </ScrollView>
  );
}