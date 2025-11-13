import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView, // Bị thay thế bởi Animated.ScrollView
  FlatList,
  TouchableOpacity,
  Image,
  useColorScheme,
  ActivityIndicator,
  Animated, // Import Animated
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useNavigate } from "@/hooks/useNavigate";
import Icon from "react-native-vector-icons/Ionicons";
import ArtistItem from "@/components/artists/ArtistItem";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { GetCategoryContent } from "@/services/searchService";
import { usePlayerStore } from "@/store/playerStore";
import { useArtistStore } from "@/store/artistStore";
import { pl } from "date-fns/locale";
import { set } from "date-fns";

// Component hiển thị Playlist/Track/Album
const ContentItem = ({ item, onPress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <TouchableOpacity onPress={onPress} className="w-36 mr-4">
      <Image
        source={{
          uri:
            item.imageUrl ||
            "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg",
        }}
        className="w-36 h-36 rounded-lg"
      />
      <Text
        className={`mt-2 font-semibold ${isDark ? "text-white" : "text-black"}`}
        numberOfLines={1}
      >
        {item.name || item.title}
      </Text>
      <Text
        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
        numberOfLines={1}
      >
        {item.subtitle || item.artists?.[0]?.name || ""}
      </Text>
    </TouchableOpacity>
  );
};

// Component hiển thị Section (Không đổi)
const ContentSection = ({ title, data, renderItem, keyExtractor }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      <Text
        className={`font-bold text-xl ml-3 mb-3 ${isDark ? "text-white" : "text-black"
          }`}
      >
        {title}
      </Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
      />
    </View>
  );
};

export default function CategoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { category } = useLocalSearchParams<{ category: string }>();
  const { navigate } = useNavigate();
  const { info } = useCustomAlert();

  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setCurrentPlaylist = usePlayerStore((state) => state.setCurrentPlaylist);
  const setCurrentAlbum = usePlayerStore((state) => state.setCurrentAlbum);
  const setCurrentArtist = useArtistStore((state) => state.setCurrentArtist);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const playPlaylist = usePlayerStore((state) => state.playPlaylist);

  const isDark = colorScheme === "dark";


  const [categoryData, setCategoryData] = useState({
    genre: null,
    playlists: [],
    artists: [],
    tracks: [],
    albums: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const LARGE_TITLE_HEIGHT = 60;

  const smallTitleOpacity = scrollY.interpolate({
    inputRange: [LARGE_TITLE_HEIGHT / 2, LARGE_TITLE_HEIGHT],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [0, LARGE_TITLE_HEIGHT / 2],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  useEffect(() => {
    if (!category) {
      setError("Không có thể loại nào được chọn");
      setLoading(false);
      return;
    }
    fetchCategoryData();
  }, [category]);

  const fetchCategoryData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await GetCategoryContent(category);
      if (response.success) {
        setCategoryData(response.data);
      } else {
        setError(response.message || "Tải nội dung thể loại thất bại");
      }
    } catch (err: any) {
      console.error("Error fetching category data:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải nội dung");
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handlePlaylistPress = (item) => {
    setCurrentPlaylist(item);
    navigate("PlaylistScreen", { playlist: JSON.stringify(item) });
  };
  const handleArtistPress = (item) => {
    setCurrentArtist(item);
    navigate("ArtistScreen", { artist: JSON.stringify(item) });
  };
  const handleTrackPress = (item) => {
    setCurrentTrack(item);
    playPlaylist([item], 0);
    setQueue([]);
    // navigate("SongScreen", { track: JSON.stringify(item) });
  };
  // THÊM MỚI: Handler cho Album
  const handleAlbumPress = (item) => {
    setCurrentAlbum(item);
    navigate("AlbumScreen", { album: JSON.stringify(item) });
  };

  // Render states (Cập nhật Tiếng Việt)
  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={isDark ? "#FFF" : "#000"} />
      <Text
        className={`mt-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        Đang tải {category}...
      </Text>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 items-center justify-center px-6">
      <Icon name="alert-circle-outline" size={64} color={isDark ? "#888" : "#666"} />
      <Text
        className={`mt-4 text-center ${isDark ? "text-gray-400" : "text-gray-600"
          }`}
      >
        {error}
      </Text>
      <TouchableOpacity
        onPress={fetchCategoryData}
        className="mt-4 bg-green-500 px-6 py-3 rounded-full"
      >
        <Text className="text-white font-semibold">Thử Lại</Text>
      </TouchableOpacity>
    </View>
  );

  // Dời renderEmptyState vào trong ScrollView để nó xuất hiện dưới Tiêu đề lớn
  const renderEmptyState = () => (
    <View className="items-center justify-center px-6 mt-20">
      <Icon name="musical-notes-outline" size={64} color={isDark ? "#888" : "#666"} />
      <Text
        className={`mt-4 text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        Không tìm thấy nội dung cho "{category}".
      </Text>
    </View>
  );

  // Cập nhật logic kiểm tra nội dung
  const hasContent =
    categoryData.playlists.length > 0 ||
    categoryData.artists.length > 0 ||
    categoryData.tracks.length > 0 ||
    categoryData.albums.length > 0; // <-- THÊM MỚI

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}>
      {/* Header (Thay đổi thiết kế) */}
      <View className="flex-row items-center justify-between px-3 py-2 h-14">
        <TouchableOpacity onPress={() => router.back()} className="p-2 z-10">
          <Icon name="arrow-back" size={24} color={isDark ? "#FFF" : "#000"} />
        </TouchableOpacity>

        {/* Tiêu đề nhỏ (hiện khi scroll) */}
        <Animated.Text
          className={`text-xl font-bold absolute left-0 right-0 text-center ${isDark ? "text-white" : "text-black"
            }`}
          style={{
            opacity: smallTitleOpacity,
            // zIndex: -1 để tiêu đề không đè lên nút Back
            zIndex: -1,
          }}
          numberOfLines={1}
        >
          {category}
        </Animated.Text>

        <View className="w-10" />
      </View>

      {/* Content */}
      {loading ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : (
        // Thay thế ScrollView bằng Animated.ScrollView
        <Animated.ScrollView
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {/* Tiêu đề lớn (ẩn khi scroll) */}
          <Animated.Text
            className={`text-3xl font-bold ml-3 mb-4 ${isDark ? "text-white" : "text-black"
              }`}
            style={{ opacity: largeTitleOpacity }}
          >
            {category}
          </Animated.Text>

          {/* Hiển thị nội dung hoặc trạng thái rỗng */}
          {!hasContent ? (
            renderEmptyState()
          ) : (
            <>
              {/* Featured Playlists */}
              <ContentSection
                title="Playlist Nổi Bật"
                data={categoryData.playlists}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <ContentItem
                    item={item}
                    onPress={() => handlePlaylistPress(item)}
                  />
                )}
              />

              {/* Popular Artists */}
              <ContentSection
                title="Nghệ Sĩ Nổi Bật"
                data={categoryData.artists}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <ArtistItem
                    name={item.name}
                    image={item.imageUrl}
                    onPress={() => handleArtistPress(item)}
                  />
                )}
              />

              {/* Popular Tracks */}
              <ContentSection
                title="Bài Hát Phổ Biến"
                data={categoryData.tracks}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <ContentItem
                    item={item}
                    onPress={() => handleTrackPress(item)}
                  />
                )}
              />

              {/* THÊM MỚI: Albums */}
              <ContentSection
                title="Album Đề xuất"
                data={categoryData.albums}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <ContentItem
                    item={item}
                    onPress={() => handleAlbumPress(item)}
                  />
                )}
              />
            </>
          )}
        </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
}