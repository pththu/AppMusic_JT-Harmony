import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Pressable,
  useColorScheme,
  Animated,
  ActivityIndicator,
  Share,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { playlistData } from "@/constants/data";
import { useNavigate } from "@/hooks/useNavigate";
import { router } from "expo-router";
import useAuthStore from "@/store/authStore";
import { AddTracksToPlaylists, DeletePlaylist, GetPlaylistsForYou, GetTracksByPlaylistId, SharePlaylist, UpdatePlaylist } from "@/services/musicService";
import { SafeAreaView } from "react-native-safe-area-context";
import AddPlaylistModal from "@/components/modals/AddPlaylistModal";
import { usePlayerStore } from "@/store/playerStore";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import * as ImagePicker from 'expo-image-picker';
import { CreatePlaylist } from "@/services/musicService";
import { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";
import EditPlaylistModal from "@/components/modals/EditPlaylistModal";
import PlaylistItemOptionModal from "@/components/modals/PlaylistItemOptionModal";
import AddToAnotherPlaylistModal from "@/components/modals/AddToAnotherPlaylistModal";
import { RemoveFavoriteItem } from "@/services/favoritesService";
import { useFavoritesStore } from "@/store/favoritesStore";

const screenHeight = Dimensions.get("window").height;

const PlaylistItem = ({ item, index, onPress, onPressOptions, primaryIconColor, colorScheme }) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      // Làm mờ
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
      // Trượt lên
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ translateY: translateYAnim }],
      }}
    >
      <Pressable
        className="flex-row w-full items-center justify-between mb-4"
        onPress={() => onPress(item)}
      >
        <Image
          source={{ uri: item?.imageUrl }}
          className="w-16 h-16 rounded-md shadow-md"
        />
        <View className="flex-1 mx-4">
          <Text className={`${colorScheme === 'dark' ? 'text-white' : 'text-black'} font-semiboldF`} numberOfLines={1}>
            {item?.name}
          </Text>
          <Text className="dark:text-gray-400 text-sm">
            {item?.totalTracks || 0} bài hát
          </Text>
        </View>
        <Pressable className="p-2" onPress={() => onPressOptions(item)}>
          <Icon name="ellipsis-vertical" size={20} color={primaryIconColor} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

const AlbumItem = ({ item, index, onPress, onPressOptions, primaryIconColor, colorScheme }) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      // Làm mờ
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
      // Trượt lên
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ translateY: translateYAnim }],
      }}
    >
      <Pressable
        className="flex-row w-full items-center justify-between mb-4"
        onPress={() => onPress(item)}
      >
        <Image
          source={{ uri: item?.imageUrl }}
          className="w-16 h-16 rounded-md shadow-md"
        />
        <View className="flex-1 mx-4">
          <Text className={`${colorScheme === 'dark' ? 'text-white' : 'text-black'} font-semiboldF`} numberOfLines={1}>
            {item?.name}
          </Text>
          <Text className="dark:text-gray-400 text-sm">
            {item?.totalTracks || 0} bài hát
          </Text>
        </View>
        <Pressable className="p-2" onPress={() => onPressOptions(item)}>
          <Icon name="ellipsis-vertical" size={20} color={primaryIconColor} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const SearchResultItem = ({ item, index, onPress, onPressOptions, primaryIconColor, colorScheme }) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, delay: index * 50, useNativeDriver: true }),
      Animated.timing(translateYAnim, { toValue: 0, duration: 400, delay: index * 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const getSubtitle = () => {
    if (item.resultType === 'favAlbum') {
      const artists = item.artists?.map(a => a.name).join(', ') || 'Nghệ sĩ không rõ';
      return `Album • ${artists}`;
    }
    // Cả myPlaylist và favPlaylist đều là playlist
    const ownerName = item.owner?.name || 'Của bạn';
    return `Playlist • ${ownerName}`;
  };

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ translateY: translateYAnim }],
      }}
    >
      <Pressable
        className="flex-row w-full items-center justify-between mb-4"
        onPress={() => onPress(item)}
      >
        <Image
          source={{ uri: item?.imageUrl }}
          className="w-16 h-16 rounded-md shadow-md"
        />
        <View className="flex-1 mx-4">
          <Text className={`${colorScheme === 'dark' ? 'text-white' : 'text-black'} font-semiboldF`} numberOfLines={1}>
            {item?.name}
          </Text>
          <Text className="dark:text-gray-400 text-sm" numberOfLines={1}>
            {getSubtitle()}
          </Text>
        </View>
        <Pressable className="p-2" onPress={() => onPressOptions(item)}>
          <Icon name="ellipsis-vertical" size={20} color={primaryIconColor} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

