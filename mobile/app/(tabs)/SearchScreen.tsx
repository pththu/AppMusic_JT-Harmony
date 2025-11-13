import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import {
  Animated,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigate } from "@/hooks/useNavigate";
import ArtistItem from "@/components/artists/ArtistItem";
import CustomButton from "@/components/custom/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";

import {
  GetArtistsForYou,
} from "@/services/musicService";
import {
  SearchAll,
  SearchTracks,
  SearchPlaylists,
  SearchAlbums,
  SearchArtists,
  GetSearchSuggestions,
  ClearSearchHistory,
  SearchUsers,
  SaveSearchHistory,
  RemoveItemSearchHistory,
} from "@/services/searchService";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { usePlayerStore } from "@/store/playerStore";
import { useArtistStore } from "@/store/artistStore";
import useAuthStore from "@/store/authStore";
import { se } from "date-fns/locale";
import { useCustomAlert } from "@/hooks/useCustomAlert";

const ACTIVE_COLOR = "#22C55E";
const SEARCH_HISTORY_KEY = "search_history";

const browseCategories = [
  { id: "3", name: "POP", color: "#4facfe", colorEnd: "#e0c3fc", icon: "heart" },
  { id: "4", name: "K-POP", color: "#e8198b", colorEnd: "#f794a4", icon: "people" },
  { id: "6", name: "V-POP", color: "#ff0844", colorEnd: "#f9d423", icon: "star" },
  { id: "2", name: "C-POP", color: "#f5576c", colorEnd: "#fee140", icon: "snow" },
  { id: "5", name: "J-POP", color: "#e8198b", colorEnd: "#efefef", icon: "disc" },
  { id: "7", name: "RAP", color: "#c71d6f", colorEnd: "#96deda", icon: "mic" },
  { id: "12", name: "ROCK", color: "#e8198b", colorEnd: "#FFBD71", icon: "mic" },
  { id: "8", name: "HIP-HOP", color: "#2b5876", colorEnd: "#dad4ec", icon: "headset" },
  { id: "9", name: "DANCE", color: "#009efd", colorEnd: "#38f9d7", icon: "body" },
  { id: "10", name: "INDIE", color: "#a18cd1", colorEnd: "#FBC2EB", icon: "leaf" },
  { id: "1", name: "TAMIL", color: "#eacda3", colorEnd: "#94B447", icon: "musical-notes" },
  { id: "11", name: "JAZZ", color: "#FF7A7B", colorEnd: "#FFBD71", icon: "musical-note" },
];

const filterTypes = ["All", "Track", "Artist", "Album", "Playlist", "User"];

