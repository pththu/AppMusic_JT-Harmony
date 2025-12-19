import CustomButton from "@/components/custom/CustomButton";
import LocalCategoryItem from "@/components/items/LocalCategoryItem";
import { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";
import ResultSearchListSection from "@/components/section/ResultSearchListSection";
import { BROWSE_CATEGORIES, FILTER_TYPES } from "@/constants/data";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useNavigate } from "@/hooks/useNavigate";
import { ClearSearchHistory, RemoveItemSearchHistory } from "@/services/historiesService";
import {
    GetSearchSuggestions,
    SaveSearchHistory,
    SearchAlbums,
    SearchAll,
    SearchArtists,
    SearchPlaylists,
    SearchTracks,
    SearchUsers,
} from "@/services/searchService";
import useAuthStore from "@/store/authStore";
import { useFollowStore } from "@/store/followStore";
import { useHistoriesStore } from "@/store/historiesStore";
import { usePlayerStore } from "@/store/playerStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Keyboard,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const ACTIVE_COLOR = "#22C55E";
const SEARCH_HISTORY_KEY = "search_history";

export default function SearchScreen() {
  const { navigate } = useNavigate();
  const { success, info, error, confirm } = useCustomAlert();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const user = useAuthStore((state) => state.user);
  const isGuest = useAuthStore((state) => state.isGuest);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isMiniPlayerVisible = usePlayerStore((state) => state.isMiniPlayerVisible);
  const searchHistory = useHistoriesStore((state) => state.searchHistory);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setCurrentPlaylist = usePlayerStore((state) => state.setCurrentPlaylist);
  const setCurrentAlbum = usePlayerStore((state) => state.setCurrentAlbum);
  const setCurrentArtist = useFollowStore((state) => state.setCurrentArtist);
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

  const handleSearchSubmit = async (query = searchText) => {
    if (!query.trim()) return;
    setSearchText(query);
    setIsSearching(true);
    setLoading(true);
    Keyboard.dismiss();

    try {
      if (!isGuest) {
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
      console.log("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const performFilteredSearch = async (query, filter) => {
    try {
      let results = { tracks: [], playlists: [], albums: [], artists: [], users: [] };

      switch (filter) {
        case "Track": {
          const payload = { trackName: query, artist: query, album: query, limit: 30 };
          const trackRes = await SearchTracks(payload);
          results.tracks = trackRes.data || [];
          break;
        }
        case "Playlist": {
          const playlistRes = await SearchPlaylists({ name: query });
          results.playlists = playlistRes.data || [];
          break;
        }
        case "Album": {
          const albumRes = await SearchAlbums({
            name: query,
            artist: query
          });
          results.albums = albumRes.data || [];
          break;
        }
        case "Artist": {
          const artistRes = await SearchArtists({ name: query });
          results.artists = artistRes.data || [];
          break;
        }
        case "User": {
          const userRes = await SearchUsers({ username: query, fullName: query, email: query });
          results.users = userRes.data || [];
          break;
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.log("Filtered search failed:", error);
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
          id: "current-query-" + query,
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
      console.log("Failed to fetch suggestions:", error);
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
    if (isGuest) return;
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
      console.log("Failed to save search history:", error);
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
      console.log("Failed to clear search history:", error);
    }
  };

  const removeSearchHistoryItem = async (itemId) => {
    try {
      const response = await RemoveItemSearchHistory(itemId);
      if (response.success) {
        const updatedHistory = recentSearches.filter(
          (item) => item.id !== itemId
        );
        setRecentSearches(updatedHistory);
        await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory)); // Cập nhật AsyncStorage
      }
    } catch (error) {
      console.log("Failed to remove search history item:", error);
    }
  };

  const handleItemPress = useCallback((item) => {
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

  const clearSearch = () => {
    setSearchText("");
    setIsSearching(false);
    setQuerySuggestions([]);
    inputRef.current?.clear();
    inputRef.current?.focus();
  };

  const fetchSearchHistory = async () => {
    try {
      for (const item of searchHistory) {
        setRecentSearches((prev) => [...prev, {
          id: item.id,
          type: "Query",
          title: item.query,
          subtitle: `Đã tìm kiếm "${item.query}"`,
          searchedAt: new Date(item?.searchedAt).toLocaleDateString(),
        }]);
      }
    } catch (error) {
      console.log("Failed to load search history:", error);
    }
  };

  useEffect(() => {
    if (user && isLoggedIn) {
      fetchSearchHistory();
    }
  }, [user?.id, isLoggedIn]);

  const renderSearchItem = ({ item, isSuggestion = false }) => {
    let iconName = "musical-notes";
    if (item.type === "Album") iconName = "disc";
    else if (item.type === "Artist") iconName = "person";
    else if (item.type === "Playlist") iconName = "list";
    else if (item.type === "User") iconName = "people-circle";
    else if (item.type === "Query") iconName = isSuggestion ? "search-outline" : "time";

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

  // Flatten results for filtered view
  const flattenedResults = useMemo(() => {
    if (activeFilter === "All") {
      return [
        ...searchResults.tracks.map((t) => ({ ...t, type: "Track" })),
        ...searchResults.playlists.map((p) => ({ ...p, type: "Playlist" })),
        ...searchResults.albums.map((a) => ({ ...a, type: "Album" })),
        ...searchResults.artists.map((a) => ({ ...a, type: "Artist" })),
        ...searchResults.users.map((u) => ({ ...u, type: "User" })),
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
          style={{
            backgroundColor: isDark ? "#000" : "#fff",
            zIndex: 10,
            borderBottomColor: isDark ? '#333' : '#ddd',
          }}
        >
          {/* SEARCH BAR */}
          <View
            className={`flex-row mx-3 rounded-xl px-3 items-center shadow-lg 
              ${isDark ? "bg-gray-800 shadow-black/30" : "bg-white shadow-gray-300/30 border border-gray-200"}`}
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
              className={`flex-1 ${isDark ? "text-white" : "text-black"} text-base h-full mx-2`}
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
                {FILTER_TYPES.map((item) => (
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
                <Text className={`text-${isDark ? "white" : "black"} font-bold text-lg mb-3`} >
                  {searchText.length > 0 ? "Gợi ý tìm kiếm" : "Tìm kiếm gần đây"}
                </Text>

                {suggestionsLoading && searchText.length > 0 ? (
                  <ActivityIndicator size="small" color={ACTIVE_COLOR} />
                ) : (
                  <View className="">
                    {
                      isGuest && searchText.length === 0 ? (
                        <Text className={`text-${isDark ? "gray-400" : "gray-600"} text-center mt-10`}>
                          Tài khoản khách không có lịch sử tìm kiếm.
                        </Text>
                      ) : ((searchText.length > 0 ? querySuggestions : recentSearches).map((item) => (
                        <View key={item.id}>
                          {renderSearchItem({ item, isSuggestion: searchText.length > 0 })}
                        </View>
                      )))
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
                {isSearching ? (
                  <View>
                    {/* Results Title */}
                    <Text className={`text-${isDark ? "white" : "black"} font-bold text-lg mx-3 mb-3`}>
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
                                <View key={`${item.type}-${item.spotifyId}-${item.id}-${index}`}>
                                  <ResultSearchListSection
                                    item={item}
                                    isDark={isDark}
                                    onItemPerss={handleItemPress}
                                  />
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
                              <Text className={`text-${isDark ? "gray-400" : "gray-600"} text-center`}>
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
                    <Text className={`text-${isDark ? "white" : "black"} font-bold text-lg ml-3 mb-3`}>
                      Khám phá thể loại
                    </Text>
                    <View
                      className="flex-row w-[90%] flex-wrap justify-between self-center"
                      style={{
                        paddingBottom: (isMiniPlayerVisible ? MINI_PLAYER_HEIGHT : 0),
                      }}
                    >
                      {BROWSE_CATEGORIES.map((item, index) => (
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