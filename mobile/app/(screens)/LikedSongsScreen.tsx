import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from '@/components/ThemeContext';
import SongItem from "@/components/items/SongItem";
import { usePlayerStore } from "@/store/playerStore";
import SongItemOptionModal from "@/components/modals/SongItemOptionModal";
import { AddTracksToPlaylists, ShareTrack } from "@/services/musicService";
import { useNavigate } from "@/hooks/useNavigate";
import useAuthStore from "@/store/authStore";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useRouter } from "expo-router";
import AddTrackToPlaylistsModal from "@/components/modals/AddTrackToPlaylistsModal";
import ArtistSelectionModal from "@/components/modals/ArtistSelectionModal";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Modal } from "react-native";

export default function LikedSongsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { navigate } = useNavigate();
  const { info, error, success, confirm, warning } = useCustomAlert();

  const user = useAuthStore((state) => state.user);
  const listTrack = usePlayerStore((state) => state.listTrack);
  const isShuffled = usePlayerStore((state) => state.isShuffled);
  const favoriteItems = useFavoritesStore((state) => state.favoriteItems);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setListTrack = usePlayerStore((state) => state.setListTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const setIsShuffled = usePlayerStore((state) => state.setIsShuffled);
  const addTrackToQueue = usePlayerStore((state) => state.addTrackToQueue);
  const updateTrack = usePlayerStore((state) => state.updateTrack);
  const updateTotalTracksInMyPlaylists = usePlayerStore((state) => state.updateTotalTracksInMyPlaylists);
  const playPlaylist = usePlayerStore((state) => state.playPlaylist);
  const shuffleQueue = usePlayerStore((state) => state.shuffleQueue);
  const unShuffleQueue = usePlayerStore((state) => state.unShuffleQueue);

  const [searchQuery, setSearchQuery] = useState("");
  const isSearching = searchQuery.length > 0;

  const [sortOrder, setSortOrder] = useState('date_desc'); // 'date_desc' (mới nhất), 'date_asc' (cũ nhất), 'name_asc' (A-Z), 'name_desc' (Z-A)
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const [selectedTrack, setSelectedTrack] = useState(null);
  const [favoriteTracks, setFavoriteTracks] = useState([]);
  const [songModalVisible, setSongModalVisible] = useState(false);
  const [artistModalVisible, setArtistModalVisible] = useState(false);
  const [addTrackToPlaylistModalVisible, setAddTrackToPlaylistModalVisible] = useState(false);
  const primaryIconColor = colorScheme === 'dark' ? 'white' : 'black';

  const handleSongAddToPlaylist = () => {
    setSongModalVisible(false);
    setAddTrackToPlaylistModalVisible(true);
  };

  const handleSelectArtist = (artist) => {
    navigate("ArtistScreen", { artist: JSON.stringify(artist) });
    setArtistModalVisible(false);
  };

  const handlePlayTrack = (track,) => {
    const playIndex = filteredTracks.findIndex(t =>
      (t.spotifyId && t.spotifyId === track.spotifyId) ||
      (t.id && t.id === track.id)
    );

    if (playIndex === -1) return;
    playPlaylist(filteredTracks, playIndex);
    const queueData = filteredTracks.slice(playIndex + 1);

    setCurrentTrack(track);
    setQueue(queueData);
  };

  const handlePlayLikedSongs = () => {
    if (!filteredTracks || filteredTracks.length === 0) {
      warning('Không có bài hát nào để phát!');
      return;
    }
    // Phát từ đầu danh sách đã lọc/sắp xếp
    playPlaylist(filteredTracks, 0);
    const queueData = filteredTracks.slice(1);
    setCurrentTrack(filteredTracks[0]);
    setQueue(queueData);
  };

  const handleToggleShuffle = () => {
    if (isShuffled) {
      unShuffleQueue();
    } else {
      shuffleQueue();
    }
    setIsShuffled(!isShuffled);
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

  const sortedTracks = useMemo(() => {
    const sortableList = [...favoriteTracks]; // Tạo bản sao
    sortableList.sort((a, b) => {
      switch (sortOrder) {
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || ''); // A-Z
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || ''); // Z-A
        case 'date_asc':
          return +new Date(a?.favoriteItem?.createdAt || 0) - +new Date(b?.favoriteItem?.createdAt || 0); // Cũ nhất
        case 'date_desc':
        default:
          return +new Date(b?.favoriteItem?.createdAt || 0) - +new Date(a?.favoriteItem?.createdAt || 0); // Mới nhất
      }
    });
    return sortableList;
  }, [favoriteTracks, sortOrder]);

  const filteredTracks = useMemo(() => {
    if (!isSearching) {
      return sortedTracks; // Trả về danh sách đã sắp xếp
    }
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return sortedTracks.filter(track => { // Lọc từ danh sách đã sắp xếp
      const nameMatch = track.name?.toLowerCase().includes(normalizedQuery);
      const albumMatch = track.album?.name?.toLowerCase().includes(normalizedQuery);
      const artistMatch = track.artists?.some(artist =>
        artist.name?.toLowerCase().includes(normalizedQuery)
      );
      return nameMatch || albumMatch || artistMatch;
    });
  }, [sortedTracks, searchQuery, isSearching]);

  useEffect(() => {
    setFavoriteTracks([]);
    const allFavoriteTracks = [];
    for (const favItem of favoriteItems) {
      if (favItem.itemType === 'track') {
        allFavoriteTracks.push(favItem.item);
      }
    }
    setFavoriteTracks(allFavoriteTracks);
    // setListTrack(allFavoriteTracks);
  }, [favoriteItems]);

  useEffect(() => {
    setListTrack(sortedTracks);
  }, [sortedTracks, setListTrack]);

  const renderRecentlyPlayedItem = ({ item, index }) => (
    <SongItem
      item={item}
      key={index}
      image={item?.imageUrl || ''}
      onPress={() => handlePlayTrack(item)}
      onOptionsPress={() => handleSongOptionsPress(item)}
    />
  );

  const SortOptionButton = ({ title, active, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`py-3 px-2 rounded-md ${active ? 'bg-green-500/20' : ''}`}
    >
      <Text className={`text-base ${active ? 'text-green-500 font-semibold' : 'text-black dark:text-white'}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white dark:bg-[#0E0C1F] px-4 pt-4">
      <View className="flex-row items-start mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Icon name="arrow-back" size={24} color={primaryIconColor} />
        </TouchableOpacity>
        <View>
          <Text className="text-black dark:text-white text-2xl font-semibold mb-2">
            Bài hát yêu thích
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            {favoriteTracks.length || 0} bài hát
          </Text>
        </View>
      </View>
      <View className="flex-row items-center mb-4">
        <View className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-md p-2 flex-row items-center">
          <Icon name="search" size={20} color="#888" />
          <TextInput
            placeholder="Tìm theo tên bài hát, nghệ sĩ, album..."
            placeholderTextColor="#888"
            className="ml-2 flex-1 text-black dark:text-white"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity className="ml-4" onPress={() => setSortModalVisible(true)}>
          <Icon name="swap-vertical" size={24} color={primaryIconColor} />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-end items-center w-full px-1 py-2 gap-4">
        <Pressable onPress={handleToggleShuffle}>
          <Icon
            name="shuffle"
            color={isShuffled ? '#22c55e' : primaryIconColor}
            size={28} />
        </Pressable>
        <Pressable onPress={handlePlayLikedSongs}>
          <Icon
            name="play-circle"
            color="#22c55e"
            size={48} />
        </Pressable>
      </View>

      {isSearching && (
        <Text className="text-gray-600 dark:text-gray-400 mb-4">
          Tìm thấy {filteredTracks.length} kết quả
        </Text>
      )}

      <FlatList
        data={filteredTracks} // Dùng danh sách đã lọc
        keyExtractor={(item) => item?.favoriteItem.id?.toString()}
        renderItem={({ item, index }) => (
          renderRecentlyPlayedItem({ item, index })
        )}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={sortModalVisible}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/60"
          onPress={() => setSortModalVisible(false)} // Đóng khi nhấn bên ngoài
        >
          <View
            className="w-4/5 bg-white dark:bg-gray-800 rounded-lg p-4"
            onStartShouldSetResponder={() => true} // Ngăn click xuyên thấu
          >
            <Text className="text-lg font-bold text-black dark:text-white mb-4">Sắp xếp theo</Text>

            <SortOptionButton
              title="Mới nhất"
              active={sortOrder === 'date_desc'}
              onPress={() => {
                setSortOrder('date_desc');
                setSortModalVisible(false);
              }}
            />
            <SortOptionButton
              title="Cũ nhất"
              active={sortOrder === 'date_asc'}
              onPress={() => {
                setSortOrder('date_asc');
                setSortModalVisible(false);
              }}
            />
            <SortOptionButton
              title="Tên (A-Z)"
              active={sortOrder === 'name_asc'}
              onPress={() => {
                setSortOrder('name_asc');
                setSortModalVisible(false);
              }}
            />
            <SortOptionButton
              title="Tên (Z-A)"
              active={sortOrder === 'name_desc'}
              onPress={() => {
                setSortOrder('name_desc');
                setSortModalVisible(false);
              }}
            />
          </View>
        </Pressable>
      </Modal>

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
    </View>
  );
}
