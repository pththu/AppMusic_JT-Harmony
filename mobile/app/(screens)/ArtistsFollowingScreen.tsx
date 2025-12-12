import { useTheme } from '@/components/ThemeContext';
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useNavigate } from "@/hooks/useNavigate";
import { UnfollowArtist } from "@/services/followService";
import { useFollowStore } from "@/store/followStore";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal, // Import Modal từ react-native
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

// --- ArtistItem Component ---
const ArtistItem = ({ item, artist, theme, onSelect, onUnfollow, onBlock }) => {
  return (
    <TouchableOpacity
      onPress={() => onSelect(artist)}
      className="flex-row items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <Image
          source={{ uri: artist?.imageUrl || "https://via.placeholder.com/150" }}
          className="w-16 h-16 rounded-full mr-4"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text className="text-black dark:text-white text-base font-medium" numberOfLines={1}>
            {artist.name}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center ml-2">
        {/* Nút Hủy theo dõi */}
        <TouchableOpacity
          onPress={() => onUnfollow(item)}
          className="px-3 py-1 mr-2 rounded-full border border-gray-400 dark:border-gray-600"
        >
          <Text className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
            Hủy theo dõi
          </Text>
        </TouchableOpacity>

        {/* Nút Chặn */}
        {/* <TouchableOpacity
          onPress={() => onBlock(artist)}
          className="px-3 py-1 rounded-full bg-red-500 dark:bg-red-700"
        >
          <Text className="text-white text-sm font-semibold">Chặn</Text>
        </TouchableOpacity> */}
      </View>
    </TouchableOpacity>
  );
};
// --- End ArtistItem Component ---

// --- SortOptionButton Component (Đồng bộ với LikedSongsScreen) ---
const SortOptionButton = ({ title, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`py-3 px-2 rounded-md ${active ? 'bg-blue-500/20' : ''}`} // Thay green bằng blue cho đồng bộ nếu bạn muốn
  >
    <Text className={`text-base ${active ? 'text-blue-500 font-semibold' : 'text-black dark:text-white'}`}>
      {title}
    </Text>
  </TouchableOpacity>
);
// --- End SortOptionButton Component ---

