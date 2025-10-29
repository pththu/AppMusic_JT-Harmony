import {
  View,
  Text,
  useColorScheme,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import React, { useState, useMemo, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { router } from 'expo-router';
import { usePlayerStore } from '@/store/playerStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MOCK_TRACKS_GROUPS = [
  {
    title: "Mới phát gần đây",
    data: [
      { id: 'r1', title: 'Way Back Home', artist: 'SHAUN', imageUrl: 'https://via.placeholder.com/150/f00?text=R1' },
      { id: 'r2', title: 'Đi Giữa Trời Rực Rỡ', artist: 'Ngô Lan Hương', imageUrl: 'https://via.placeholder.com/150/0f0?text=R2' },
      { id: 'r3', title: 'Đại Lộ Mặt Trời', artist: 'Chillies', imageUrl: 'https://via.placeholder.com/150/00f?text=R3' },
      { id: 'r4', title: 'Anh Nói Yêu Em Được Không', artist: 'MinZ Mặt Đất, LUNY', imageUrl: 'https://via.placeholder.com/150/ff0?text=R4' },
    ],
    subtitle: null,
  },
  {
    title: "Bài hát bạn đã thích",
    data: [
      { id: 'l1', title: 'Chuột Yêu Gạo', artist: 'Khởi My, Kelvin Khánh', imageUrl: 'https://via.placeholder.com/150/0ff?text=L1' },
      { id: 'l2', title: 'Thế Giới Và Em, Anh Chọn Em', artist: 'Tuấn Hưng', imageUrl: 'https://via.placeholder.com/150/f0f?text=L2' },
      { id: 'l3', title: 'Ấm Êm', artist: 'Hưng Cao, Raise', imageUrl: 'https://via.placeholder.com/150/888?text=L3' },
      { id: 'l4', title: 'Quên Đặt Tên', artist: 'Phạm Nguyên Ngọc, BMZ', imageUrl: 'https://via.placeholder.com/150/333?text=L4' },
    ],
    subtitle: null,
  },
  {
    title: "Được đề xuất",
    data: [
      { id: 's1', title: 'Sinh Ra Đã Là Thứ Đối Lập Nhau', artist: 'Emcee L (Da LAB)', imageUrl: 'https://via.placeholder.com/150/0b0?text=S1' },
      { id: 's2', title: 'Thắc Mắc?', artist: 'Thịnh Suy', imageUrl: 'https://via.placeholder.com/150/1c1?text=S2' },
      { id: 's3', title: 'Mai Mình Xa', artist: 'Thịnh Suy', imageUrl: 'https://via.placeholder.com/150/2d2?text=S3' },
      { id: 's4', title: 'bao tiền một mớ bình yên?', artist: '14 Casper, Bon Nghiêm', imageUrl: 'https://via.placeholder.com/150/3e3?text=S4' },
    ],
    subtitle: "Dựa trên các bài hát bạn vừa thêm vào.",
  },
];

const TrackItem = React.memo(({ item, isDarkMode, onAdd }: { item: any; isDarkMode: boolean; onAdd: (track: any) => void; }) => {
  const textColor = isDarkMode ? "text-white" : "text-black";
  const subTextColor = isDarkMode ? "text-gray-400" : "text-gray-600";
  const primaryColor = "#22c55e";

  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-row items-center flex-1 pr-4">
        <Image
          source={{ uri: item.imageUrl }}
          className="w-12 h-12 rounded-sm mr-3"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text className={`text-base ${textColor}`} numberOfLines={1}>
            {item.title}
          </Text>
          <Text className={`text-sm ${subTextColor}`} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
      </View>

      {/* Nút Thêm (+) */}
      <TouchableOpacity
        onPress={() => onAdd(item)}
        className="w-10 h-10 justify-center items-center rounded-full"
      >
        <Icon name="add-circle-outline" size={28} color={primaryColor} />
      </TouchableOpacity>
    </View>
  );
});

