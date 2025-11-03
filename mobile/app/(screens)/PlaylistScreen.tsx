import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Pressable,
  // ScrollView, // Không dùng ScrollView thường nữa
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  StyleSheet, // Thêm StyleSheet
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigate } from "@/hooks/useNavigate";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import SongItem from "@/components/items/SongItem";
import { usePlayerStore } from "@/store/playerStore";
import { CreatePlaylist, DeletePlaylist, GetTracksByPlaylistId, UpdatePlaylist } from "@/services/musicService";
import { is, pl } from "date-fns/locale";
import useAuthStore from "@/store/authStore";
import PlaylistOptionModal from "@/components/modals/PlaylistOptionModal";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import EditPlaylistModal from "@/components/modals/EditPlaylistModal";
import * as ImagePicker from 'expo-image-picker';
import AddToAnotherPlaylistModal from "@/components/modals/AddToAnotherPlaylistModal";
import MINI_PLAYER_HEIGHT from "@/components/player/MiniPlayer";

// Hằng số để xác định khi nào bắt đầu mờ/hiện header
// 256px là chiều cao của ảnh (h-64). Bạn có thể điều chỉnh
const HEADER_SCROLL_THRESHOLD = 256;

export default function PlaylistScreen() {
  const currentPlaylist = usePlayerStore((state) => state.currentPlaylist);
  const playlistTracks = usePlayerStore((state) => state.playlistTracks);
  const isMiniPlayerVisible = usePlayerStore((state) => state.isMiniPlayerVisible);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const addTrackToPlaylist = usePlayerStore((state) => state.addTrackToPlaylist);
  const setPlaylistTracks = usePlayerStore((state) => state.setPlaylistTracks);
  const updateCurrentPlaylist = usePlayerStore((state) => state.updateCurrentPlaylist);
  const updateMyPlaylists = usePlayerStore((state) => state.updateMyPlaylists);
  const removeFromMyPlaylists = usePlayerStore((state) => state.removeFromMyPlaylists);
  const clearCurrent = usePlayerStore((state) => state.clearCurrent);
  const user = useAuthStore((state) => state.user);
  const { navigate } = useNavigate();
  const { info, error, success, confirm, warning } = useCustomAlert();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [playlist, setPlaylist] = useState(null);
  // const [tracks, setTracks] = useState([]);
  const params = useLocalSearchParams();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const iconColor = colorScheme === 'light' ? '#000' : '#fff';
  const [isLoading, setIsLoading] = useState(true);
  const [isMine, setIsMine] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [modalAddToAnotherPlaylistVisible, setModalAddToAnotherPlaylistVisible] = useState(false);
  const [modalAddToQueueVisible, setModalAddToQueueVisible] = useState(false);
  const [name, setName] = useState(currentPlaylist?.name || "");
  const [description, setDescription] = useState(currentPlaylist?.description || '');
  const [image, setImage] = useState(currentPlaylist?.imageUrl);
  const [isPublic, setIsPublic] = useState(currentPlaylist?.isPublic || true);
  const imageDefault = 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg';


  const scrollY = useRef(new Animated.Value(0)).current;

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

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      warning('Ứng dụng cần quyền truy cập thư viện ảnh!');
      return false;
    }
    return true;
  };

  const handlePickerImage = async () => {
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

  const handleSharePlaylist = () => {
    console.log('handleSharePlaylist');
    info('Chức năng chia sẻ playlist sẽ được cập nhật sau!');
  }

  const handleMoreOptions = () => {
    console.log('handleMoreOptions')
    console.log(playlist)
    setModalVisible(true);
  };

  const handleShufflePlay = () => {
    console.log('handleShufflePlay')
    info('Chức năng phát ngẫu nhiên sẽ được cập nhật sau!');
  };

  const handlePlay = () => {
    console.log('handlePlay')
    info('Chức năng phát playlist sẽ được cập nhật sau!');
  };

  const handleDeletePlaylist = async () => {
    console.log('handleDeletePlaylist')
    try {
      if (isMine) {
        confirm(
          'Xác nhận xóa',
          'Bạn có chắc chắn muốn xóa playlist này?',
          async () => {
            const response = await DeletePlaylist(playlist.id);
            console.log('response úi', response);
            if (response.success) {
              removeFromMyPlaylists(playlist.id);
              success('Đã xóa playlist thành công!');
              router.back();
            } else {
              error('Không thể xóa playlist. Vui lòng thử lại sau.');
            }
          },
          () => { }
        );
      }
    } catch (error) {
      console.log('Lỗi khi xóa playlist:', error);
      error('Lỗi xóa playlist', 'Đã có lỗi xảy ra khi xóa playlist. Vui lòng thử lại sau.');
    }
  }

  const handleEditPlaylist = async () => {
    console.log('handleEditPlaylist')
    try {
      const payload = {
        id: playlist.id,
        image: image || null,
        name: name || null,
        description: description,
        isPublic: isPublic
      };
      const response = await UpdatePlaylist(payload);

      if (response.success) {
        setImage(null);
        success('Cập nhật playlist thành công!');
        updateCurrentPlaylist(response.playlist);
        updateMyPlaylists(response.playlist);
      }
    } catch (error) {
      error('Không thể cập nhật playlist. Vui lòng thử lại!', error.message);
    } finally {
      setImage(null);
      setName("");
      setDescription("");
      setIsPublic(false);
      setModalEditVisible(false);
    }
  };

  const handleDownloadPlaylist = () => {
    console.log('handleDownloadPlaylist')
    info('Chức năng tải playlist sẽ được cập nhật sau!');
  };

  const handleAddToAnotherPlaylist = () => {
    console.log('handleAddToAnotherPlaylist')
    info('Chức năng thêm vào playlist khác sẽ được cập nhật sau!');
  };

  const handleAddToQueue = () => {
    console.log('handleAddToQueue')
    info('Chức năng thêm bài hát vào hàng đợi sẽ được cập nhật sau!');
  };

  useEffect(() => {
    setPlaylist(currentPlaylist);
    if (!currentPlaylist?.spotifyId && currentPlaylist?.userId === user?.id) {
      setIsMine(true);
    }
  }, [currentPlaylist]);

  useEffect(() => {
    const fetchTracks = async () => {

      setIsLoading(true);
      if (currentPlaylist?.spotifyId) {
        const response = await GetTracksByPlaylistId({
          playlistId: currentPlaylist.spotifyId,
          type: 'api'
        });
        if (response.success) {
          setPlaylistTracks(response.data);
        } else {
          setPlaylistTracks([]);
        }
      } else {
        const response = await GetTracksByPlaylistId({
          playlistId: currentPlaylist.id,
          type: 'local'
        });
        if (response.success) {
          setPlaylistTracks(response.data);
        } else {
          setPlaylistTracks([]);
        }
      }
      setIsLoading(false);
    };

    fetchTracks();
    console.log('currentPlaylist: ', currentPlaylist);
  }, []);

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


  const handleSelectTrack = (track) => {
    setCurrentTrack(track);
    navigate('SongScreen');
  }

  const renderRecentlyPlayedItem = ({ item, index }) => (
    <SongItem
      item={item}
      key={index}
      image={item?.imageUrl || ''}
      onPress={() => handleSelectTrack(item)}
      onOptionsPress={() => { }}
    />
  );

  const bgColor = colorScheme === 'dark' ? '#0E0C1F' : '#fff';

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }] }}
      className={`flex-1 ${colorScheme === 'dark' ? 'bg-[#0E0C1F]' : 'bg-white'}
      ${isMiniPlayerVisible ? `mb-[${MINI_PLAYER_HEIGHT}px] pb-16` : 'mb-0'}
      `}>
      <View className={``}>
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: bgColor,
            opacity: headerBgOpacity,
            zIndex: -1,
          }}
        />
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
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
        </SafeAreaView>
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
              <Pressable onPress={() => handleSharePlaylist()}>
                <Ionicons
                  name="share-social"
                  color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                  size={22} />
              </Pressable>
              <Pressable onPress={() => handleMoreOptions()}>
                <Ionicons
                  name="ellipsis-vertical"
                  color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                  size={22} />
              </Pressable>
            </View>
            <View className="flex-row items-center justify-start gap-4">
              <Pressable onPress={() => handleShufflePlay()}>
                <Ionicons
                  name="shuffle"
                  color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                  size={24} />
              </Pressable>
              <Pressable onPress={() => handlePlay()}>
                <Ionicons
                  name="play-circle"
                  color="#22c55e"
                  size={48} />
              </Pressable>
            </View>
          </View>
        </View>
        <View className={`px-4`}>
          <Text className="text-black dark:text-white text-xl font-bold mb-4">
            Danh sách bài hát
          </Text>
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải playlist...</Text>
            </View>
          ) : (
            <>
              {playlistTracks?.length === 0 || playlistTracks === undefined || !playlistTracks.length ? (
                <View className="flex-1 justify-center items-center">
                  <Text className="text-gray-600 dark:text-gray-400">Không có bài hát nào trong playlist này.</Text>
                </View>
              ) : (
                playlistTracks?.map((item, index) => (
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
            onShare={handleSharePlaylist}
            onAddToPlaylist={() => {
              if (!playlistTracks || !playlistTracks.length) {
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
            onPickImage={handlePickerImage}
            onUpdatePlaylist={handleEditPlaylist}
          />}

        {modalAddToAnotherPlaylistVisible &&
          <AddToAnotherPlaylistModal
            isVisible={modalAddToAnotherPlaylistVisible}
            setIsVisible={setModalAddToAnotherPlaylistVisible}
            data={playlist}
            onAddToPlaylist={handleAddToAnotherPlaylist}
            onCreateNewPlaylist={() => { }}
          />}
      </Animated.ScrollView>
    </Animated.View>
  );
}