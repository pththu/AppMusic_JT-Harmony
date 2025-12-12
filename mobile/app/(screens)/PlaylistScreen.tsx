import SongItem from "@/components/items/SongItem";
import AddPlaylistModal from "@/components/modals/AddPlaylistModal";
import AddToAnotherPlaylistModal from "@/components/modals/AddToAnotherPlaylistModal";
import AddTrackToPlaylistsModal from "@/components/modals/AddTrackToPlaylistsModal";
import ArtistSelectionModal from "@/components/modals/ArtistSelectionModal";
import EditPlaylistModal from "@/components/modals/EditPlaylistModal";
import PlaylistOptionModal from "@/components/modals/PlaylistOptionModal";
import SongItemOptionModal from "@/components/modals/SongItemOptionModal";
import { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useMusicAction } from "@/hooks/useMusicAction";
import { useNavigate } from "@/hooks/useNavigate";
import { usePlaylistData } from "@/hooks/usePlaylistData";
import { AddTracksToPlaylists, CreatePlaylist, DeletePlaylist, RemoveTrackFromPlaylist, UpdatePlaylist } from "@/services/musicService";
import useAuthStore from "@/store/authStore";
import { usePlayerStore } from "@/store/playerStore";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const HEADER_SCROLL_THRESHOLD = 256;
const screenHeight = Dimensions.get("window").height;

