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
  Modal,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
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
import { RemoveFavoriteItem } from "@/services/favoritesService";
import { useHistoriesStore } from "@/store/historiesStore";
import { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";

export default function LikedSongsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { navigate } = useNavigate();
  const { info, error, success, confirm, warning } = useCustomAlert();

  const user = useAuthStore((state) => state.user);
  const listTrack = usePlayerStore((state) => state.listTrack);
  const isShuffled = usePlayerStore((state) => state.isShuffled);
  const favoriteItems = useFavoritesStore((state) => state.favoriteItems);
  const playbackPosition = usePlayerStore((state) => state.playbackPosition)
  const isMiniPlayerVisible = usePlayerStore((state) => state.isMiniPlayerVisible);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setListTrack = usePlayerStore((state) => state.setListTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const setIsShuffled = usePlayerStore((state) => state.setIsShuffled);
  const addTrackToQueue = usePlayerStore((state) => state.addTrackToQueue);
  const addListenHistory = useHistoriesStore((state) => state.addListenHistory);
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
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const primaryIconColor = colorScheme === 'dark' ? 'white' : 'black';

  const handleSongAddToPlaylist = () => {
    setSongModalVisible(false);
    setAddTrackToPlaylistModalVisible(true);
  };

  // Chuyển đổi chế độ chọn
  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      // Nếu đang ở chế độ chọn và muốn thoát
      setSelectedTracks(new Set());
      setSelectAll(false);
    }
    setIsSelectionMode(!isSelectionMode);
  };

  // Chọn/bỏ chọn một bài hát
  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(trackId)) {
        newSelection.delete(trackId);
      } else {
        newSelection.add(trackId);
      }
      setSelectAll(newSelection.size === filteredTracks.length);
      return newSelection;
    });
  };

  // Chọn tất cả/bỏ chọn tất cả
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedTracks(new Set());
    } else {
      const allTrackIds = new Set(filteredTracks.map(track => track.id?.toString() || track.spotifyId || ''));
      setSelectedTracks(allTrackIds);
    }
    setSelectAll(!selectAll);
  };

  // Xóa các bài hát đã chọn
  const deleteSelectedTracks = () => {
    if (selectedTracks.size === 0 || isDeleting) return;

    confirm(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa ${selectedTracks.size} bài hát đã chọn khỏi danh sách yêu thích?`,
      async () => {
        try {
          setIsDeleting(true);
          const { favoriteItems } = useFavoritesStore.getState();

          // Tìm các bản ghi favorite tương ứng với các track đã chọn
          const itemsToRemove = favoriteItems.filter(item => {
            const trackId = item.itemId?.toString() || item.itemSpotifyId || '';
            return selectedTracks.has(trackId) && item.itemType === 'track';
          });

          // Gọi API xóa trên backend cho từng bản ghi yêu thích
          for (const favItem of itemsToRemove) {
            try {
              await RemoveFavoriteItem(favItem.id);
            } catch (apiErr) {
              console.error('Lỗi khi xóa favorite trên server:', apiErr);
            }
          }

          // Cập nhật lại store local sau khi xóa
          const updatedFavorites = favoriteItems.filter(item => !itemsToRemove.includes(item));
          useFavoritesStore.setState({ favoriteItems: updatedFavorites });

          // Cập nhật state local cho danh sách bài hát yêu thích (kèm thời điểm thêm vào yêu thích)
          const updatedTracks = updatedFavorites
            .filter(item => item.itemType === 'track')
            .map(item => ({
              ...item.item,
              favoriteCreatedAt: item.createdAt,
            }));
          setFavoriteTracks(updatedTracks);

          // Đặt lại trạng thái chọn
          setSelectedTracks(new Set());
          setIsSelectionMode(false);
          setSelectAll(false);

          success(`Đã xóa ${itemsToRemove.length} bài hát khỏi danh sách yêu thích`);
        } catch (err) {
          console.error('Lỗi khi xóa bài hát:', err);
          error('Đã xảy ra lỗi khi xóa bài hát');
        } finally {
          setIsDeleting(false);
        }
      }
    );
  };

  const handleSelectArtist = (artist) => {
    navigate("ArtistScreen", { artist: JSON.stringify(artist) });
    setArtistModalVisible(false);
  };

  const handlePlayTrack = async (track) => {
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

  const handlePlayLikedSongs = async () => {
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
    setSongModalVisible(true); // Mở modal
  };

  const handleSongAddToQueue = (track) => {
    addTrackToQueue([track]);
    setSongModalVisible(false);
  };

  const handleSongShare = async (track) => {
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
        success('Chia sẻ thành công!');
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
      error('Lỗi khi chia sẻ bài hát: ' + err.message);
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
      error('Lỗi', 'Đã có lỗi xảy ra khi thêm bài hát: ' + err.message);
    } finally {
      setAddTrackToPlaylistModalVisible(false);
    }
  };

  const sortedTracks = useMemo(() => {
    const sortableList = [...favoriteTracks]; // Tạo bản sao
    sortableList.sort((a, b) => {
      // Ưu tiên thời điểm được thêm vào danh sách yêu thích (favoriteCreatedAt), fallback về createdAt của track
      const aDate = a?.favoriteCreatedAt || a?.createdAt;
      const bDate = b?.favoriteCreatedAt || b?.createdAt;

      switch (sortOrder) {
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || ''); // A-Z
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || ''); // Z-A
        case 'date_asc': {
          const aTime = aDate ? new Date(aDate).getTime() : 0;
          const bTime = bDate ? new Date(bDate).getTime() : 0;
          return aTime - bTime; // Cũ nhất
        }
        case 'date_desc':
        default: {
          const aTime = aDate ? new Date(aDate).getTime() : 0;
          const bTime = bDate ? new Date(bDate).getTime() : 0;
          return bTime - aTime; // Mới nhất
        }
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
        // Gắn thêm thời điểm được thêm vào yêu thích để phục vụ sắp xếp mới nhất/cũ nhất
        allFavoriteTracks.push({
          ...favItem.item,
          favoriteCreatedAt: favItem.createdAt,
        });
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
    <View className={`flex-1 px-4 pt-4 bg-white dark:bg-black`}
    // style={{ paddingBottom: isMiniPlayerVisible ? MINI_PLAYER_HEIGHT : 0 }}
    >
      {isDeleting && (
        <View className="absolute inset-0 z-20 bg-black/30 justify-center items-center">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className="mt-2 text-white font-semibold">Đang xóa bài hát yêu thích...</Text>
        </View>
      )}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          {isSelectionMode ? (
            <TouchableOpacity onPress={toggleSelectionMode} className="mr-4">
              <Text className="text-blue-500 text-base">Hủy</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Icon name="arrow-back" size={24} color={primaryIconColor} />
            </TouchableOpacity>
          )}
          <View>
            <Text className="text-black dark:text-white text-2xl font-semibold">
              {isSelectionMode ? `Đã chọn ${selectedTracks.size}` : 'Bài hát yêu thích'}
            </Text>
            {!isSelectionMode && (
              <Text className="text-gray-600 dark:text-gray-400">
                {favoriteTracks.length || 0} bài hát
              </Text>
            )}
          </View>
        </View>
        
        {isSelectionMode ? (
          <TouchableOpacity 
            onPress={deleteSelectedTracks}
            disabled={selectedTracks.size === 0}
          >
            <Text className={`text-base ${selectedTracks.size > 0 ? 'text-red-500' : 'text-gray-400'}`}>
              Xóa ({selectedTracks.size})
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={toggleSelectionMode}>
            <Text className="text-blue-500 text-base">Chọn</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Thanh chọn khi ở chế độ chọn */}
      {isSelectionMode && (
        <View className="flex-row items-center justify-between mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <TouchableOpacity onPress={toggleSelectAll} className="flex-row items-center">
            <Icon 
              name={selectAll ? 'checkbox-outline' : 'square-outline'} 
              size={24} 
              color={selectAll ? '#3b82f6' : (colorScheme === 'dark' ? '#fff' : '#000')} 
            />
            <Text className="ml-2 text-black dark:text-white">
              {selectAll ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </Text>
          </TouchableOpacity>
          <Text className="text-black dark:text-white">
            {selectedTracks.size} đã chọn
          </Text>
        </View>
      )}
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
        data={filteredTracks}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isMiniPlayerVisible ? MINI_PLAYER_HEIGHT : 0 }}
        keyExtractor={(item, index) => item?.id?.toString() || item?.spotifyId || index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => {
              if (isSelectionMode) {
                toggleTrackSelection(item.id?.toString() || item.spotifyId || '');
              } else {
                handlePlayTrack(item);
              }
            }}
            onLongPress={() => {
              if (!isSelectionMode) {
                setIsSelectionMode(true);
                toggleTrackSelection(item.id?.toString() || item.spotifyId || '');
              }
            }}
            className={`flex-row items-center p-2 ${isSelectionMode ? 'pl-4' : ''}`}
          >
            {isSelectionMode && (
              <View className="mr-3">
                <Icon
                  name={selectedTracks.has(item.id?.toString() || item.spotifyId || '') ? 'checkbox-outline' : 'square-outline'}
                  size={24}
                  color={selectedTracks.has(item.id?.toString() || item.spotifyId || '') ? '#3b82f6' : (colorScheme === 'dark' ? '#fff' : '#000')}
                />
              </View>
            )}
            <View className="flex-1">
              {renderRecentlyPlayedItem({ item, index })}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-500 text-center">
              {searchQuery
                ? 'Không tìm thấy bài hát phù hợp'
                : 'Chưa có bài hát yêu thích nào'}
            </Text>
          </View>
        }
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
