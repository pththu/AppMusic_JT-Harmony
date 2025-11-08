import React, { use, useEffect, useRef, useState } from "react";
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
  StyleSheet,
  Share,
  Dimensions, // Thêm StyleSheet
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigate } from "@/hooks/useNavigate";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import SongItem from "@/components/items/SongItem";
import { usePlayerStore } from "@/store/playerStore";
import { AddTracksToPlaylists, CreatePlaylist, DeletePlaylist, GetTracksByPlaylistId, RemoveTrackFromPlaylist, SharePlaylist, ShareTrack, UpdatePlaylist, UpdatePlaylistPrivacy } from "@/services/musicService";
import useAuthStore from "@/store/authStore";
import PlaylistOptionModal from "@/components/modals/PlaylistOptionModal";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import EditPlaylistModal from "@/components/modals/EditPlaylistModal";
import * as ImagePicker from 'expo-image-picker';
import AddToAnotherPlaylistModal from "@/components/modals/AddToAnotherPlaylistModal";
import { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";
import AddPlaylistModal from "@/components/modals/AddPlaylistModal";
import SongItemOptionModal from "@/components/modals/SongItemOptionModal";
import ArtistSelectionModal from "@/components/modals/ArtistSelectionModal";
import AddTrackToPlaylistsModal from "@/components/modals/AddTrackToPlaylistsModal";
import { useFavoritesStore } from "@/store/favoritesStore";
import { AddFavoriteItem, RemoveFavoriteItem } from "@/services/favoritesService";

const HEADER_SCROLL_THRESHOLD = 256;
const screenHeight = Dimensions.get("window").height;

export default function PlaylistScreen() {

  const { navigate } = useNavigate();
  const { info, error, success, confirm, warning } = useCustomAlert();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const user = useAuthStore((state) => state.user);
  const currentPlaylist = usePlayerStore((state) => state.currentPlaylist);
  const playlistTracks = usePlayerStore((state) => state.playlistTracks);
  const isMiniPlayerVisible = usePlayerStore((state) => state.isMiniPlayerVisible);
  const favoriteItems = useFavoritesStore((state) => state.favoriteItems);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setPlaylistTracks = usePlayerStore((state) => state.setPlaylistTracks);
  const updateCurrentPlaylist = usePlayerStore((state) => state.updateCurrentPlaylist);
  const updateMyPlaylists = usePlayerStore((state) => state.updateMyPlaylists);
  const updateTotalTracksInMyPlaylists = usePlayerStore((state) => state.updateTotalTracksInMyPlaylists);
  const updateTotalTracksInCurrentPlaylist = usePlayerStore((state) => state.updateTotalTracksInCurrentPlaylist);
  const updateSharedCountPlaylist = usePlayerStore((state) => state.updateSharedCountPlaylist);
  const updateTrack = usePlayerStore((state) => state.updateTrack);
  const updatePrivacy = usePlayerStore((state) => state.updatePrivacy);
  const removeFromMyPlaylists = usePlayerStore((state) => state.removeFromMyPlaylists);
  const removeTrackFromPlaylistStore = usePlayerStore((state) => state.removeTrackFromPlaylist);
  const addToMyPlaylists = usePlayerStore((state) => state.addToMyPlaylists);
  const playPlaylist = usePlayerStore((state) => state.playPlaylist);
  const addTrackToQueue = usePlayerStore((state) => state.addTrackToQueue);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const shuffleQueue = usePlayerStore((state) => state.shuffleQueue);
  const unShuffleQueue = usePlayerStore((state) => state.unShuffleQueue);
  const addFavoriteItem = useFavoritesStore((state) => state.addFavoriteItem);
  const removeFavoriteItem = useFavoritesStore((state) => state.removeFavoriteItem);


  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const iconColor = colorScheme === 'light' ? '#000' : '#fff';

  const [isFavorite, setIsFavorite] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isMine, setIsMine] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [modalAddToAnotherPlaylistVisible, setModalAddToAnotherPlaylistVisible] = useState(false);
  const [modalAddPlaylistVisible, setModalAddPlaylistVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [songModalVisible, setSongModalVisible] = useState(false);
  const [artistModalVisible, setArtistModalVisible] = useState(false);
  const [addTrackToPlaylistModalVisible, setAddTrackToPlaylistModalVisible] = useState(false);

  const [playlist, setPlaylist] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const [name, setName] = useState(currentPlaylist?.name || "");
  const [description, setDescription] = useState(currentPlaylist?.description || '');
  const [image, setImage] = useState(currentPlaylist?.imageUrl);
  const [isPublic, setIsPublic] = useState(currentPlaylist?.isPublic || true);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [newIsPublic, setNewIsPublic] = useState(true);

  const [trackIds, setTrackIds] = useState([]);
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
        playlistTracks.forEach(track => {
          trackIds.push(track.spotifyId);
        });

        console.log(playlistIds)
        console.log(trackIds)
        if (trackIds.length > 0) {
          const addResponse = await AddTracksToPlaylists({
            playlistIds: playlistIds,
            trackSpotifyIds: trackIds
          });
          if (addResponse.success) {
            updateTotalTracksInMyPlaylists(response.playlist.id, trackIds.length);
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

  const handleSharePlaylist = async () => {
    try {
      let shareMessage = `${user?.fullName}: `;

      if (currentPlaylist?.name) {
        shareMessage += `${currentPlaylist?.name}\n\n`;
      } else {
        shareMessage += `Bài đăng của ${user?.fullName}\n\n`;
      }

      // Thêm URL hình ảnh nếu có
      if (currentPlaylist?.imageUrl) {
        shareMessage += `${currentPlaylist?.imageUrl}\n\n`;
      }

      // Thêm liên kết đến bài viết
      const postLink = `app://post/${currentPlaylist?.id}`; // Deep link giả định
      shareMessage += `Xem bài viết: ${postLink}`;

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
        const response = await SharePlaylist({
          playlistId: currentPlaylist?.id,
          playlistSpotifyId: currentPlaylist?.spotifyId
        });
        if (response.success) {
          success('Đã chia sẻ');
          currentPlaylist.id = response.data.playlistId;
          updateCurrentPlaylist(currentPlaylist);
          updateSharedCountPlaylist(currentPlaylist?.id);
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
      }
    } catch (err) {
      console.error('Lỗi khi chia sẻ:', err);
      error('Lỗi khi chia sẻ playlist. Vui lòng thử lại sau.');
    }
  }

  const handleMoreOptions = () => {
    console.log('handleMoreOptions')
    console.log(playlist)
    setModalVisible(true);
  };

  const handleShufflePlay = () => {
    console.log('handleShufflePlay: ', isShuffle)

    if (isShuffle) {
      unShuffleQueue();
    } else {
      shuffleQueue();
    }
    setIsShuffle(!isShuffle);
  };

  const handlePlayPlaylist = () => {
    console.log('handlePlay')
    if (!playlistTracks || playlistTracks.length === 0) {
      warning('Playlist không có bài hát để phát!');
      return;
    }

    playPlaylist(playlistTracks, 0);
    const queueData = playlistTracks.filter((item, index) => {
      if (index > 0)
        return item;
    });
    setQueue(queueData);
    setCurrentTrack(playlistTracks[0])
  };

  const handlePlayTrack = (track, index) => {
    playPlaylist(playlistTracks, index);
    const queueData = playlistTracks.filter((item, i) => {
      if (i > index)
        return item;
    });
    setCurrentTrack(track);
    setQueue(queueData);
  };

  const handleDeletePlaylist = async () => {
    console.log('handleDeletePlaylist')
    try {
      console.log('is mine', isMine)
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

  const handleChangePrivacy = async () => {
    try {
      const response = await UpdatePlaylistPrivacy({ playlistId: currentPlaylist?.id });
      if (response.success) {
        updatePrivacy(currentPlaylist?.id);
        success('Đã cập nhật trạng thái playlist')
      }
    } catch (err) {
      console.log(err);
      error('Lỗi', 'Đã có lỗi xảy ra khi thay đổi trạng thái playlist. Vui lòng thử lại sau.');
    }
  }

  const handleAddToAnotherPlaylist = async (playlistIds) => {
    console.log('handleAddToAnotherPlaylist')
    console.log(playlistIds);
    if (!playlistTracks || !playlistTracks.length) {
      warning('Playlist không có bài hát để thêm vào danh sách phát khác!');
      return;
    }

    if (!playlistIds || !playlistIds.length) {
      warning('Vui lòng chọn ít nhất một playlist để thêm bài hát!');
      return;
    }

    try {
      const trackIds = [];
      playlistTracks.forEach(track => {
        trackIds.push(track.spotifyId);
      });

      const response = await AddTracksToPlaylists({
        playlistIds: playlistIds,
        trackSpotifyIds: trackIds
      })

      if (response.success) {
        playlistIds.forEach(id => {
          updateTotalTracksInMyPlaylists(id, playlistTracks.length);
        });
        success('Đã thêm bài hát vào playlist thành công!');
      }

    } catch (err) {
      console.log(err);
      error('Lỗi', 'Đã có lỗi xảy ra khi thêm bài hát vào playlist. Vui lòng thử lại sau.');
    }
  };

  const handleAddToQueue = () => {
    console.log('handleAddToQueue')
    if (!playlistTracks || playlistTracks.length === 0) {
      warning('Playlist không có bài hát để thêm vào hàng đợi!');
      return;
    }

    // Thêm toàn bộ bài hát trong playlist này vào Queue
    addTrackToQueue(playlistTracks);
    success(`Đã thêm ${playlistTracks.length} bài hát vào hàng đợi!`);
    setModalVisible(false);
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

  const handleSongAddToPlaylist = () => {
    setSongModalVisible(false);
    setAddTrackToPlaylistModalVisible(true);
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
          playlistId: playlist.id,
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

  const handleSelectArtist = (artist) => {
    navigate("ArtistScreen", { artist: JSON.stringify(artist) });
    setArtistModalVisible(false);
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

  const handleAddFavorite = async (playlist) => {
    try {
      setIsFavoriteLoading(true);
      console.log('fav')
      const response = await AddFavoriteItem({
        itemType: 'playlist',
        itemId: currentPlaylist.id,
        itemSpotifyId: currentPlaylist.spotifyId
      });
      if (response.success) {
        console.log('response.data', response.data)
        setIsFavorite(true);
        setIsFavoriteLoading(false);
        addFavoriteItem(response.data);
      }
    } catch (err) {
      console.log(err)
      error('Lỗi khi thêm playlist vào mục yêu thích.');
    }
  }

  const handleUnFavorite = async (playlist) => {
    try {
      console.log('un')
      setIsFavoriteLoading(true);
      const favoriteItem = favoriteItems.find(
        (item) => item.itemType === 'playlist' && (item.itemId === playlist.id || item.itemSpotifyId === playlist.spotifyId)
      );

      if (!favoriteItem) {
        error('Playlist không có trong mục yêu thích.');
        return;
      }

      const response = await RemoveFavoriteItem(favoriteItem.id);
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

  useEffect(() => {
    setPlaylist(currentPlaylist);
    if (currentPlaylist?.owner?.id === user?.id || currentPlaylist?.userId === user?.id) {
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

  useEffect(() => {
    const isFavorite = favoriteItems.some(
      (item) => item?.itemType === 'playlist' && (item?.itemId === currentPlaylist?.id || item?.itemSpotifyId === currentPlaylist?.spotifyId)
    );
  }, [currentPlaylist]);

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
              {currentPlaylist?.owner?.id !== user?.id && (
                <TouchableOpacity className="p-2"
                  onPress={() => {
                    if (isFavorite) {
                      handleUnFavorite(currentPlaylist);
                    } else {
                      handleAddFavorite(currentPlaylist);
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
              {playlistTracks?.length === 0 || playlistTracks === undefined || !playlistTracks.length ? (
                <View className="flex-1 justify-center items-center">
                  <Text className="text-gray-600 dark:text-gray-400">Không có bài hát nào trong playlist này.</Text>
                </View>
              ) : (
                playlistTracks?.sort((a, b) => a?.playlistTrack?.id - b?.playlistTrack?.id)?.map((item, index) => (
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
            onAddToQueue={() => handleSongAddToQueue(selectedTrack)}
            onAddToPlaylist={handleSongAddToPlaylist}
            onRemoveFromPlaylist={() => handleRemoveTrackFromPlaylist(selectedTrack)}
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

        {addTrackToPlaylistModalVisible && selectedTrack && (
          <AddTrackToPlaylistsModal
            isVisible={addTrackToPlaylistModalVisible}
            setIsVisible={setAddTrackToPlaylistModalVisible}
            trackToAdd={selectedTrack}
            currentPlaylistIdToExclude={playlist?.id}
            onAddToPlaylist={handleConfirmAddTrackToPlaylists}
            onCreateNewPlaylist={() => {
              setAddTrackToPlaylistModalVisible(false);
              info("Chức năng đang phát triển");
            }}
          />
        )}
      </Animated.ScrollView>
    </Animated.View>
  );
}