export default function PlaylistScreen() {

  const { navigate } = useNavigate();
  const { info, error, success, confirm, warning } = useCustomAlert();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const user = useAuthStore((state) => state.user);
  const isGuest = useAuthStore((state) => state.isGuest);
  const currentPlaylist = usePlayerStore((state) => state.currentPlaylist);
  // const listTrack = usePlayerStore((state) => state.listTrack);
  const isMiniPlayerVisible = usePlayerStore((state) => state.isMiniPlayerVisible);
  const setCurrentPlaylist = usePlayerStore((state) => state.setCurrentPlaylist);
  const setListTrack = usePlayerStore((state) => state.setListTrack);
  const updateCurrentPlaylist = usePlayerStore((state) => state.updateCurrentPlaylist);
  const updateMyPlaylists = usePlayerStore((state) => state.updateMyPlaylists);
  const updateTotalTracksInMyPlaylists = usePlayerStore((state) => state.updateTotalTracksInMyPlaylists);
  const updateTotalTracksInCurrentPlaylist = usePlayerStore((state) => state.updateTotalTracksInCurrentPlaylist);
  const removeFromMyPlaylists = usePlayerStore((state) => state.removeFromMyPlaylists);
  const removeTrackFromPlaylistStore = usePlayerStore((state) => state.removeTrackFromPlaylist);
  const addToMyPlaylists = usePlayerStore((state) => state.addToMyPlaylists);
  const shuffleQueue = usePlayerStore((state) => state.shuffleQueue);
  const unShuffleQueue = usePlayerStore((state) => state.unShuffleQueue);

  const scrollY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const iconColor = colorScheme === 'light' ? '#000' : '#fff';
  const bgColor = colorScheme === 'dark' ? '#0E0C1F' : '#fff';

  const [isShuffle, setIsShuffle] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [modalAddToAnotherPlaylistVisible, setModalAddToAnotherPlaylistVisible] = useState(false);
  const [modalAddPlaylistVisible, setModalAddPlaylistVisible] = useState(false);


  const [name, setName] = useState(currentPlaylist?.name || "");
  const [description, setDescription] = useState(currentPlaylist?.description || '');
  const [image, setImage] = useState(currentPlaylist?.imageUrl);
  const [isPublic, setIsPublic] = useState(currentPlaylist?.isPublic || true);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [newIsPublic, setNewIsPublic] = useState(true);
  const imageDefault = 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg';

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

  const {
    playlist,
    isLoading,
    listTrack,
    isMine,
    isFavorite,
    isFavoriteLoading,
    modalVisible,
    setModalVisible,
    setIsFavorite,
    setIsFavoriteLoading,
  } = usePlaylistData(currentPlaylist);

  const {
    songModalVisible,
    selectedTrack,
    artistModalVisible,
    addTrackToPlaylistModalVisible,
    handleSelectArtist,
    handlePlayPlaylist,
    handlePlayTrack,
    handleTrackOptionPress,
    handleSharePlaylist,
    handleShareTrack,
    handleAddFavorite,
    handleAddTrackToQueue,
    handleAddToQueue,
    handleRemoveFavorite,
    handleTrackViewAlbum,
    handleTrackViewArtist,
    handleConfirmAddTrackToPlaylists,
    handleAddToAnotherPlaylist,
    handleChangePrivacy,
    handleTrackAddToPlaylist,
    setSongModalVisible,
    setArtistModalVisible,
    setAddTrackToPlaylistModalVisible,
  } = useMusicAction();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      warning('Ứng dụng cần quyền truy cập thư viện ảnh!');
      return false;
    }
    return true;
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
        const playlistIds = [];
        playlistIds.push(response.playlist?.id);

        const trackIds = [];
        listTrack.forEach(track => {
          trackIds.push(track.spotifyId);
        });

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
    } catch (err) {
      error('Không thể tạo playlist. Vui lòng thử lại!', err.message);
    } finally {
      setNewName("");
      setNewDescription("");
      setNewImage(null);
      setNewIsPublic(false);
      setModalAddPlaylistVisible(false);
    }
  };

  const handleMoreOptions = () => {
    setModalVisible(true);
  };

  const handleShufflePlay = () => {
    if (isShuffle) {
      unShuffleQueue();
    } else {
      shuffleQueue();
    }
    setIsShuffle(!isShuffle);
  };

  const handleDeletePlaylist = async () => {
    if (isGuest) return;
    try {
      if (isMine) {
        confirm(
          'Xác nhận xóa',
          'Bạn có chắc chắn muốn xóa playlist này?',
          async () => {
            const response = await DeletePlaylist(playlist?.id);
            if (response.success) {
              removeFromMyPlaylists(playlist?.id);
              success('Đã xóa playlist thành công!');
              router.back();
            } else {
              error('Không thể xóa playlist. Vui lòng thử lại sau.');
            }
          },
          () => { }
        );
      }
    } catch (err) {
      error('Lỗi xóa playlist', 'Đã có lỗi xảy ra khi xóa playlist. Vui lòng thử lại sau: ' + err.message);
    }
  }

  const handleEditPlaylist = async () => {
    try {
      const payload = {
        id: playlist?.id,
        image: image || null,
        name: name || null,
        description: description,
        isPublic: isPublic
      };
      const response = await UpdatePlaylist(payload);

      if (response.success) {
        success('Cập nhật playlist thành công!');
        updateCurrentPlaylist(response.playlist);
        updateMyPlaylists(response.playlist);
      }
    } catch (error) {
      error('Không thể cập nhật playlist. Vui lòng thử lại!', error.message);
    } finally {
      setModalEditVisible(false);
    }
  };

  const handleDownloadPlaylist = () => {
    if (isGuest) {
      info('Hãy đăng nhập để sử dụng chức năng này!');
      return;
    }
    info('Chức năng tải playlist sẽ được cập nhật sau!');
  };

  const handleRemoveTrackFromPlaylist = (track) => {
    if (!isMine) {
      error("Bạn không thể xóa bài hát khỏi playlist này.");
      return;
    }
    confirm(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa "${track.name}" khỏi playlist này?`,
      async () => {
        const response = await RemoveTrackFromPlaylist({
          playlistId: playlist?.id,
          playlistTrackId: selectedTrack.playlistTrack?.id
        });

        if (response.success) {
          removeTrackFromPlaylistStore(selectedTrack.playlistTrack?.id);
          updateTotalTracksInCurrentPlaylist(-1);
          updateTotalTracksInMyPlaylists(currentPlaylist.id, -1);
        }
        success("Đã xóa bài hát khỏi playlist.");
        setSongModalVisible(false);
      },
      () => { }
    );
  };

  useEffect(() => {
    return () => {
      setCurrentPlaylist(null);
      setListTrack([]);
    }
  }, [])

  useEffect(() => {
    if (currentPlaylist) {
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
  }, [currentPlaylist]);


  const renderRecentlyPlayedItem = ({ item, index }) => (
    <SongItem
      item={item}
      key={index}
      image={item?.imageUrl || null}
      onPress={() => handlePlayTrack(item, index)}
      onOptionsPress={() => handleTrackOptionPress(item)}
    />
  );

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
        paddingBottom: isMiniPlayerVisible ? MINI_PLAYER_HEIGHT : 0
      }}
      className={`flex-1 ${colorScheme === 'dark' ? 'bg-[#0E0C1F]' : 'bg-white'} `}>
      <View className={``}>
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: bgColor,
            opacity: headerBgOpacity,
            zIndex: -1,
          }}
        />
        {isFavoriteLoading && (
          <View className="absolute top-0 right-0 left-0 z-10 bg-black/50 justify-center items-center"
            style={{
              height: screenHeight
            }}
          >
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        )}
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
            {currentPlaylist?.name}
          </Animated.Text>
          <View className="w-8" />
        </View>
        {/* </SafeAreaView> */}
      </View>
      <Animated.ScrollView
        className={`flex-1`}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View className="w-full h-64 items-center rounded-lg overflow-hidden">
          <Image
            source={{ uri: currentPlaylist?.imageUrl }}
            className="w-64 h-64 rounded-lg"
          />
        </View>
        <View className="px-4 mt-2 gap-2">
          <Text className={`text-2xl font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
            {currentPlaylist?.name}
          </Text>
          <View className="flex-row items-end justify-start gap-2">
            <Image
              source={{ uri: `${isMine === true ? user?.avatarUrl : (currentPlaylist?.owner?.imageUrl || imageDefault)}` }}
              className="w-5 h-5 rounded-full mt-2"
            />
            <Text className={`text-gray-300 text-sm mt-1 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {isMine ? user?.fullName : currentPlaylist?.owner?.name || 'không xác định'}
            </Text>
          </View>
          <View className="flex-row items-center justify-start gap-2">
            <MaterialIcons
              name={currentPlaylist?.isPublic ? "public" : "lock-outline"}
              size={12} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
            />
            <Text className={`text-gray-300 text-sm mt-1 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentPlaylist?.totalTracks || 0} bài hát
            </Text>
          </View>
          <View className="flex-row items-start justify-start gap-2">
            <Text className={`text-wrap text-sm ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentPlaylist?.description || '...'}
            </Text>
          </View>
          <View className="flex-row justify-between items-center w-full">
            <View className="flex-row items-center justify-start gap-4">
              {currentPlaylist?.isPublic && (
                <Pressable className="p-2" onPress={() => handleSharePlaylist()}>
                  <Ionicons
                    name="share-social"
                    color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                    size={22} />
                </Pressable>
              )}
              {(isGuest || (currentPlaylist?.owner?.id !== user?.id && currentPlaylist?.userId !== user.id)) && (
                <TouchableOpacity className="p-2"
                  onPress={() => {
                    if (isFavorite) {
                      handleRemoveFavorite(currentPlaylist, "playlist", setIsFavoriteLoading, setIsFavorite);
                    } else {
                      handleAddFavorite(currentPlaylist, "playlist", setIsFavoriteLoading, setIsFavorite);
                    }
                  }}
                >
                  <MaterialCommunityIcons
                    name={isFavorite ? "bookmark" : "bookmark-plus-outline"}
                    color={isFavorite ? '#22c55e' : (colorScheme === 'dark' ? '#FFFFFF' : '#000000')}
                    size={23}
                  />
                </TouchableOpacity>
              )}
              <Pressable className="p-2" onPress={() => handleMoreOptions()}>
                <Ionicons
                  name="ellipsis-vertical"
                  color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                  size={22} />
              </Pressable>
            </View>
            <View className="flex-row items-center justify-start gap-4">
              <Pressable onPress={() => handleShufflePlay()}>
                <Ionicons
                  name={isShuffle ? "shuffle" : "repeat"}
                  color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                  size={24} />
              </Pressable>
              <Pressable onPress={() => handlePlayPlaylist()}>
                <Ionicons
                  name="play-circle"
                  color="#22c55e"
                  size={48} />
              </Pressable>
            </View>
          </View>
        </View>
        <View className={`px-4`}>
          <Text className={`text-lg font-bold mt-4 mb-2 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
            Danh sách bài hát
          </Text>
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className={`mt-2 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Đang tải playlist...</Text>
            </View>
          ) : (
            <>
              {listTrack?.length === 0 || listTrack === undefined || !listTrack.length ? (
                <View className="flex-1 justify-center items-center">
                  <Text className="text-gray-600 dark:text-gray-400">Không có bài hát nào trong playlist này.</Text>
                </View>
              ) : (
                listTrack?.sort((a, b) => a?.playlistTrack?.id - b?.playlistTrack?.id)?.map((item, index) => (
                  renderRecentlyPlayedItem({ item, index })
                ))
              )}
            </>
          )}
        </View>
        {modalVisible &&
          <PlaylistOptionModal
            isVisible={modalVisible}
            setIsVisible={setModalVisible}
            data={currentPlaylist}
            onDelete={handleDeletePlaylist}
            onEdit={() => setModalEditVisible(true)}
            onDownload={handleDownloadPlaylist}
            onTogglePrivacy={handleChangePrivacy}
            onShare={handleSharePlaylist}
            onAddToPlaylist={() => {
              if (!listTrack || !listTrack.length) {
                warning('Playlist không có bài hát để thêm vào danh sách phát khác!');
                return;
              }
              setModalAddToAnotherPlaylistVisible(true);
            }}
            onAddTrack={() => {
              setModalVisible(false);
              navigate('AddTrackScreen');
            }}
            onAddToQueue={handleAddToQueue}
          />}

        {modalEditVisible &&
          <EditPlaylistModal
            isModalVisible={modalEditVisible}
            setIsModalVisible={setModalEditVisible}
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            image={image}
            setImage={setImage}
            isPublic={isPublic}
            setIsPublic={setIsPublic}
            onPickImage={() => handlePickerImage(image, setImage)}
            onUpdatePlaylist={handleEditPlaylist}
          />}

        {modalAddToAnotherPlaylistVisible &&
          <AddToAnotherPlaylistModal
            isVisible={modalAddToAnotherPlaylistVisible}
            setIsVisible={setModalAddToAnotherPlaylistVisible}
            data={playlist}
            onAddToPlaylist={handleAddToAnotherPlaylist}
            onCreateNewPlaylist={() => setModalAddPlaylistVisible(true)}
          />}

        {modalAddPlaylistVisible &&
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
          />}

        {songModalVisible && selectedTrack && (
          <SongItemOptionModal
            isVisible={songModalVisible}
            setIsVisible={setSongModalVisible}
            track={selectedTrack}
            isMine={isMine}
            onAddToQueue={() => handleAddTrackToQueue(selectedTrack)}
            onAddToPlaylist={handleTrackAddToPlaylist}
            onRemoveFromPlaylist={() => handleRemoveTrackFromPlaylist(selectedTrack)}
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

        {addTrackToPlaylistModalVisible && selectedTrack && (
          <AddTrackToPlaylistsModal
            isVisible={addTrackToPlaylistModalVisible}
            setIsVisible={setAddTrackToPlaylistModalVisible}
            trackToAdd={selectedTrack}
            currentPlaylistIdToExclude={playlist?.id}
            onAddToPlaylist={handleConfirmAddTrackToPlaylists}
            onCreateNewPlaylist={() => {
              setAddTrackToPlaylistModalVisible(false);
              setModalAddPlaylistVisible(true);
            }}
          />
        )}
      </Animated.ScrollView>
    </Animated.View>
  );
}