const AddTrackScreen = ({ playlistName = "Playlist của tôi" }) => {

  const currentPlaylist = usePlayerStore((state) => state.currentPlaylist);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const bgColor = isDarkMode ? '#121212' : 'white';
  const textColor = isDarkMode ? 'white' : 'black';
  const iconColor = isDarkMode ? 'white' : 'black';
  const inputBgColor = isDarkMode ? '#333' : 'rgb(229, 231, 235)';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const flatListRef = useRef(null);

  const handleAddTrack = (track) => {
    console.log(`Đã thêm bài hát: ${track.title}`);
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    setActiveIndex(newIndex);
  };

  const isSearching = searchQuery.length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];

    const lowerCaseQuery = searchQuery.toLowerCase();
    const allTracks = MOCK_TRACKS_GROUPS.flatMap(group => group.data);

    return allTracks.filter(track =>
      track.title.toLowerCase().includes(lowerCaseQuery) ||
      track.artist.toLowerCase().includes(lowerCaseQuery)
    );
  }, [searchQuery]);


  const renderSlide = ({ item, index }) => (
    <View style={{ width: SCREEN_WIDTH }} className="px-4">
      <Text className={`text-xl font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-black'} mb-2`}>
        {item.title}
      </Text>
      {item.subtitle && (
        <Text className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          {item.subtitle}
        </Text>
      )}

      <FlatList
        data={item.data}
        keyExtractor={(track) => track.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: trackItem }) => (
          <TrackItem item={trackItem} isDarkMode={isDarkMode} onAdd={handleAddTrack} />
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );

  const renderSearchMode = () => (
    <FlatList
      data={searchResults}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      className="px-4"
      renderItem={({ item }) => (
        <TrackItem item={item} isDarkMode={isDarkMode} onAdd={handleAddTrack} />
      )}
      ListEmptyComponent={() => (
        <View className="flex-1 justify-center items-center mt-10">
          <Text className="text-gray-500 dark:text-gray-400 text-lg">
            Không tìm thấy bài hát.
          </Text>
        </View>
      )}
      ListFooterComponent={<View style={{ height: 100 }} />}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <View className="flex-1">
        <View className="flex-row items-center pt-2 pb-4 px-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Icon name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className={`text-xl font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>Thêm vào danh sách phát này</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm" numberOfLines={1}>
              Vào: {currentPlaylist?.name || playlistName}
            </Text>
          </View>
        </View>

        {/* Thanh Tìm kiếm */}
        <View className="px-4 pb-4">
          <View className={`flex-row items-center rounded-lg p-2`} style={{ backgroundColor: inputBgColor }}>
            <Icon name="search" size={20} color="#888" />
            <TextInput
              placeholder="Tìm kiếm"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className={`ml-2 flex-1 text-base ${textColor}`}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} className="ml-2 p-1">
                <Icon name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* --- Phần chính: Slider (Nếu không tìm kiếm) hoặc Kết quả tìm kiếm --- */}
        {isSearching ? (
          renderSearchMode()
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={MOCK_TRACKS_GROUPS}
              keyExtractor={item => item.title}
              horizontal
              pagingEnabled // Quan trọng: Bật chế độ trượt theo trang
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              renderItem={renderSlide}
              // Tăng độ chính xác của việc snap (tùy chọn)
              decelerationRate="fast"
              snapToInterval={SCREEN_WIDTH}
            />

            {/* Chấm chỉ báo (Pagination Dots) */}
            <View className="flex-row justify-center py-3 absolute bottom-0 w-full">
              {MOCK_TRACKS_GROUPS.map((_, index) => (
                <View
                  key={index}
                  className="w-2 h-2 rounded-full mx-1"
                  style={{
                    backgroundColor: activeIndex === index ? iconColor : 'gray',
                    opacity: activeIndex === index ? 1 : 0.5,
                  }}
                />
              ))}
            </View>
          </>
        )}

      </View>
    </SafeAreaView>
  );
}

export default AddTrackScreen;