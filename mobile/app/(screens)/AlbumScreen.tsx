import { View, Text, useColorScheme, Animated, Image, Pressable, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Share, Dimensions } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { usePlayerStore } from '@/store/playerStore';
import { useNavigate } from '@/hooks/useNavigate';
import SongItem from '@/components/items/SongItem';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Icon from "react-native-vector-icons/Ionicons";
import { AddTracksToPlaylists, CreatePlaylist, GetTracksByAlbumId, ShareAlbum, ShareTrack } from '@/services/musicService';
import { useFavoritesStore } from '@/store/favoritesStore';
import * as ImagePicker from 'expo-image-picker';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import useAuthStore from '@/store/authStore';
import AddPlaylistModal from '@/components/modals/AddPlaylistModal';
import AddToAnotherPlaylistModal from '@/components/modals/AddToAnotherPlaylistModal';
import AlbumOptionModal from '@/components/modals/AlbumOptionModal';
import SongItemOptionModal from '@/components/modals/SongItemOptionModal';
import ArtistSelectionModal from '@/components/modals/ArtistSelectionModal';
import { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";
import { AddFavoriteItem, RemoveFavoriteItem } from '@/services/favoritesService';

const HEADER_SCROLL_THRESHOLD = 256;
const screenHeight = Dimensions.get("window").height;

const AlbumScreen = () => {
  const { navigate } = useNavigate();
  const { info, error, success, confirm, warning } = useCustomAlert();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();

  const user = useAuthStore((state) => state.user);
  const currentAlbum = usePlayerStore((state) => state.currentAlbum);
  const favoriteItems = useFavoritesStore((state) => state.favoriteItems);
  const listTrack = usePlayerStore((state) => state.listTrack);
  const isMiniPlayerVisible = usePlayerStore((state) => state.isMiniPlayerVisible);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setCurrentAlbum = usePlayerStore((state) => state.setCurrentAlbum);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const setListTrack = usePlayerStore((state) => state.setListTrack);
  const addFavoriteItem = useFavoritesStore((state) => state.addFavoriteItem);
  const addToMyPlaylists = usePlayerStore((state) => state.addToMyPlaylists);
  const addTrackToQueue = usePlayerStore((state) => state.addTrackToQueue);
  const updateMyPlaylists = usePlayerStore((state) => state.updateMyPlaylists);
  const updateTotalTracksInMyPlaylists = usePlayerStore((state) => state.updateTotalTracksInMyPlaylists);
  const updateTrack = usePlayerStore((state) => state.updateTrack);
  const removeFavoriteItem = useFavoritesStore((state) => state.removeFavoriteItem);
  const shuffleQueue = usePlayerStore((state) => state.shuffleQueue);
  const playPlaylist = usePlayerStore((state) => state.playPlaylist);
  const unShuffleQueue = usePlayerStore((state) => state.unShuffleQueue);

  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAddToPlaylistVisible, setModalAddToPlaylistVisible] = useState(false);
  const [modalAddPlaylistVisible, setModalAddPlaylistVisible] = useState(false);
  const [modalTrackVisible, setModalTrackVisible] = useState(false);
  const [modalArtistVisible, setModalArtistVisible] = useState(false);

  const [tracks, setTracks] = useState([]);
  const [album, setAlbum] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [newIsPublic, setNewIsPublic] = useState(true);

  const opacity = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const iconColor = colorScheme === 'light' ? '#000' : '#fff';

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      warning('Ứng dụng cần quyền truy cập thư viện ảnh!');
      return false;
    }
    return true;
  };

  const handlePlayTrack = (track, index) => {
    playPlaylist(listTrack, index);
    const queueData = listTrack.filter((item, i) => {
      if (i > index)
        return item;
    });
    setCurrentTrack(track);
    setQueue(queueData);
  };

  const handleSongOptionsPress = (track) => {
    setSelectedTrack(track); // Lưu bài hát đã chọn
    console.log('track', track);
    setModalTrackVisible(true); // Mở modal
  };

  const handlePickerImage = async (image, setImage) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      error('Quyền truy cập bị từ chối!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleShareAlbum = async () => {
    setModalVisible(false);
    try {
      let shareMessage = `${user?.fullName} muốn chia sẻ với bạn album: `;
      shareMessage += `${currentAlbum?.name}\n\n`;
      if (currentAlbum?.imageUrl) {
        shareMessage += `${currentAlbum?.imageUrl}\n\n`;
      }
      const albumLink = `app://album/${currentAlbum?.spotifyId}`;
      shareMessage += `Nghe album: ${albumLink}`;

      const result = await Share.share({
        message: shareMessage,
      });

      if (result.action === Share.sharedAction) {
        success('Đã chia sẻ');
        if (result.activityType) {
          console.log(result.activityType)
        } else {
          console.log('Chia sẻ thành công!');
        }
        const response = await ShareAlbum({
          albumId: currentAlbum?.id,
          albumSpotifyId: currentAlbum?.spotifyId
        });

        if (response.success) {
          currentAlbum.id = response.data?.albumId;
          setCurrentAlbum(currentAlbum);
          console.log('album sau khi them id: ', currentAlbum);
        }
      }
    } catch (err) {
      console.error('Lỗi khi chia sẻ:', err);
      error('Lỗi khi chia sẻ album.');
    }
  };

  const handlePlayAlbum = () => {
    if (!listTrack || listTrack?.length === 0) {
      warning('Album không có bài hát để phát!');
      return;
    }

    playPlaylist(listTrack, 0);
    const queueData = listTrack.filter((item, index) => {
      if (index > 0)
        return item;
    });
    setQueue(queueData);
    setCurrentTrack(listTrack[0])
  }

  const handleAddFavorite = async (album) => {
    try {
      setIsFavoriteLoading(true);
      console.log('fav')
      const response = await AddFavoriteItem({
        itemType: 'album',
        itemId: album?.id,
        itemSpotifyId: album.spotifyId
      });
      if (response.success) {
        console.log('response.data album:', response.data)
        setIsFavorite(true);
        setIsFavoriteLoading(false);
        addFavoriteItem(response.data[0]);
      }
    } catch (err) {
      console.log(err)
      error('Lỗi khi thêm album vào mục yêu thích.');
    }
  }

  const handleUnFavorite = async (album) => {
    try {
      console.log('un')
      setIsFavoriteLoading(true);
      const favoriteItem = favoriteItems.find((item) => {
        if (item?.itemType === 'album') {
          if ((album?.id && (item?.itemId === album?.id))
            || (album?.spotifyId && (item?.itemSpotifyId === album?.spotifyId))) {
            return true;
          }
        }
        return false;
      });

      if (!favoriteItem) {
        error('Album không có trong mục yêu thích.');
        return;
      }

      const response = await RemoveFavoriteItem(favoriteItem?.id);
      if (response.success) {
        removeFavoriteItem(favoriteItem);
        setIsFavorite(false);
        setIsFavoriteLoading(false);
      }
    } catch (err) {
      console.log(err);
      error('Lỗi khi xóa playlist khỏi mục yêu thích.');
    }
  };

  const handleAddToQueue = () => {
    setModalVisible(false);
    if (!listTrack || listTrack.length === 0) {
      warning('Album không có bài hát để thêm vào hàng đợi!');
      return;
    }
    addTrackToQueue(listTrack);
    success(`Đã thêm ${listTrack.length} bài hát vào hàng đợi!`);
  };

  const handleDownloadAlbum = () => {
    setModalVisible(false);
    info('Chức năng tải album sẽ được cập nhật sau!');
  };

  // Mở modal chọn playlist
  const handleAddToPlaylist = () => {
    setModalVisible(false);
    if (!listTrack || listTrack?.length === 0) {
      warning('Album không có bài hát để thêm vào playlist!');
      return;
    }
    setModalAddToPlaylistVisible(true);
  };

  // Xử lý khi xác nhận thêm (từ AddToAnotherPlaylistModal)
  const handleConfirmAddToPlaylist = async (playlistIds) => {
    if (!playlistIds || !playlistIds.length) {
      warning('Vui lòng chọn ít nhất một playlist!');
      return;
    }
    try {
      const trackIds = listTrack.map(track => track.spotifyId);
      const response = await AddTracksToPlaylists({
        playlistIds: playlistIds,
        trackSpotifyIds: trackIds
      });

      if (response.success) {
        playlistIds.forEach(id => {
          updateTotalTracksInMyPlaylists(id, listTrack.length);
        });
        success('Đã thêm các bài hát vào playlist thành công!');
      }
    } catch (err) {
      console.log(err);
      error('Lỗi', 'Đã có lỗi xảy ra khi thêm bài hát vào playlist.');
    } finally {
      setModalAddToPlaylistVisible(false);
    }
  };

  const handleSongAddToQueue = (track) => {
    addTrackToQueue([track]);
    setModalTrackVisible(false);
  };

  const handleSongAddToPlaylist = () => {
    setModalTrackVisible(false);
    setModalAddToPlaylistVisible(true);
  };

  const handleSongViewArtist = (track) => {
    if (!track?.artists || track?.artists?.length === 0) {
      warning("Không tìm thấy thông tin nghệ sĩ.");
      return;
    }
    if (track?.artists?.length === 1) {
      navigate("ArtistScreen", { artist: JSON.stringify(track?.artists[0]) });
      setModalTrackVisible(false);
    } else {
      setModalTrackVisible(false);
      setModalArtistVisible(true);
    }
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
    setModalTrackVisible(false);
  };

  const handleSelectArtist = (artist) => {
    navigate("ArtistScreen", { artist: JSON.stringify(artist) });
    setModalArtistVisible(false);
  };


  // Xử lý khi tạo playlist mới (từ AddPlaylistModal)
  const handleAddPlaylist = async () => {
    try {
      const payload = {
        image: newImage || null,
        name: newName,
        description: newDescription,
        isPublic: newIsPublic
      };
      const response = await CreatePlaylist(payload);

      if (response.success) {
        setNewImage(null);
        addToMyPlaylists(response.playlist);
        const playlistIds = [response.playlist?.id];
        const trackIds = listTrack.map(track => track.spotifyId);

        if (trackIds.length > 0) {
          const addResponse = await AddTracksToPlaylists({
            playlistIds: playlistIds,
            trackSpotifyIds: trackIds
          });
          if (addResponse.success) {
            updateTotalTracksInMyPlaylists(response.playlist?.id, trackIds.length);
            success('Đã tạo playlist và thêm bài hát thành công!');
          }
        }
      }
    } catch (error) {
      error('Không thể tạo playlist. Vui lòng thử lại!', error.message);
    } finally {
      setNewName("");
      setNewDescription("");
      setNewImage(null);
      setNewIsPublic(false);
      setModalAddPlaylistVisible(false);
    }
  };

  const checkIsFavorite = () => {
    setIsFavorite(false);
    favoriteItems.forEach(
      (item) => {
        if (item?.itemType === 'album') {
          if ((currentAlbum?.id && (item?.itemId === currentAlbum?.id))
            || (currentAlbum?.spotifyId && (item?.itemSpotifyId === currentAlbum?.spotifyId))) {
            console.log(12)
            setIsFavorite(true);
            return;
          }
        }
      }
    )
    return;
  }

  useEffect(() => {
    checkIsFavorite();
  }, []);

  useEffect(() => {
    const fetchTracks = async () => {
      if (currentAlbum) {
        const response = await GetTracksByAlbumId(currentAlbum?.spotifyId);
        if (response.success) {
          response.data?.map((track) => {
            track.imageUrl = currentAlbum?.imageUrl;
          });
          setTracks(response.data);
          setListTrack(response.data);
          setIsLoading(false);
        }
      }
    };
    fetchTracks();
  }, []);

  useEffect(() => {
    if (currentAlbum) {
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
  }, [currentAlbum]);

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

  const renderRecentlyPlayedItem = ({ item, index }) => (
    <SongItem
      item={item}
      key={index}
      image={item?.imageUrl || ''}
      onPress={() => handlePlayTrack(item, index)}
      onOptionsPress={() => handleSongOptionsPress(item)}
    />
  );

  const bgColor = colorScheme === 'dark' ? '#0E0C1F' : '#fff';

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
        paddingBottom: isMiniPlayerVisible ? MINI_PLAYER_HEIGHT : 0
      }}
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
        {/* <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}> */}
        <View className="flex-row justify-between items-center h-14 px-5">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Icon name="arrow-back-outline" size={28} color={iconColor} />
          </TouchableOpacity>
          <Animated.Text
            style={{ opacity: headerTitleOpacity }}
            className={`flex-1 text-center font-bold text-lg ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}
            numberOfLines={1}
          >
            {currentAlbum?.name}
          </Animated.Text>
          <View className="w-8" />
        </View>
        {/* </SafeAreaView> */}
      </View>
      {isFavoriteLoading && (
        <View className="absolute top-0 right-0 left-0 z-10 bg-black/50 justify-center items-center"
          style={{
            height: screenHeight
          }}
        >
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      )}
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
            source={{ uri: currentAlbum?.imageUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg' }}
            className="w-64 h-64 rounded-lg"
          />
        </View>
        <View className="px-4 mt-2 gap-2">
          <Text className={`text-2xl font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
            {currentAlbum?.name}
          </Text>
          <View className="flex-row items-end justify-start gap-2">
            <Image
              source={{ uri: currentAlbum?.artists[0]?.imageUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg' }}
              className="w-5 h-5 rounded-full mt-2"
            />
            <Text className={`text-gray-300 text-sm mt-1 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentAlbum?.artists.length > 1 ? 'Nhiều nghệ sĩ' : currentAlbum?.artists[0]?.name || 'Không xác định'}
            </Text>
          </View>
          <View className="flex-row items-center justify-start gap-2">
            <Text className={`text-gray-300 text-sm mt-1 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentAlbum?.totalTracks} bài hát
            </Text>
          </View>
          <View className="flex-row justify-between items-center w-full">
            <View className="flex-row items-center justify-start gap-4">
              <Pressable onPress={() => handleShareAlbum()}>
                <Ionicons
                  name="share-social"
                  color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                  size={22} />
              </Pressable>
              <TouchableOpacity className="p-2"
                onPress={() => {
                  if (isFavorite) {
                    handleUnFavorite(currentAlbum);
                  } else {
                    handleAddFavorite(currentAlbum);
                  }
                }}
              >
                <MaterialCommunityIcons
                  name={isFavorite ? "bookmark" : "bookmark-plus-outline"}
                  color={isFavorite ? '#22c55e' : (colorScheme === 'dark' ? '#FFFFFF' : '#000000')}
                  size={23}
                />
              </TouchableOpacity>
              <Pressable onPress={() => setModalVisible(true)}>
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
              <Pressable onPress={() => handlePlayAlbum()}>
                <Ionicons
                  name="play-circle"
                  color="#22c55e"
                  size={48} />
              </Pressable>
            </View>
          </View>
        </View>
        <View className="px-4">
          <Text className={`${colorScheme === 'dark' ? 'text-white' : 'text-black'} text-xl font-bold mb-4`}>
            Danh sách bài hát
          </Text>
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải album...</Text>
            </View>
          ) : (
            listTrack?.map((item, index) => {
              return (
                renderRecentlyPlayedItem({ item, index })
              )
            })
          )}
        </View>
      </Animated.ScrollView>

      {modalVisible && (
        <AlbumOptionModal
          isVisible={modalVisible}
          setIsVisible={setModalVisible}
          album={album}
          onShare={handleShareAlbum}
          onAddToQueue={handleAddToQueue}
          onDownload={handleDownloadAlbum}
          onAddToPlaylist={handleAddToPlaylist}
        />
      )}

      {modalAddToPlaylistVisible && (
        <AddToAnotherPlaylistModal
          isVisible={modalAddToPlaylistVisible}
          setIsVisible={setModalAddToPlaylistVisible}
          data={album} // Truyền 'album' để hiển thị thông tin nếu cần (modal này có thể không dùng)
          onAddToPlaylist={handleConfirmAddToPlaylist}
          onCreateNewPlaylist={() => {
            setModalAddToPlaylistVisible(false);
            setModalAddPlaylistVisible(true);
          }}
        />
      )}

      {modalAddPlaylistVisible && (
        <AddPlaylistModal
          isModalVisible={modalAddPlaylistVisible}
          setIsModalVisible={setModalAddPlaylistVisible}
          name={newName}
          setName={setNewName}
          description={newDescription}
          setDescription={setNewDescription}
          image={newImage}
          setImage={setNewImage}
          isPublic={newIsPublic}
          setIsPublic={setNewIsPublic}
          onPickImage={() => handlePickerImage(newImage, setNewImage)}
          onCreatePlaylist={handleAddPlaylist}
        />
      )}

      {modalTrackVisible && selectedTrack && (
        <SongItemOptionModal
          isVisible={modalTrackVisible}
          setIsVisible={setModalTrackVisible}
          track={selectedTrack}
          isMine={false}
          onAddToQueue={() => handleSongAddToQueue(selectedTrack)}
          onAddToPlaylist={handleSongAddToPlaylist}
          onViewArtist={() => handleSongViewArtist(selectedTrack)}
          onShare={() => handleSongShare(selectedTrack)}
        />
      )}

      {modalArtistVisible && selectedTrack && (
        <ArtistSelectionModal
          isVisible={modalArtistVisible}
          setIsVisible={setModalArtistVisible}
          artists={selectedTrack.artists}
          onSelectArtist={handleSelectArtist}
        />
      )}
    </Animated.View>
  );
}

export default AlbumScreen