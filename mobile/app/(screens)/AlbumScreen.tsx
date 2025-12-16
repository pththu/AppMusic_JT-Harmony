import SongItem from '@/components/items/SongItem';
import AddPlaylistModal from '@/components/modals/AddPlaylistModal';
import AddToAnotherPlaylistModal from '@/components/modals/AddToAnotherPlaylistModal';
import AddTrackToPlaylistsModal from '@/components/modals/AddTrackToPlaylistsModal';
import AlbumOptionModal from '@/components/modals/AlbumOptionModal';
import ArtistSelectionModal from '@/components/modals/ArtistSelectionModal';
import SongItemOptionModal from '@/components/modals/SongItemOptionModal';
import { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";
import { useAlbumData } from '@/hooks/useAlbumData';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { useMusicAction } from '@/hooks/useMusicAction';
import { useNavigate } from '@/hooks/useNavigate';
import { AddTracksToPlaylists, CreatePlaylist } from '@/services/musicService'; // Bỏ GetTracksByAlbumId
import useAuthStore from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react'; // Bỏ useCallback dư thừa
import { ActivityIndicator, Animated, Dimensions, Image, Pressable, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";

const HEADER_SCROLL_THRESHOLD = 256;
const screenHeight = Dimensions.get("window").height;

const AlbumScreen = () => {
  const { navigate } = useNavigate();
  const { info, error, success, confirm, warning } = useCustomAlert();
  const colorScheme = useColorScheme();
  // const setListTrack = usePlayerStore((state) => state.setListTrack); // Không cần nữa vì hook xử lý rồi

  const listTrack = usePlayerStore((state) => state.listTrack);
  const isGuest = useAuthStore((state) => state.isGuest);
  const currentAlbum = usePlayerStore((state) => state.currentAlbum);
  const isMiniPlayerVisible = usePlayerStore((state) => state.isMiniPlayerVisible);
  const addToMyPlaylists = usePlayerStore((state) => state.addToMyPlaylists);
  const updateTotalTracksInMyPlaylists = usePlayerStore((state) => state.updateTotalTracksInMyPlaylists);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalAddToPlaylistVisible, setModalAddToPlaylistVisible] = useState(false);
  const [modalAddPlaylistVisible, setModalAddPlaylistVisible] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [newIsPublic, setNewIsPublic] = useState(true);

  const opacity = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const iconColor = colorScheme === 'light' ? '#000' : '#fff';

  const {
    selectedTrack,
    songModalVisible,
    artistModalVisible,
    addTrackToPlaylistModalVisible,
    handleSelectArtist,
    handleShareAlbum,
    handleShareTrack,
    handlePlayTrack,
    handlePlayAlbum,
    handleTrackOptionPress,
    handleAddFavorite,
    handleAddTrackToQueue,
    handleTrackAddToPlaylist,
    handleTrackViewArtist,
    handleTrackViewAlbum,
    handleAddToAnotherPlaylist,
    handleConfirmAddTrackToPlaylists,
    handleRemoveFavorite,
    handleAddToQueue,
    setSongModalVisible,
    setArtistModalVisible,
    setAddTrackToPlaylistModalVisible,
  } = useMusicAction();

  // --- SỬ DỤNG HOOK MỚI ---
  const {
    isFavorite,
    isLoading,
    isFavoriteLoading,
    setIsFavoriteLoading,
    setIsFavorite,
    // setIsLoading, // Không cần lấy ra set thủ công
    fetchTracks // Có thể lấy ra nếu muốn làm chức năng Refresh
  } = useAlbumData(currentAlbum);

  // --- CÁC HÀM XỬ LÝ SỰ KIỆN (Giữ nguyên) ---
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      warning('Ứng dụng cần quyền truy cập thư viện ảnh!');
      return false;
    }
    return true;
  };

  // ... (Giữ nguyên handlePickerImage, handleDownloadAlbum, handleAddToPlaylist, handleConfirmAddToPlaylist, handleAddPlaylist) ...
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

  const handleDownloadAlbum = () => {
    if (isGuest) {
      info("Hãy đăng nhập để sử dụng chức năng này.");
      return;
    }
    setModalVisible(false);
    info('Chức năng tải album sẽ được cập nhật sau!');
  };

  const handleAddToPlaylist = () => {
    if (isGuest) {
      info("Hãy đăng nhập để sử dụng chức năng này.");
      return;
    }
    setModalVisible(false);
    if (!listTrack || listTrack?.length === 0) {
      warning('Album không có bài hát để thêm vào playlist!');
      return;
    }
    setModalAddToPlaylistVisible(true);
  };

  const handleConfirmAddToPlaylist = async (playlistIds) => {
    if (isGuest) {
      info("Hãy đăng nhập để sử dụng chức năng này.");
      return;
    }
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
      error('Lỗi', 'Đã có lỗi xảy ra khi thêm bài hát vào playlist: ' + err.message);
    } finally {
      setModalAddToPlaylistVisible(false);
    }
  };

  const handleAddPlaylist = async () => {
    if (isGuest) {
      info("Hãy đăng nhập để sử dụng chức năng này.");
      return;
    }
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

  useEffect(() => {
    // ⚠️ Thêm điều kiện kiểm tra currentAlbum
    if (currentAlbum && listTrack.length === 0) {
      fetchTracks(currentAlbum);
    }
  }, [currentAlbum?.spotifyId]);

  // --- BỎ HÀM fetchTracks VÀ useEffect CŨ ---

  // Chỉ giữ lại effect Animation
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
      onOptionsPress={() => handleTrackOptionPress(item)}
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
      {/* ... Phần giao diện giữ nguyên ... */}
      <View>
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: bgColor,
            opacity: headerBgOpacity,
            zIndex: -1,
          }}
        />
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
      </View>

      {/* Loading Overlay khi xử lý Favorite */}
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

              {/* Nút Thích - Chỉ thay đổi trạng thái UI, không trigger fetch lại tracks */}
              <TouchableOpacity className="p-2"
                onPress={() => {
                  if (isFavorite) {
                    handleRemoveFavorite(currentAlbum, 'album', setIsFavoriteLoading, setIsFavorite);
                  } else {
                    handleAddFavorite(currentAlbum, 'album', setIsFavoriteLoading, setIsFavorite);
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

        {/* Render danh sách bài hát */}
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

      {/* ... Phần Modals giữ nguyên ... */}
      {modalVisible && (
        <AlbumOptionModal
          isVisible={modalVisible}
          setIsVisible={setModalVisible}
          album={currentAlbum}
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
          data={currentAlbum}
          onAddToPlaylist={handleAddToAnotherPlaylist}
          onCreateNewPlaylist={() => { setModalAddPlaylistVisible(true) }}
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
      {songModalVisible && selectedTrack && (
        <SongItemOptionModal
          isVisible={songModalVisible}
          setIsVisible={setSongModalVisible}
          track={selectedTrack}
          isMine={false}
          onAddToQueue={() => handleAddTrackToQueue(selectedTrack)}
          onAddToPlaylist={handleTrackAddToPlaylist}
          onViewArtist={() => handleTrackViewArtist(selectedTrack)}
          onShare={() => handleShareTrack(selectedTrack)}
          onViewAlbum={() => handleTrackViewAlbum(selectedTrack)}
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
      {addTrackToPlaylistModalVisible && selectedTrack && (
        <AddTrackToPlaylistsModal
          isVisible={addTrackToPlaylistModalVisible}
          setIsVisible={setAddTrackToPlaylistModalVisible}
          trackToAdd={selectedTrack}
          currentPlaylistIdToExclude={null}
          onAddToPlaylist={handleConfirmAddTrackToPlaylists}
          onCreateNewPlaylist={() => {
            setAddTrackToPlaylistModalVisible(false);
            setModalAddPlaylistVisible(true);
          }}
        />
      )}
    </Animated.View>
  );
}

export default AlbumScreen