export default function ArtistsFollowingScreen() {
  const router = useRouter();
  const { navigate } = useNavigate();
  const { theme } = useTheme();
  const { error, info } = useCustomAlert();

  const artistFollowed = useFollowStore((state) => state.artistFollowed);
  const removeArtistFollowed = useFollowStore((state) => state.removeArtistFollowed);
  const setCurrentArtist = useFollowStore((state) => state.setCurrentArtist);

  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Cập nhật SortCriteria để phù hợp với LikedSongsScreen
  // 'date_desc' (mới nhất), 'date_asc' (cũ nhất), 'name_asc' (A-Z)
  const [sortCriteria, setSortCriteria] = useState('date_desc');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const primaryIconColor = theme === 'dark' ? 'white' : 'black';
  const secondaryIconColor = theme === 'dark' ? '#888' : 'gray';

  // --- Logic Lọc và Sắp xếp ---
  const filteredAndSortedArtists = useMemo(() => {
    let list = artistFollowed;

    // 1. Lọc (Filter)
    if (searchText) {
      const lowercasedSearch = searchText.toLowerCase();
      list = list.filter(item =>
        item.artist.name.toLowerCase().includes(lowercasedSearch)
      );
    }

    // 2. Sắp xếp (Sort)
    list.sort((a, b) => {
      switch (sortCriteria) {
        case 'name_asc': // Tên (A-Z)
          const nameA = a.artist.name.toLowerCase();
          const nameB = b.artist.name.toLowerCase();
          return nameA.localeCompare(nameB);
        case 'name_desc': // Tên (Z-A)
          const nameAZ = a.artist.name.toLowerCase();
          const nameBZ = b.artist.name.toLowerCase();
          return nameBZ.localeCompare(nameAZ);
        case 'date_asc': // Cũ nhất
          return +new Date(a.createdAt) - +new Date(b.createdAt);
        case 'date_desc': // Mới nhất (Mặc định)
        default:
          return +new Date(b.createdAt) - +new Date(a.createdAt);
      }
    });

    return list;
  }, [artistFollowed, searchText, sortCriteria]);
  // --- End Logic Lọc và Sắp xếp ---

  // --- Handlers ---
  const handleSelectArtist = (artist) => {
    setCurrentArtist(artist);
    navigate("ArtistScreen");
  }

  const handleUnfollow = async (item) => {
    try {
      setIsLoading(true);
      const followId = item.id;

      removeArtistFollowed(followId);
      await UnfollowArtist({
        followId: followId
      });
    } catch (err) {
      error('Lỗi khi hủy theo dõi nghệ sĩ. Vui lòng thử lại sau: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleBlockArtist = (artist) => {
    info('Chức năng chặn nghệ sĩ sẽ được cập nhật trong các phiên bản sau.');
  }
  // --- End Handlers ---

  // Không cần SortModal View vì đã dùng React Native Modal

  return (
    <View className="flex-1 bg-white dark:bg-[#0E0C1F]">
      {/* Header */}
      <View className="px-4 pt-4">
        <View className="flex-row items-start mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Icon name="arrow-back" size={24} color={primaryIconColor} />
          </TouchableOpacity>
          <View>
            <Text className="text-black dark:text-white text-2xl font-semibold mb-2">
              Nghệ sĩ đang theo dõi
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">
              {filteredAndSortedArtists.length} nghệ sĩ
            </Text>
          </View>
        </View>

        {/* Search & Sort Bar */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-md p-2 flex-row items-center">
            <Icon name="search" size={20} color={secondaryIconColor} />
            <TextInput
              placeholder="Tìm kiếm nghệ sĩ"
              placeholderTextColor={secondaryIconColor}
              className="ml-2 flex-1 text-black dark:text-white"
              onChangeText={setSearchText}
              value={searchText}
            />
          </View>
          <TouchableOpacity
            className="ml-4 p-1"
            onPress={() => setSortModalVisible(true)} // Mở Modal
          >
            <Icon name="swap-vertical" size={24} color={secondaryIconColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Danh sách nghệ sĩ */}
      <View className="flex-1 px-4">
        <FlatList
          data={filteredAndSortedArtists}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ArtistItem
              item={item}
              artist={item.artist}
              theme={theme}
              onSelect={handleSelectArtist}
              onUnfollow={handleUnfollow}
              onBlock={handleBlockArtist}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <Text className="text-gray-500 dark:text-gray-400 text-center mt-8">
              Không tìm thấy nghệ sĩ nào.
            </Text>
          )}
        />
      </View>

      {/* React Native Modal cho Sắp xếp */}
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

            {/* Mới nhất */}
            <SortOptionButton
              title="Mới nhất"
              active={sortCriteria === 'date_desc'}
              onPress={() => {
                setSortCriteria('date_desc');
                setSortModalVisible(false);
              }}
            />
            {/* Cũ nhất */}
            <SortOptionButton
              title="Cũ nhất"
              active={sortCriteria === 'date_asc'}
              onPress={() => {
                setSortCriteria('date_asc');
                setSortModalVisible(false);
              }}
            />
            {/* Tên (A-Z) */}
            <SortOptionButton
              title="Tên (A-Z)"
              active={sortCriteria === 'name_asc'}
              onPress={() => {
                setSortCriteria('name_asc');
                setSortModalVisible(false);
              }}
            />
            {/* Tên (Z-A) */}
            <SortOptionButton
              title="Tên (Z-A)"
              active={sortCriteria === 'name_desc'}
              onPress={() => {
                setSortCriteria('name_desc');
                setSortModalVisible(false);
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}