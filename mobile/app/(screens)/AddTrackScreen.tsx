import {
  View,
  Text,
  useColorScheme,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { router } from 'expo-router';
import { usePlayerStore } from '@/store/playerStore';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { AddTrackToPlaylist, AddTrackToPlaylistAfterConfirm, GetTracks } from '@/services/musicService';
import { SearchTracks } from '@/services/searchService';
import { useFavoritesStore } from '@/store/favoritesStore';
import TrackItem from '@/components/items/TrackItem';
import { useAddTrackData } from '@/hooks/useAddTrackData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AddTrackScreen = ({ playlistName = "Playlist của tôi" }) => {

  const colorScheme = useColorScheme();
  const { success, error, confirm, info } = useCustomAlert();

  const currentPlaylist = usePlayerStore((state) => state.currentPlaylist);

  const bgColor = colorScheme === 'dark' ? '#121212' : 'white';
  const textColor = colorScheme === 'dark' ? 'white' : 'black';
  const iconColor = colorScheme === 'dark' ? 'white' : 'black';
  const inputBgColor = colorScheme === 'dark' ? '#333' : 'rgb(229, 231, 235)';

  const [pageData, setPageData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const {
    isLoading,
    recentData,
    favoriteData,
    recommendData,
    handleAddTrack,
  } = useAddTrackData();

  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    setActiveIndex(newIndex);
  };

  const isSearching = searchQuery.length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];

    const lowerCaseQuery = searchQuery.toLowerCase();
    const allTracks = pageData.flatMap(group => group.data);

    return allTracks.filter(track =>
      track.name.toLowerCase().includes(lowerCaseQuery) ||
      (Array.isArray(track.artists) && track.artists.some(artist => String(artist).toLowerCase().includes(lowerCaseQuery)))
    );
  }, [searchQuery, pageData, isSearching]);

  useEffect(() => {
    const newPageData = [
      {
        title: "Đề xuất cho danh sách phát này",
        data: Array.isArray(recentData) ? recentData : [],
        subtitle: "Dựa trên các bài hát trong danh sách phát.",
      },
      {
        title: "Bài hát bạn đã thích",
        data: Array.isArray(favoriteData) ? favoriteData : [],
        subtitle: null,
      },
      {
        title: "Được đề xuất",
        data: Array.isArray(recommendData) ? recommendData : [],
        subtitle: "Dựa trên các bài hát bạn đã thích.",
      },
    ].filter(group => group.data.length > 0); // Chỉ hiển thị nhóm có dữ liệu

    setPageData(newPageData);
  }, [recentData, favoriteData, recommendData]);

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

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải playlist...</Text>
        </View>
      ) : (
        <FlatList
          data={item.data}
          keyExtractor={(track, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: trackItem }) => (
            <TrackItem item={trackItem} isDarkMode={colorScheme === 'dark'} onAdd={handleAddTrack} />
          )}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}
    </View>
  );

  const renderSearchMode = () => (
    <FlatList
      data={searchResults}
      keyExtractor={(item, index) => index.toString()}
      showsVerticalScrollIndicator={false}
      className="px-4"
      renderItem={({ item }) => (
        <TrackItem item={item} isDarkMode={colorScheme === 'dark'} onAdd={handleAddTrack} />
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
            {isLoading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#22c55e" />
                <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải playlist...</Text>
              </View>
            ) : (
              <>
                <FlatList
                  ref={flatListRef}
                  data={pageData}
                  keyExtractor={(item, index) => item.title}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  renderItem={renderSlide}
                  decelerationRate="fast"
                  snapToInterval={SCREEN_WIDTH}
                />

                <View className="flex-row justify-center py-3 absolute bottom-20 w-full">
                  {pageData?.map((_, index) => (
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
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

export default AddTrackScreen;