export default function AllPlaylistScreen() {
  const colorScheme = useColorScheme();
  const { success, error, warning, confirm, info} = useCustomAlert();
  const { navigate } = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isGuest = useAuthStore((state) => state.isGuest);
  const myPlaylists = usePlayerStore((state) => state.myPlaylists);
  const tabBarHeight = usePlayerStore((state) => state.tabBarHeight);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const favoriteItems = useFavoritesStore((state) => state.favoriteItems);
  const isMiniPlayerVisible = usePlayerStore((state) => state.isMiniPlayerVisible);
  const setCurrentPlaylist = usePlayerStore((state) => state.setCurrentPlaylist);
  const setCurrentAlbum = usePlayerStore((state) => state.setCurrentAlbum);
  const addToMyPlaylists = usePlayerStore((state) => state.addToMyPlaylists);
  const addTrackToQueue = usePlayerStore((state) => state.addTrackToQueue);
  const updateMyPlaylists = usePlayerStore((state) => state.updateMyPlaylists);
  const updateSharedCountPlaylist = usePlayerStore((state) => state.updateSharedCountPlaylist);
  const updateTotalTracksInMyPlaylists = usePlayerStore((state) => state.updateTotalTracksInMyPlaylists);
  const removeFromMyPlaylists = usePlayerStore((state) => state.removeFromMyPlaylists);
  const removeFavoriteItem = useFavoritesStore((state) => state.removeFavoriteItem);

  const [activeTab, setActiveTab] = useState("myPlaylists");
  const [favoritePlaylists, setFavoritePlaylists] = useState([]);
  const [favoriteAlbums, setFavoriteAlbums] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isAddToOtherPlaylistVisible, setIsAddToOtherPlaylistVisible] = useState(false);
  const [isAddPlaylistModalVisible, setIsAddPlaylistModalVisible] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchFilter, setSearchFilter] = useState("all");
  const isSearching = searchQuery.length > 0;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [isPublic, setIsPublic] = useState(true);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [newIsPublic, setNewIsPublic] = useState(true);

  const primaryIconColor = colorScheme === "dark" ? "white" : "black";
  const playerPadding = currentTrack ? MINI_PLAYER_HEIGHT : 0;

  const handleSelectPlaylist = (playlist) => {
    setCurrentPlaylist(playlist);
    navigate("PlaylistScreen", { playlist: JSON.stringify(playlist) })
  };

  const handleSelectAlbum = (album) => {
    setCurrentAlbum(album);
    navigate("AlbumScreen", { album: JSON.stringify(album) })
  }

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
    setIsLoading(true);
    try {
      const payload = {
        image: image || null,
        name: name,
        description: description,
        isPublic: isPublic
      };
      const response = await CreatePlaylist(payload);

      if (response.success) {
        setImage(null);
        success('Tạo playlist thành công!');
        addToMyPlaylists(response.playlist);
      }
    } catch (err) {
      error('Không thể tạo playlist. Vui lòng thử lại!', err.message);
    } finally {
      setIsLoading(false);
      setName("");
      setDescription("");
      setImage(null);
      setIsPublic(false);
      setIsAddModalVisible(false);
    }
  }

  const handleCreateAndAddTracksToPlaylist = async () => {
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
        playlistIds.push(response.playlist.id);

        const trackIds = [];
        playlistTracks.forEach(track => {
          trackIds.push(track.spotifyId);
        });

        // console.log(playlistIds)
        // console.log(trackIds)
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
    } catch (err) {
      error('Không thể tạo playlist. Vui lòng thử lại!', err.message);
    } finally {
      setNewName("");
      setNewDescription("");
      setNewImage(null);
      setNewIsPublic(false);
      setIsAddPlaylistModalVisible(false);
      setIsOptionModalVisible(false);
    }
  }

  const handleUpdatePlaylist = async () => {
    // console.log('handleUpdatePlaylist')
    try {
      const payload = {
        id: selectedPlaylist.id,
        image: image || null,
        name: name || null,
        description: description,
        isPublic: isPublic
      };
      const response = await UpdatePlaylist(payload);

      if (response.success) {
        setImage(null);
        success('Cập nhật playlist thành công!');
        updateMyPlaylists(response.playlist);
      }
    } catch (err) {
      error('Không thể cập nhật playlist. Vui lòng thử lại!', err.message);
    } finally {
      setImage(null);
      setName("");
      setDescription("");
      setIsPublic(false);
      setIsEditModalVisible(false);
    }
  }

  const handleAddToAnotherPlaylist = async (playlistIds) => {
    // console.log('handleAddToAnotherPlaylist')
    // // console.log(playlistIds);
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

  const handleOpenOptionsModal = (item) => {
    setSelectedPlaylist(item); // Lưu item được chọn
    setIsOptionModalVisible(true);
  };

  const handleCloseOptionsModal = () => {
    setIsOptionModalVisible(false);
  };

  const handleEdit = () => {
    if (!selectedPlaylist) return;
    setName(selectedPlaylist.name);
    setDescription(selectedPlaylist.description || "");
    setImage(selectedPlaylist.imageUrl || null);
    setIsPublic(selectedPlaylist.isPublic);

    setIsOptionModalVisible(false);
    setIsEditModalVisible(true);
  };

  const handleDelete = () => {
    if (!selectedPlaylist) return;
    // console.log('handleDeletePlaylist')
    try {
      confirm(
        'Xác nhận xóa',
        'Bạn có chắc chắn muốn xóa playlist này?',
        async () => {
          const response = await DeletePlaylist(selectedPlaylist.id);
          // console.log('response úi', response);
          if (response.success) {
            removeFromMyPlaylists(selectedPlaylist.id);
            success('Đã xóa playlist thành công!');
          } else {
            error('Không thể xóa playlist. Vui lòng thử lại sau.');
          }
        },
        () => { }
      );
    } catch (err) {
      console.log('Lỗi khi xóa playlist:', err);
      error('Lỗi xóa playlist', 'Đã có lỗi xảy ra khi xóa playlist. Vui lòng thử lại sau.');
    }
    setIsOptionModalVisible(false);
    setSelectedPlaylist(null);
  };

  const handleAddToQueue = () => {
    console.log('handleAddToQueue')
    if (!playlistTracks || playlistTracks.length === 0) {
      warning('Playlist không có bài hát để thêm vào hàng đợi!');
      return;
    }

    addTrackToQueue(playlistTracks);
    success(`Đã thêm ${playlistTracks.length} bài hát vào hàng đợi!`);
    setIsOptionModalVisible(false);
  };

  const handleRemoveFromSaved = async () => {
    if (!selectedPlaylist) return;
    try {
      if (!selectedPlaylist?.favoriteItem || selectedPlaylist?.favoriteItem === null) {
        error('Playlist không có trong mục yêu thích.');
        return;
      }

      const response = await RemoveFavoriteItem(selectedPlaylist.favoriteItem.id);
      if (response.success) {
        removeFavoriteItem(selectedPlaylist);
        setFavoritePlaylists((prev) => prev.filter((pl) => pl.favoriteItem.id !== selectedPlaylist.favoriteItem.id));
      }
    } catch (err) {
      console.log(err);
      error('Lỗi khi xóa playlist khỏi mục yêu thích.');
    } finally {
      setIsFavoriteLoading(false);
    }

    setIsOptionModalVisible(false);
    setSelectedPlaylist(null);
  };

  const handleShare = async () => {
    if (!selectedPlaylist) return;
    if (isGuest) {
      info("Hãy đăng nhập để sử dụng tính năng này.");
      return;
    }
    try {
      let shareMessage = `${user?.fullName}: `;

      if (selectedPlaylist?.name) {
        shareMessage += `${selectedPlaylist?.name}\n\n`;
      } else {
        shareMessage += `Bài đăng của ${user?.fullName}\n\n`;
      }

      // Thêm URL hình ảnh nếu có
      if (selectedPlaylist?.imageUrl) {
        shareMessage += `${selectedPlaylist?.imageUrl}\n\n`;
      }

      // Thêm liên kết đến bài viết
      const postLink = `app://post/${selectedPlaylist?.id}`; // Deep link giả định
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
          playlistId: selectedPlaylist?.id,
          playlistSpotifyId: selectedPlaylist?.spotifyId
        });
        if (response.success) {
          success('Đã chia sẻ');
          selectedPlaylist.id = response.data.playlistId;
          updateSharedCountPlaylist(selectedPlaylist?.id);
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
      }
    } catch (err) {
      console.log('Lỗi khi chia sẻ:', err);
      error('Lỗi khi chia sẻ playlist. Vui lòng thử lại sau.');
    }
    setIsOptionModalVisible(false);
    setSelectedPlaylist(null);
  };

  const handleSelectSearchResult = (item) => {
    if (item.resultType === 'favAlbum') {
      handleSelectAlbum(item);
    } else {
      // 'myPlaylist' or 'favPlaylist'
      handleSelectPlaylist(item);
    }
  };

  useEffect(() => {
    setFavoritePlaylists([]);
    setFavoriteAlbums([]);
    for (const favItem of favoriteItems) {
      if (favItem.itemType === 'playlist') {
        setFavoritePlaylists((prev) => [...prev, favItem.item]);
      }

      if (favItem.itemType === 'album') {
        setFavoriteAlbums((prev) => [...prev, favItem.item]);
      }
    }
  }, []);

  useEffect(() => {
    const fetchTracks = async () => {
      if (selectedPlaylist?.spotifyId) {
        const response = await GetTracksByPlaylistId({
          playlistId: selectedPlaylist?.spotifyId,
          type: 'api'
        });
        if (response.success) {
          setPlaylistTracks(response.data);
        } else {
          setPlaylistTracks([]);
        }
      } else {
        const response = await GetTracksByPlaylistId({
          playlistId: selectedPlaylist?.id,
          type: 'local'
        });
        if (response.success) {
          setPlaylistTracks(response.data);
        } else {
          setPlaylistTracks([]);
        }
      }
    }
    if (selectedPlaylist) {
      // console.log('getTracks');
      fetchTracks();
    }
  }, [selectedPlaylist]);

  useEffect(() => {
    if (searchQuery === "") {
      setSearchResults([]);
      return;
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();
    const results = [];

    myPlaylists.forEach(item => {
      const nameMatch = item.name?.toLowerCase().includes(normalizedQuery);
      const ownerMatch = user?.fullName?.toLowerCase().includes(normalizedQuery);

      if (nameMatch || ownerMatch) {
        results.push({ ...item, resultType: 'myPlaylist' });
      }
    });

    favoritePlaylists.forEach(item => {
      const nameMatch = item.name?.toLowerCase().includes(normalizedQuery);
      const ownerMatch = item.owner?.name?.toLowerCase().includes(normalizedQuery);

      if (nameMatch || ownerMatch) {
        // Chống trùng lặp nếu 1 playlist vừa là "myPlaylist" vừa là "favorite"
        if (!results.some(r => r.spotifyId === item.spotifyId && (r.resultType === 'myPlaylist'))) {
          results.push({ ...item, resultType: 'favPlaylist' });
        }
      }
    });

    favoriteAlbums.forEach(item => {
      const nameMatch = item.name?.toLowerCase().includes(normalizedQuery);
      const artistMatch = item.artists?.some(artist =>
        artist.name?.toLowerCase().includes(normalizedQuery)
      );

      if (nameMatch || artistMatch) {
        results.push({ ...item, resultType: 'favAlbum' });
      }
    });

    setSearchResults(results);
  }, [searchQuery, myPlaylists, favoritePlaylists, favoriteAlbums, user?.fullName]);

  const filteredSearchResults = useMemo(() => {
    if (searchFilter === 'all') {
      return searchResults;
    }
    if (searchFilter === 'playlist') {
      return searchResults.filter(
        item => item.resultType === 'myPlaylist' || item.resultType === 'favPlaylist'
      );
    }
    if (searchFilter === 'album') {
      return searchResults.filter(item => item.resultType === 'favAlbum');
    }
    return searchResults;
  }, [searchResults, searchFilter]);

  const currentData = activeTab === "myPlaylists" ? myPlaylists : (activeTab === "playlists" ? favoritePlaylists : favoriteAlbums);

  const TabButton = ({ title, tabName, onPress, isActive }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        className={`flex-1 items-center py-3`}
      >
        <Text
          className={`font-semibold ${isActive
            ? `${colorScheme === "dark" ? "text-white" : "text-black"}`
            : "text-gray-400"
            }`}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const SearchResultsView = () => (
    <>
      <View className="flex-row mb-4">
        <TabButton
          title="Tất cả"
          tabName="all"
          onPress={() => setSearchFilter('all')}
          isActive={searchFilter === 'all'}
        />
        <TabButton
          title="Playlist"
          tabName="playlist"
          onPress={() => setSearchFilter('playlist')}
          isActive={searchFilter === 'playlist'}
        />
        <TabButton
          title="Album"
          tabName="album"
          onPress={() => setSearchFilter('album')}
          isActive={searchFilter === 'album'}
        />
      </View>

      <Text className={`mb-4 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
        Tìm thấy {filteredSearchResults.length} kết quả
      </Text>

      {/* Danh sách kết quả tìm kiếm */}
      {filteredSearchResults.length > 0 ? (
        <FlatList
          data={filteredSearchResults}
          keyExtractor={(item, index) => `${item.resultType}-${item.id || item.spotifyId}-${index}`}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <SearchResultItem
              item={item}
              index={index}
              onPress={() => handleSelectSearchResult(item)}
              onPressOptions={() => handleOpenOptionsModal(item)}
              primaryIconColor={primaryIconColor}
              colorScheme={colorScheme}
            />
          )}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className={`${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Không tìm thấy kết quả cho "{searchQuery}"
          </Text>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView className={`flex-1 ${colorScheme === 'dark' ? 'bg-[#0E0C1F]' : 'bg-white'} px-4`}
      style={{ marginBottom: isMiniPlayerVisible ? MINI_PLAYER_HEIGHT : 0 }}
    >
      <View className="flex-row items-start mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Icon name="arrow-back" size={24} color={primaryIconColor} />
        </TouchableOpacity>
        {!isGuest && (
          <View>
            <Text className={`${colorScheme === 'dark' ? 'text-white' : 'text-black'} text-xl font-semibold mb-1`}>
              Mục yêu thích của tôi
            </Text>
            <Text className={`${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
              {user?.fullName}
            </Text>
          </View>
        )}
      </View>

      {/* Thanh Search (CẬP NHẬT) */}
      <View className="flex-row items-center mb-4">
        <View className={`flex-1 ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} rounded-md p-2 flex-row items-center`}>
          <Icon name="search" size={20} color="#888" />
          <TextInput
            placeholder="Tìm kiếm playlist, album, nghệ sĩ..."
            placeholderTextColor="#888"
            className={`ml-2 flex-1 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}
            value={searchQuery}
            onChangeText={setSearchQuery} // <-- Gắn state
            clearButtonMode="while-editing" // <-- Thêm nút clear
          />
        </View>
        <TouchableOpacity className="ml-4">
          <Icon name="swap-vertical" size={24} color="#888" />
        </TouchableOpacity>
      </View>

      {isSearching ? (
        <SearchResultsView />
      ) : (
        <>
          <View className="flex-row mb-4">
            <TabButton title="Của tôi" tabName="myPlaylists" onPress={() => setActiveTab('myPlaylists')} isActive={activeTab === 'myPlaylists'} />
            <TabButton title="Playlist" tabName="playlists" onPress={() => setActiveTab('playlists')} isActive={activeTab === 'playlists'} />
            <TabButton title="Album" tabName="albums" onPress={() => setActiveTab('albums')} isActive={activeTab === 'albums'} />
          </View>

          <Text className={`mb-4 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
            {currentData.length} {activeTab === 'myPlaylists' ? 'danh sách phát' : activeTab === 'playlists' ? 'danh sách phát đã lưu' : 'album'}
          </Text>

          {currentData ? (
            <FlatList
              data={currentData}
              keyExtractor={(item, index) => `${activeTab}-${item.id || item.spotifyId}-${index}`}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                activeTab === "albums" ? (
                  <AlbumItem
                    item={item}
                    index={index}
                    onPress={() => handleSelectAlbum(item)}
                    onPressOptions={() => handleOpenOptionsModal(item)}
                    primaryIconColor={primaryIconColor}
                    colorScheme={colorScheme}
                  />
                ) : (
                  <PlaylistItem
                    item={item}
                    index={index}
                    onPress={() => handleSelectPlaylist(item)}
                    onPressOptions={() => handleOpenOptionsModal(item)}
                    primaryIconColor={primaryIconColor}
                    colorScheme={colorScheme}
                  />
                )
              )}
            />
          ) : (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className={`${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>Đang tải...</Text>
            </View>
          )}
        </>
      )}

      {isFavoriteLoading && (
        <View className="absolute top-0 right-0 left-0 z-10 bg-black/50 justify-center items-center"
          style={{
            height: screenHeight
          }}
        >
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      )}

      {activeTab === "myPlaylists" && !isSearching && (
        <View className="absolute bottom-14 right-6 z-10 justify-end items-end p-6"
        >
          <TouchableOpacity
            className=" bg-green-500 p-4 rounded-full shadow-lg"
            onPress={() => setIsAddModalVisible(true)}
          >
            <Icon name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {isAddModalVisible &&
        <AddPlaylistModal
          isModalVisible={isAddModalVisible}
          setIsModalVisible={setIsAddModalVisible}
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          image={image}
          setImage={setImage}
          isPublic={isPublic}
          setIsPublic={setIsPublic}
          onPickImage={() => handlePickerImage(image, setImage)}
          onCreatePlaylist={handleAddPlaylist}
        />}

      {isEditModalVisible &&
        <EditPlaylistModal
          isModalVisible={isEditModalVisible}
          setIsModalVisible={setIsEditModalVisible}
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          image={image}
          setImage={setImage}
          isPublic={isPublic}
          setIsPublic={setIsPublic}
          onPickImage={() => () => handlePickerImage(image, setImage)}
          onUpdatePlaylist={handleUpdatePlaylist}
        />}

      {isAddToOtherPlaylistVisible &&
        <AddToAnotherPlaylistModal
          isVisible={isAddToOtherPlaylistVisible}
          setIsVisible={setIsAddToOtherPlaylistVisible}
          data={selectedPlaylist}
          onAddToPlaylist={handleAddToAnotherPlaylist}
          onCreateNewPlaylist={() => setIsAddPlaylistModalVisible(true)}
        />}

      {isAddPlaylistModalVisible &&
        <AddPlaylistModal
          isModalVisible={isAddPlaylistModalVisible}
          setIsModalVisible={setIsAddPlaylistModalVisible}
          name={newName}
          setName={setNewName}
          description={newDescription}
          setDescription={setNewDescription}
          image={newImage}
          setImage={setNewImage}
          isPublic={newIsPublic}
          setIsPublic={setNewIsPublic}
          onPickImage={() => handlePickerImage(newImage, setNewImage)}
          onCreatePlaylist={handleCreateAndAddTracksToPlaylist}
        />}

      {isOptionModalVisible && selectedPlaylist &&
        <PlaylistItemOptionModal
          isVisible={isOptionModalVisible}
          onClose={handleCloseOptionsModal}
          isMyPlaylist={selectedPlaylist.resultType === 'myPlaylist'}
          playlistName={selectedPlaylist?.name}
          imageUrl={selectedPlaylist?.imageUrl}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRemoveFromSaved={handleRemoveFromSaved}
          onShare={handleShare}
          onAddToQueue={handleAddToQueue}
          onAddToPlaylist={() => {
            if (!playlistTracks || !playlistTracks.length) {
              warning('Không có bài hát để thêm vào danh sách phát khác!');
              return;
            }
            setIsAddToOtherPlaylistVisible(true);
            setIsOptionModalVisible(false);
          }}
        />}
    </SafeAreaView>
  );
}