const LocalCategoryItem = ({ name, color, colorEnd, icon, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 m-1.5"
      style={{ aspectRatio: 1.6 }}
    >
      <LinearGradient
        colors={[color, colorEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 rounded-lg p-3 justify-between overflow-hidden"
      >
        <View className="self-start">
          <Icon name={icon as any} size={28} color="#FFFFFF" />
        </View>
        <Text className="text-white font-bold text-base">
          {name}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function SearchScreen() {
  const { navigate } = useNavigate();
  const { success, info, error, confirm } = useCustomAlert();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const user = useAuthStore((state) => state.user);
  const isMiniPlayerVisible = usePlayerStore((state) => state.isMiniPlayerVisible);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setCurrentPlaylist = usePlayerStore((state) => state.setCurrentPlaylist);
  const setCurrentAlbum = usePlayerStore((state) => state.setCurrentAlbum);
  const setCurrentArtist = useArtistStore((state) => state.setCurrentArtist);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const playPlaylist = usePlayerStore((state) => state.playPlaylist);

  const inputRef = useRef<TextInput>(null);
  const animation = useRef(new Animated.Value(0)).current;
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [recentSearches, setRecentSearches] = useState([]);
  const [querySuggestions, setQuerySuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState({
    tracks: [],
    playlists: [],
    albums: [],
    artists: [],
    users: [],
  });
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [trendingArtists, setTrendingArtists] = useState([]);

  const containerBackgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDark ? "#000" : "#fff",
      isDark ? "#121212" : "#f5f5f5",
    ],
  });

  useEffect(() => {
    loadSearchHistory();
    loadTrendingArtists();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setRecentSearches(JSON.parse(history));
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
    }
  };

  const loadTrendingArtists = async () => {
    try {
      const response = await GetArtistsForYou({ artistNames: [], genres: ['POP', 'HIP-HOP'] });
      setTrendingArtists(response.data);
    } catch (error) {
      console.error("Failed to load trending artists:", error);
    }
  };

  const handleSearchSubmit = async (query = searchText) => {
    if (!query.trim()) return;

    setSearchText(query);
    setIsSearching(true);
    setLoading(true);
    Keyboard.dismiss();

    console.log('query', query)
    try {
      const response = await SaveSearchHistory(query);
      if (response && response.success) {
        if (response.updated) {
          console.log("Search history synced with server.");
        } else {
          await saveToHistory({
            id: response.data.id,
            type: "Query",
            title: query,
            subtitle: `Đã tìm kiếm "${query}"`,
            searchedAt: new Date(response.data.searchedAt).toLocaleDateString(),
          });
        }
      }

      if (activeFilter === "All") {
        const results = await SearchAll(query, 20);
        setSearchResults({
          tracks: results.tracks || [],
          playlists: results.playlists || [],
          albums: results.albums || [],
          artists: results.artists || [],
          users: results.users || [],
        });
      } else {
        await performFilteredSearch(query, activeFilter);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const performFilteredSearch = async (query: string, filter: string) => {
    try {
      let results = { tracks: [], playlists: [], albums: [], artists: [], users: [] };

      switch (filter) {
        case "Track":
          console.log(1)
          const trackRes = await SearchTracks({
            trackName: query,
            artist: query,
            album: query,
            limit: 30
          });
          results.tracks = trackRes.data || [];
          break;
        case "Playlist":
          console.log(2)
          const playlistRes = await SearchPlaylists({ name: query });
          results.playlists = playlistRes.data || [];
          break;
        case "Album":
          console.log(3)
          const albumRes = await SearchAlbums({
            name: query,
            artist: query
          });
          results.albums = albumRes.data || [];
          break;
        case "Artist":
          console.log(4)
          const artistRes = await SearchArtists({ name: query });
          results.artists = artistRes.data || [];
          break;
        case "User":
          console.log(5)
          const userRes = await SearchUsers({ username: query, fullName: query, email: query });
          results.users = userRes.data || [];
          break;
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Filtered search failed:", error);
    }
  };

  const handleFilterChange = async (filter: string) => {
    setActiveFilter(filter);
    if (isSearching && searchText) {
      setLoading(true);
      if (filter === "All") {
        const results = await SearchAll(searchText, 20);
        setSearchResults(results);
      } else {
        await performFilteredSearch(searchText, filter);
      }
      setLoading(false);
    }
  };

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setQuerySuggestions([]);
      return;
    }

    setSuggestionsLoading(true);
    try {
      const response = await GetSearchSuggestions(query);
      const suggestions = response.data || [];

      // Format suggestions
      const formatted = [
        {
          id: "current-query",
          type: "Query",
          title: query,
          subtitle: `Đã tìm kiếm "${query}"`,
        },
        ...suggestions.map((s, idx) => ({
          id: `suggestion-${idx}`,
          type: "Query",
          title: s,
          subtitle: "Gợi ý tìm kiếm",
        })),
      ];

      setQuerySuggestions(formatted.slice(0, 10));
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setQuerySuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleTextChange = (text: string) => {
    setSearchText(text);
    setIsSearching(false);

    if (text.length > 0) {
      setIsFocused(true);
    }

    // Debounce suggestions
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 300);
  };

  const saveToHistory = async (item: any) => {
    try {
      const history = [...recentSearches];
      const existingIndex = history.findIndex(
        (h) => h.title.toLowerCase() === item.title.toLowerCase()
      );

      if (existingIndex !== -1) {
        history.splice(existingIndex, 1);
      }

      history.unshift(item);
      const trimmedHistory = history.slice(0, 20);

      setRecentSearches(trimmedHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  };

  const clearHistory = async () => {
    try {
      setRecentSearches([]);
      const response = await ClearSearchHistory(SEARCH_HISTORY_KEY);
      if (response.success) {
        console.log("Search history cleared.");
      }
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  };

  const removeSearchHistoryItem = async (itemId) => {
    try {
      console.log('item id: ', itemId)
      const response = await RemoveItemSearchHistory(itemId);
      if (response.success) {
        const updatedHistory = recentSearches.filter(
          (item) => item.id !== itemId
        );
        setRecentSearches(updatedHistory);
        await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory)); // Cập nhật AsyncStorage
      }
    } catch (error) {
      console.error("Failed to remove search history item:", error);
    }
  };

  const handleItemPress = useCallback((item) => {
    console.log('item: ', item)
    const itemType = item.type || "Track";

    switch (itemType) {
      case "Track":
        setCurrentTrack(item);
        playPlaylist([item], 0);
        setQueue([]);
        break;
      case "Playlist":
        setCurrentPlaylist(item);
        navigate("PlaylistScreen", { playlist: JSON.stringify(item) });
        break;
      case "Album":
        setCurrentAlbum(item);
        navigate("AlbumScreen", { album: JSON.stringify(item) });
        break;
      case "Artist":
        setCurrentArtist(item);
        navigate("ArtistScreen", { artist: JSON.stringify(item) });
        break;
      case "User":
        console.log(item.id)
        if (user && item.id === user?.id) {
          navigate("Profile");
        } else {
          navigate("ProfileSocialScreen", { userId: JSON.stringify(item.id) });
        }
        break;
      default:
        console.log("Unknown item type:", itemType);
    }
  }, [navigate]);

  const resetToDefaultState = () => {
    setIsFocused(false);
    setIsSearching(false);
    setSearchText("");
    setQuerySuggestions([]);
    Keyboard.dismiss();
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const onFocus = () => {
    setIsFocused(true);
    setIsSearching(false);
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const onBlur = () => {
    if (!searchText && !isSearching) {
      resetToDefaultState();
    } else if (searchText && !isSearching) {
      Keyboard.dismiss();
    }
  };

  const clearSearch = () => {
    setSearchText("");
    setIsSearching(false);
    setQuerySuggestions([]);
    inputRef.current?.clear();
    inputRef.current?.focus();
  };

  const renderSearchItem = ({ item, isSuggestion = false }) => {
    let iconName = "musical-notes";
    if (item.type === "Album") iconName = "disc";
    else if (item.type === "Artist") iconName = "person";
    else if (item.type === "Playlist") iconName = "list";
    else if (item.type === "User") iconName = "people-circle";
    else if (item.type === "Query") iconName = isSuggestion ? "search-outline" : "time";

    console.log('id', item.id)

    return (
      <TouchableOpacity
        onPress={() => handleSearchSubmit(item.title)}
        className="flex-row justify-between items-center py-3"
      >
        <View className="flex-row items-center flex-1">
          <Icon
            name={iconName}
            size={18}
            color={isDark ? "#888" : "#777"}
            style={{ marginRight: 12 }}
          />
          <View className="flex-1 ml-2">
            <Text
              className={`text-${isDark ? "white" : "black"} font-semibold text-sm`}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {item.subtitle && (
              <Text
                className={`text-${isDark ? "gray-400" : "gray-600"} text-xs`}
                numberOfLines={1}
              >
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>
        {!isSuggestion && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation(); // Ngăn sự kiện nhấn lan truyền lên TouchableOpacity cha
              removeSearchHistoryItem(item.id);
            }}
            className="ml-4 p-1"
          >
            <Icon
              name="close"
              size={20}
              color={isDark ? "#888" : "#777"}
            />
          </TouchableOpacity>
        )}
        {isSuggestion &&
          <TouchableOpacity onPress={() => setSearchText(item.title)}>
            <MaterialCommunityIcons
              name="arrow-top-left"
              size={20}
              color={isDark ? "#888" : "#777"}
            />
          </TouchableOpacity>}
      </TouchableOpacity>
    );
  };

  const renderResultItem = ({ item }) => {
    const itemType = item.type || "Track";
    let iconName = "musical-notes";
    if (itemType === "Album") iconName = "disc";
    else if (itemType === "Artist") iconName = "person";
    else if (itemType === "Playlist") iconName = "list";
    else if (itemType === "User") iconName = "people-circle";

    return (
      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        className="flex-row items-center py-2"
      >
        {itemType === 'User' ? (
          <>
            <Image
              source={{ uri: item?.avatarUrl }}
              style={{
                width: 50,
                height: 50,
                borderRadius: itemType === "Artist" || itemType === "User" ? 25 : 4,
              }}
            />
            <View className="ml-3 flex-1">
              <Text
                className={`text-${isDark ? "white" : "black"} font-semibold text-base`}
              >
                {item.fullName}
              </Text>
              <Text
                className={`text-${isDark ? "gray-400" : "gray-600"} text-xs`}
              >
                {itemType} • {item.username || ""}
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={isDark ? "#888" : "#777"} />
          </>
        ) : (
          <>
            {item.imageUrl ? (
              <Image
                source={{ uri: item?.imageUrl }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: itemType === "Artist" || itemType === "User" ? 25 : 4,
                }}
              />
            ) : (
              <View
                className={`w-12 h-12 rounded-${itemType === "Artist" || itemType === "User" ? "full" : "sm"
                  } items-center justify-center ${isDark ? "bg-gray-700" : "bg-gray-300"
                  }`}
              >
                <Icon name={iconName} size={24} color={isDark ? "#fff" : "#000"} />
              </View>
            )}
            <View className="ml-3 flex-1">
              <Text
                className={`text-${isDark ? "white" : "black"} font-semibold text-base`}
              >
                {item.name || item.title}
              </Text>
              <Text
                className={`text-${isDark ? "gray-400" : "gray-600"} text-xs`}
              >
                {itemType} • {item.subtitle || item.artists?.[0]?.name || ""}
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={isDark ? "#888" : "#777"} />
          </>
        )}
      </TouchableOpacity>
    );
  };

  // Flatten results for filtered view
  const flattenedResults = useMemo(() => {
    if (activeFilter === "All") {
      return [
        ...searchResults.tracks.map((t) => ({ ...t, type: "Track" })),
        ...searchResults.playlists.map((p) => ({ ...p, type: "Playlist" })),
        ...searchResults.albums.map((a) => ({ ...a, type: "Album" })),
        ...searchResults.artists.map((a) => ({ ...a, type: "Artist" })),
      ];
    } else {
      const key = activeFilter.toLowerCase() + "s";
      return (searchResults[key] || []).map((item) => ({
        ...item,
        type: activeFilter,
      }));
    }
  }, [searchResults, activeFilter]);

  const resultCount = flattenedResults.length;

  return (
    <Animated.View
      className="flex-1 pt-3"
      style={{
        backgroundColor: containerBackgroundColor,
      }}
    >
      <SafeAreaView edges={["top"]} className="flex-1">
        <View
          className={`pt-3 pb-2 ${isDark ? "bg-black" : "bg-white"}`}
          // Đặt background color cứng để che nội dung cuộn bên dưới
          style={{
            backgroundColor: isDark ? "#000" : "#fff",
            // Thêm shadow hoặc border dưới nếu cần để nổi bật khu vực cố định
            zIndex: 10,
            borderBottomColor: isDark ? '#333' : '#ddd',
          }}
        >
          {/* SEARCH BAR */}
          <View
            className={`flex-row mx-3 rounded-xl px-3 items-center shadow-lg ${isDark ? "bg-gray-800 shadow-black/30" : "bg-white shadow-gray-300/30 border border-gray-200"
              }`}
            style={{ height: 44 }}
          >
            {isFocused || isSearching ? (
              <TouchableOpacity onPress={resetToDefaultState} className="mr-2">
                <Icon name="arrow-back" size={20} color={isDark ? "#fff" : "#000"} />
              </TouchableOpacity>
            ) : (
              <Icon name="search" size={20} color={isDark ? "#888" : "#000"} />
            )}

            <TextInput
              ref={inputRef}
              className={`flex-1 ${isDark ? "text-white" : "text-black"
                } text-base h-full mx-2`}
              placeholder="Nhập tên bài hát, nghệ sĩ, album..."
              placeholderTextColor={isDark ? "#888" : "#777"}
              value={searchText}
              onChangeText={handleTextChange}
              onFocus={onFocus}
              onBlur={onBlur}
              returnKeyType="search"
              onSubmitEditing={() => handleSearchSubmit()}
            />

            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch} className="ml-2">
                <Icon name="close-circle" size={20} color={isDark ? "#888" : "#000"} />
              </TouchableOpacity>
            )}

            {!isSearching && searchText.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchSubmit()} className="ml-2 p-1">
                <Icon name="search-outline" size={20} color={ACTIVE_COLOR} />
              </TouchableOpacity>
            )}
          </View>

          {/* FILTER BUTTONS (HIỆN KHI ĐANG TÌM KIẾM) */}
          {isSearching && (
            <View className="mt-3 mx-3">
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="flex-row">
                {filterTypes.map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => handleFilterChange(item)}
                    className={`rounded-full px-4 py-2 mr-2 ${item === activeFilter
                      ? "bg-green-500" : `${isDark ? "bg-gray-700" : "bg-gray-200"}`}`}
                  >
                    <Text
                      className={`${item === activeFilter ? "text-white" : `${isDark ? "text-white" : "text-black"}`} font-semibold text-xs`}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        <ScrollView
          className="flex-1"
          style={{
            paddingBottom: isMiniPlayerVisible ? MINI_PLAYER_HEIGHT : 0,
            backgroundColor: colorScheme === "dark" ? "#121212" : "white",

          }}
          keyboardShouldPersistTaps="handled" // ưu tiên on press hơn keyboard
        >
          {/* Content */}
          <View className="flex-1">
            {isFocused && !isSearching ? (
              <View className="mt-5 mx-3 flex-1">
                <Text
                  className={`text-${isDark ? "white" : "black"
                    } font-bold text-lg mb-3`}
                >
                  {searchText.length > 0 ? "Gợi ý tìm kiếm" : "Tìm kiếm gần đây"}
                </Text>

                {suggestionsLoading && searchText.length > 0 ? (
                  <ActivityIndicator size="small" color={ACTIVE_COLOR} />
                ) : (
                  <View className="">
                    {
                      (searchText.length > 0 ? querySuggestions : recentSearches).map((item) => (
                        <View key={item.id}>
                          {renderSearchItem({ item, isSuggestion: searchText.length > 0 })}
                        </View>
                      ))
                    }
                    <View>
                      {recentSearches.length > 0 && !searchText && (
                        <CustomButton
                          title="Xóa lịch sử"
                          onPress={() => {
                            confirm(
                              "Xác nhận",
                              "Bạn có chắc chắn muốn xóa toàn bộ lịch sử tìm kiếm?",
                              () => clearHistory()
                            )
                          }}
                          variant="outline"
                          className="mt-5 items-start px-0"
                        />
                      )}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View className="my-4 ">
                {
                  isSearching ? (
                    <View>

                      {/* Results Title */}
                      <Text
                        className={`text-${isDark ? "white" : "black"
                          } font-bold text-lg mx-3 mb-3`}
                      >
                        {activeFilter === "All" ? "Tất cả" : `${activeFilter}`}  "{searchText}" ({resultCount})
                      </Text>

                      {/* Results List */}
                      {loading ? (
                        <View className="flex-1 items-center justify-center pt-10">
                          <ActivityIndicator size="large" color={ACTIVE_COLOR} />
                        </View>
                      ) : (
                        <View style={{ paddingBottom: isMiniPlayerVisible ? MINI_PLAYER_HEIGHT : 0 }}>
                          {
                            resultCount > 0 ? (
                              <View className="px-3 pb-14">
                                {flattenedResults.map((item, index) => (
                                  <View key={`${item.type}-${item.id || index}`}>
                                    {renderResultItem({ item })}
                                    {index < flattenedResults.length - 1 && (
                                      <View
                                        className={`h-px mx-3 my-1 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                                      />
                                    )}
                                  </View>
                                ))}
                              </View>
                            ) : (
                              <View className="flex-1 items-center justify-start pt-10">
                                <Text
                                  className={`text-${isDark ? "gray-400" : "gray-600"
                                    } text-center`}
                                >
                                  Không tìm thấy kết quả cho "{searchText}" trong {activeFilter}.
                                </Text>
                              </View>
                            )
                          }
                        </View>
                      )}
                    </View>
                  ) : (
                    <View className="mt-5">
                      <Text
                        className={`text-${isDark ? "white" : "black"
                          } font-bold text-lg ml-3 mb-3`}
                      >
                        Nghệ sĩ nổi bật
                      </Text>
                      <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 20 }}
                      >
                        {
                          trendingArtists.map((item, index) => (
                            <ArtistItem
                              key={item.id || `artist-${index}`}
                              name={item.name}
                              image={item.imageUrl}
                              onPress={() =>
                                handleItemPress({ ...item, type: "Artist" })
                              }
                            />
                          ))}
                      </ScrollView>
                      <Text
                        className={`text-${isDark ? "white" : "black"
                          } font-bold text-lg ml-3 mb-3`}
                      >
                        Khám phá thể loại
                      </Text>
                      <View
                        className="flex-row w-[90%] flex-wrap justify-between self-center"
                        style={{
                          paddingBottom: (isMiniPlayerVisible ? MINI_PLAYER_HEIGHT : 0),
                        }}
                      >
                        {browseCategories.map((item, index) => (
                          // View này sẽ chiếm 50% chiều rộng
                          <View key={item.id} style={{ width: '50%' }}>
                            <LocalCategoryItem
                              name={item.name}
                              color={item.color}
                              colorEnd={item.colorEnd}
                              icon={item.icon}
                              onPress={() =>
                                navigate("CategoryScreen", { category: item.name })
                              }
                            />
                          </View>
                        ))}
                      </View>
                    </View>
                  )
                }
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}