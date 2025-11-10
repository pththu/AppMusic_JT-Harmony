// import ArtistItem from "@/components/artists/ArtistItem";
// import CustomButton from "@/components/custom/CustomButton";
// import CategoryItem from "@/components/items/CategoryItem";
// import { useRouter } from "expo-router";
// import React, { useRef, useState, useMemo, useCallback } from "react";
// import {
//   Animated,
//   FlatList,
//   Keyboard,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   useColorScheme,
//   Image,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Icon from "react-native-vector-icons/Ionicons";
// import { useNavigate } from "@/hooks/useNavigate";
// import { artistData } from "@/constants/data";

// // --- CẬP NHẬT: Dữ liệu mock với các Type mới (Track, User) ---
// const searchResultsData = [
//   // Tracks (thay thế Songs)
//   { id: "s1", type: "Track", title: "Love Yourself", subtitle: "Justin Bieber", imageUrl: "https://images.pexels.com/photos/226460/pexels-photo-226460.jpeg" },
//   { id: "s2", type: "Track", title: "Redbone", subtitle: "Childish Gambino", imageUrl: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg" },
//   { id: "s3", type: "Track", title: "Stronger", subtitle: "Kanye West", imageUrl: "https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg" },
//   // Artists
//   { id: "a1", type: "Artist", title: "Childish Gambino", subtitle: "Artist", imageUrl: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg" },
//   { id: "a2", type: "Artist", title: "Justin Bieber", subtitle: "Artist", imageUrl: "https://images.pexels.com/photos/226460/pexels-photo-226460.jpeg" },
//   // Albums
//   { id: "al1", type: "Album", title: "Awaken, My Love!", subtitle: "Childish Gambino", imageUrl: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg" },
//   { id: "al2", type: "Album", title: "Purpose", subtitle: "Justin Bieber", imageUrl: "https://images.pexels.com/photos/226460/pexels-photo-226460.jpeg" },
//   // Playlists
//   { id: "p1", type: "Playlist", title: "Chill Vibes", subtitle: "Playlist", imageUrl: "" },
//   { id: "p2", type: "Playlist", title: "Hip-Hop Classics", subtitle: "Playlist", imageUrl: "" },
//   // Users
//   { id: "u1", type: "User", title: "An Nguyen", subtitle: "User Profile", imageUrl: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg" },
//   { id: "u2", type: "User", title: "Minh Thu", subtitle: "User Profile", imageUrl: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg" },
// ];

// const browseCategories = [
//   { id: "1", name: "TAMIL", color: "#1E90FF", icon: "musical-notes" },
//   { id: "2", name: "INTERNATIONAL", color: "#FF4500", icon: "globe" },
//   { id: "3", name: "POP", color: "#FF1493", icon: "heart" },
//   { id: "4", name: "HIP-HOP", color: "#8A2BE2", icon: "headset" },
//   { id: "5", name: "DANCE", color: "#FFD700", icon: "body" },
//   { id: "7", name: "INDIE", color: "#FF8C00", icon: "star" },
//   { id: "8", name: "JAZZ", color: "#00BFFF", icon: "radio" },
// ];

// // Dữ liệu lịch sử tìm kiếm ban đầu (Cập nhật loại)
// const initialRecentSearches = [
//   {
//     id: "1",
//     type: "Track",
//     title: "You (feat. Travis Scott)",
//     subtitle: "Don Toliver",
//   },
//   {
//     id: "2",
//     type: "Album",
//     title: "John Wick: Chapter 4 (Original Soundtrack)",
//     subtitle: "Tyler Bates, Joel J. Richard",
//   },
//   { id: "3", type: "Artist", title: "Maroon 5", subtitle: "Artist" },
//   { id: "4", type: "Playlist", title: "Phonk Madness", subtitle: "Playlist" },
// ];

// // Dữ liệu mock cho gợi ý chuỗi truy vấn (đã thêm)
// const mockQuerySuggestions = [
//   "Yêu 5", "Yêu", "Yêu là tha thu", "Yêu đơn phương", "Yêu thầm",
//   "Yêu là cưới", "Yêu là phải thương", "Yêu là khi", "yêu lại từ đầu",
//   "justin bieber songs", "childish gambino albums", "kanye west hits"
// ];


// // --- CẬP NHẬT: Các loại có thể lọc (Track, User) ---
// const filterTypes = ["All", "Track", "Artist", "Album", "Playlist", "User"];
// const ACTIVE_COLOR = "#22C55E"; // green-500

// export default function SearchScreen() {
//   const router = useRouter();
//   const { navigate } = useNavigate();
//   const colorScheme = useColorScheme();
//   const [isFocused, setIsFocused] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const [isSearching, setIsSearching] = useState(false);
//   const [activeFilter, setActiveFilter] = useState("All");
//   const [recentSearches, setRecentSearches] = useState(initialRecentSearches);
//   const inputRef = useRef<TextInput>(null);
//   const animation = useRef(new Animated.Value(0)).current;

//   // --- CẬP NHẬT: State để lưu item được chọn (ví dụ) ---
//   const [selectedTrack, setSelectedTrack] = useState(null);
//   const [selectedPlaylist, setSelectedPlaylist] = useState(null);
//   // ... (có thể thêm các state khác tương tự nếu cần xử lý dữ liệu sâu)


//   // --- CẬP NHẬT: Logic điều hướng (Navigate) ---
//   const handleItemPress = useCallback((item) => {
//     switch (item.type) {
//       case "Track":
//         setSelectedTrack(item);
//         navigate("SongScreen", { track: JSON.stringify(item) });
//         break;
//       case "Playlist":
//         setSelectedPlaylist(item);
//         navigate("PlaylistScreen", { playlist: JSON.stringify(item) });
//         break;
//       case "Album":
//         navigate("AlbumScreen", { album: JSON.stringify(item) });
//         break;
//       case "Artist":
//         navigate("ArtistScreen", { artist: JSON.stringify(item) });
//         break;
//       case "User":
//         navigate("ProfileSocialScreen", { user: JSON.stringify(item) });
//         break;
//       default:
//         console.log("Unknown item type:", item.type);
//     }
//   }, [navigate]);


//   // --- CẬP NHẬT: Logic chuyển về trạng thái ban đầu ---
//   const resetToDefaultState = () => {
//     setIsFocused(false);
//     setIsSearching(false);
//     Keyboard.dismiss();
//     Animated.timing(animation, {
//       toValue: 0,
//       duration: 300,
//       useNativeDriver: false,
//     }).start();
//   };

//   const onFocus = () => {
//     setIsFocused(true);
//     setIsSearching(false); // Reset trạng thái tìm kiếm khi focus
//     Animated.timing(animation, {
//       toValue: 1,
//       duration: 300,
//       useNativeDriver: false,
//     }).start();
//   };

//   const onBlur = () => {
//     if (!searchText && !isSearching) {
//       resetToDefaultState();
//     } else if (searchText && !isSearching) {
//       // Giữ Focus nhưng tắt bàn phím nếu có text để xem gợi ý
//       Keyboard.dismiss();
//     }
//   };

//   const containerBackgroundColor = animation.interpolate({
//     inputRange: [0, 1],
//     outputRange: [colorScheme === "dark" ? "#000" : "#fff", colorScheme === "dark" ? "#121212" : "#f5f5f5"],
//   });

//   const clearSearch = () => {
//     setSearchText("");
//     setIsSearching(false);
//     inputRef.current?.clear();
//     inputRef.current?.focus();
//   };

//   const clearHistory = () => {
//     setRecentSearches([]);
//   };

//   const handleSearchSubmit = (query = searchText) => {
//     if (!query) return;
//     setSearchText(query);
//     setIsSearching(true);
//     Keyboard.dismiss();

//     const newSearchItem = {
//       id: Date.now().toString(),
//       type: "Search",
//       title: query,
//       subtitle: `Searched for "${query}"`,
//     };
//     setRecentSearches(prev => [
//       newSearchItem,
//       ...prev.filter(item => item.title.toLowerCase() !== query.toLowerCase())
//     ].slice(0, 10));

//     setActiveFilter("All");
//   };

//   // Logic GỢI Ý CHUỖI TRUY VẤN
//   const querySuggestions = useMemo(() => {
//     if (!searchText) return [];
//     const lowerCaseSearch = searchText.toLowerCase();

//     const filteredMockSuggestions = mockQuerySuggestions
//       .filter(q => q.toLowerCase().includes(lowerCaseSearch))
//       .map(q => ({
//         id: `q-${q}`,
//         type: "Query",
//         title: q,
//         subtitle: "Suggested search",
//       }));

//     const currentQueryItem = {
//       id: "current-query",
//       type: "Query",
//       title: searchText,
//       subtitle: `Search for "${searchText}"`,
//     };

//     const uniqueSuggestions = [currentQueryItem, ...filteredMockSuggestions].filter((item, index, self) =>
//       index === self.findIndex((t) => (t.title.toLowerCase() === item.title.toLowerCase()))
//     );

//     return uniqueSuggestions.slice(0, 10);
//   }, [searchText]);


//   // Lịch sử tìm kiếm 
//   const historyList = useMemo(() => {
//     return recentSearches.filter(item => item.type !== "Query");
//   }, [recentSearches]);

//   // Kết quả Tìm kiếm và Lọc 
//   const filteredResults = useMemo(() => {
//     if (!searchText) return [];

//     const lowerCaseSearch = searchText.toLowerCase();
//     let results = searchResultsData.filter(item =>
//       item.title.toLowerCase().includes(lowerCaseSearch) ||
//       (item.subtitle && item.subtitle.toLowerCase().includes(lowerCaseSearch))
//     );

//     if (activeFilter !== "All") {
//       results = results.filter(item => item.type === activeFilter);
//     }

//     return results;
//   }, [searchText, activeFilter]);

//   // Hàm render chung cho item (sử dụng trong lịch sử và gợi ý)
//   const renderSearchItem = ({ item, isSuggestion = false }) => {
//     let iconName = "musical-notes";
//     if (item.type === "Album") iconName = "disc";
//     else if (item.type === "Artist") iconName = "person";
//     else if (item.type === "Playlist") iconName = "list";
//     else if (item.type === "User") iconName = "people-circle";
//     else if (item.type === "Search" || item.type === "Query") iconName = "time";

//     return (
//       <TouchableOpacity
//         // Nhấn vào item gợi ý/lịch sử sẽ thực hiện tìm kiếm truy vấn đó
//         onPress={() => handleSearchSubmit(item.title)}
//         className="flex-row justify-between items-center py-3"
//       >
//         <View className="flex-row items-center flex-1">
//           <Icon
//             name={iconName}
//             size={18}
//             color={colorScheme === "dark" ? "#888" : "#777"}
//             style={{ marginRight: 12 }}
//           />
//           <View className="flex-1 ml-2">
//             <Text className={`text-${colorScheme === "dark" ? "white" : "black"} font-semibold text-sm`} numberOfLines={1}>
//               {item.title}
//             </Text>
//             {item.subtitle && (
//               <Text className={`text-${colorScheme === "dark" ? "gray-400" : "gray-600"} text-xs`} numberOfLines={1}>
//                 {item.type === "Search" ? `Recent search` : item.subtitle}
//               </Text>
//             )}
//           </View>
//         </View>
//         {/* Mũi tên để đưa truy vấn lên thanh search */}
//         <TouchableOpacity onPress={() => setSearchText(item.title)}>
//           <Icon name="arrow-up-left" size={20} color={colorScheme === "dark" ? "#888" : "#777"} />
//         </TouchableOpacity>
//       </TouchableOpacity>
//     );
//   };


//   return (
//     <Animated.View
//       className="flex-1 pt-3"
//       style={{ backgroundColor: containerBackgroundColor }}
//     >
//       <SafeAreaView className="flex-1">
//         {/* Thanh tìm kiếm */}
//         <View className={`flex-row ${colorScheme === "dark" ? "bg-gray-800" : "bg-white"} mx-3 rounded-xl px-3 items-center shadow-lg ${colorScheme === "dark" ? "shadow-black/30" : "shadow-gray-300/30 border border-gray-200"}`} style={{ height: 44 }}>
//           {isFocused || isSearching ? (
//             < TouchableOpacity onPress={resetToDefaultState} className="mr-2">
//               <Icon name="arrow-back" size={20} color={colorScheme === "dark" ? "#fff" : "#000"} />
//             </TouchableOpacity>
//           ) : (
//             <Icon name="search" size={20} color={colorScheme === "dark" ? "#888" : "#000"} />
//           )}
//           <TextInput
//             ref={inputRef}
//             className={`flex-1 ${colorScheme === "dark" ? "text-white" : "text-black"} text-base h-full mx-2`}
//             placeholder="Search songs, artist, album or playlist"
//             placeholderTextColor={colorScheme === "dark" ? "#888" : "#777"}
//             value={searchText}
//             onChangeText={text => {
//               setSearchText(text);
//               if (text.length > 0) setIsFocused(true);
//               setIsSearching(false); // Thoát khỏi trạng thái kết quả khi nhập
//             }}
//             onFocus={onFocus}
//             onBlur={onBlur}
//             returnKeyType="search"
//             onSubmitEditing={() => handleSearchSubmit()}
//           />
//           {searchText.length > 0 && (
//             <TouchableOpacity onPress={clearSearch} className="ml-2">
//               <Icon name="close-circle" size={20} color={colorScheme === "dark" ? "#888" : "#000"} />
//             </TouchableOpacity>
//           )}
//           {!isSearching && searchText.length > 0 && (
//             <TouchableOpacity onPress={() => handleSearchSubmit()} className="ml-2 p-1">
//               {/* CẬP NHẬT MÀU: green-500 */}
//               <Icon name="search-outline" size={20} color={ACTIVE_COLOR} />
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Nội dung chính */}
//         <View className="flex-1">
//           {/* 3. Hiển thị Lịch sử/Gợi ý (isFocused && !isSearching) */}
//           {isFocused && !isSearching ? (
//             <View className="mt-5 mx-3 flex-1">
//               <Text className={`text-${colorScheme === "dark" ? "white" : "black"} font-bold text-lg mb-3`}>
//                 {searchText.length > 0 ? "Search Suggestions" : "Recent searches"}
//               </Text>

//               <FlatList
//                 data={searchText.length > 0 ? querySuggestions : historyList}
//                 keyExtractor={(item) => item.id}
//                 showsVerticalScrollIndicator={false}
//                 keyboardShouldPersistTaps="handled"
//                 renderItem={({ item }) => renderSearchItem({ item, isSuggestion: searchText.length > 0 })}
//                 ListFooterComponent={
//                   historyList.length > 0 && !searchText ? (
//                     <CustomButton
//                       title="Clear history"
//                       onPress={clearHistory}
//                       variant="outline"
//                       className="mt-5 items-start px-0"
//                     // CẬP NHẬT MÀU
//                     // style={{ borderColor: colorScheme === 'dark' ? ACTIVE_COLOR : 'gray', borderWidth: 1 }}
//                     // textClassName={`text-${colorScheme === "dark" ? "white" : "black"}`}
//                     />
//                   ) : null
//                 }
//               />
//             </View>
//           ) : (
//             <>
//               {
//                 isSearching ? (
//                   <View className="mt-5">
//                     {/* Bộ lọc */}
//                     <FlatList
//                       data={filterTypes}
//                       horizontal
//                       showsHorizontalScrollIndicator={false}
//                       contentContainerStyle={{ paddingHorizontal: 12, marginBottom: 15 }}
//                       keyExtractor={(item) => item}
//                       renderItem={({ item }) => (
//                         <TouchableOpacity
//                           onPress={() => setActiveFilter(item)}
//                           className={`rounded-full px-4 py-2 mr-2 ${item === activeFilter ? "bg-green-500" : (colorScheme === "dark" ? "bg-gray-700" : "bg-gray-200")}`}
//                         >
//                           <Text className={`${item === activeFilter ? "text-white" : (colorScheme === "dark" ? "text-white" : "text-black")} font-semibold text-xs`}>
//                             {item}
//                           </Text>
//                         </TouchableOpacity>
//                       )}
//                     />
//                     {/* Phần tiêu đề kết quả */}
//                     <Text className={`text-${colorScheme === "dark" ? "white" : "black"} font-bold text-lg mx-3 mb-3`}>
//                       {activeFilter === "All" ? "All Results" : `${activeFilter} Results`} for "{searchText}" ({filteredResults.length})
//                     </Text>

//                     {/* Danh sách kết quả */}
//                     {filteredResults.length > 0 ? (
//                       <FlatList
//                         data={filteredResults}
//                         keyExtractor={(item) => item.id}
//                         showsVerticalScrollIndicator={false}
//                         contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 50 }}
//                         renderItem={({ item }) => {
//                           let iconName = "musical-notes";
//                           if (item.type === "Album") iconName = "disc";
//                           else if (item.type === "Artist") iconName = "person";
//                           else if (item.type === "Playlist") iconName = "list";
//                           else if (item.type === "User") iconName = "people-circle";

//                           return (
//                             <TouchableOpacity
//                               // CẬP NHẬT: Gọi hàm điều hướng
//                               onPress={() => handleItemPress(item)}
//                               className="flex-row items-center py-2"
//                             >
//                               {/* Ảnh/Icon bên trái */}
//                               {item.imageUrl ? (
//                                 <Image
//                                   source={{ uri: item.imageUrl }}
//                                   style={{ width: 50, height: 50, borderRadius: item.type === 'Artist' || item.type === 'User' ? 25 : 4 }}
//                                 />
//                               ) : (
//                                 <View className={`w-12 h-12 rounded-${item.type === 'Artist' || item.type === 'User' ? "full" : "sm"} items-center justify-center ${colorScheme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}>
//                                   <Icon name={iconName} size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
//                                 </View>
//                               )}
//                               {/* Nội dung text */}
//                               <View className="ml-3 flex-1">
//                                 <Text className={`text-${colorScheme === "dark" ? "white" : "black"} font-semibold text-base`} numberOfLines={1}>
//                                   {item.title}
//                                 </Text>
//                                 <Text className={`text-${colorScheme === "dark" ? "gray-400" : "gray-600"} text-xs`} numberOfLines={1}>
//                                   {item.type} • {item.subtitle}
//                                 </Text>
//                               </View>
//                               {/* Mũi tên bên phải */}
//                               <Icon name="chevron-forward" size={20} color={colorScheme === "dark" ? "#888" : "#777"} />
//                             </TouchableOpacity>
//                           );
//                         }}
//                         ItemSeparatorComponent={() => (
//                           <View className={`h-px mx-3 my-1 ${colorScheme === "dark" ? "bg-gray-800" : "bg-gray-100"}`} />
//                         )}
//                       />
//                     ) : (
//                       <View className="flex-1 items-center justify-start pt-10">
//                         <Text className={`text-${colorScheme === "dark" ? "gray-400" : "gray-600"} text-center`}>
//                           No results found for "{searchText}" in {activeFilter}.
//                         </Text>
//                       </View>
//                     )}

//                   </View>
//                 ) : (
//                   /* 5. Hiển thị Trending Artists (Mặc định: !isFocused && !isSearching) */
//                   <View className="mt-5">
//                     <Text className={`text-${colorScheme === "dark" ? "white" : "black"} font-bold text-lg ml-3 mb-3`}>
//                       Trending artists
//                     </Text>
//                     <FlatList
//                       data={artistData}
//                       horizontal
//                       keyExtractor={(item) => item.spotifyId}
//                       showsHorizontalScrollIndicator={false}
//                       contentContainerStyle={{
//                         paddingHorizontal: 12,
//                         marginBottom: 20,
//                       }}
//                       renderItem={({ item }) => (
//                         <ArtistItem
//                           name={item.name}
//                           image={item.imageUrl}
//                           onPress={() =>
//                             navigate("ArtistScreen", { artist: JSON.stringify(item) })
//                           }
//                         />
//                       )}
//                     />

//                     {/* Browse Categories */}
//                     <Text className={`text-${colorScheme === "dark" ? "white" : "black"} font-bold text-lg ml-3 mb-3`}>
//                       Browse All
//                     </Text>
//                     <FlatList
//                       data={browseCategories}
//                       numColumns={2}
//                       keyExtractor={(item) => item.id}
//                       showsVerticalScrollIndicator={false}
//                       contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 50 }}
//                       renderItem={({ item }) => (
//                         <CategoryItem
//                           name={item.name}
//                           color={item.color}
//                           icon={item.icon}
//                           onPress={() => navigate("CategoryScreen", { category: item.name })}
//                         />
//                       )}
//                     />
//                   </View>
//                 )
//               }
//             </>
//           )}
//         </View>
//       </SafeAreaView>
//     </Animated.View >
//   );
// }

import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigate } from "@/hooks/useNavigate";
import ArtistItem from "@/components/artists/ArtistItem";
import CategoryItem from "@/components/items/CategoryItem";
import CustomButton from "@/components/custom/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import các API functions
import {
  SearchAll,
  SearchTracks,
  SearchPlaylists,
  SearchAlbums,
  SearchArtists,
  SearchUsers,
  GetSearchSuggestions,
  GetAllGenres,
} from "@/services/musicService";

const ACTIVE_COLOR = "#22C55E";
const SEARCH_HISTORY_KEY = "search_history";

// Browse categories với icon và màu sắc
const browseCategories = [
  { id: "1", name: "TAMIL", color: "#1E90FF", icon: "musical-notes" },
  { id: "2", name: "INTERNATIONAL", color: "#FF4500", icon: "globe" },
  { id: "3", name: "POP", color: "#FF1493", icon: "heart" },
  { id: "4", name: "HIP-HOP", color: "#8A2BE2", icon: "headset" },
  { id: "5", name: "DANCE", color: "#FFD700", icon: "body" },
  { id: "6", name: "INDIE", color: "#FF8C00", icon: "star" },
  { id: "7", name: "JAZZ", color: "#00BFFF", icon: "radio" },
];

// Filter types
const filterTypes = ["All", "Track", "Artist", "Album", "Playlist", "User"];

export default function SearchScreen() {
  const { navigate } = useNavigate();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Refs
  const inputRef = useRef<TextInput>(null);
  const animation = useRef(new Animated.Value(0)).current;
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // States
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
  });
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [trendingArtists, setTrendingArtists] = useState([]);

  // Animation value
  const containerBackgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDark ? "#000" : "#fff",
      isDark ? "#121212" : "#f5f5f5",
    ],
  });

  // ============================================
  // LOAD INITIAL DATA
  // ============================================
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
      // Có thể call API để lấy trending artists
      // Hoặc dùng data có sẵn
      // const response = await GetArtistsForYou({ artistNames: [], genres: ['POP', 'HIP-HOP'] });
      // setTrendingArtists(response.data);
    } catch (error) {
      console.error("Failed to load trending artists:", error);
    }
  };

  // ============================================
  // SEARCH HANDLERS
  // ============================================

  const handleSearchSubmit = async (query = searchText) => {
    if (!query.trim()) return;

    setSearchText(query);
    setIsSearching(true);
    setLoading(true);
    Keyboard.dismiss();

    try {
      // Save to search history
      await saveToHistory({
        id: Date.now().toString(),
        type: "Query",
        title: query,
        subtitle: `Searched for "${query}"`,
      });

      // Perform search based on active filter
      if (activeFilter === "All") {
        const results = await SearchAll(query, 20);
        setSearchResults({
          tracks: results.tracks || [],
          playlists: results.playlists || [],
          albums: results.albums || [],
          artists: results.artists || [],
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
          const trackRes = await SearchTracks({ trackName: query, limit: 30 });
          results.tracks = trackRes.data || [];
          break;
        case "Playlist":
          const playlistRes = await SearchPlaylists({ name: query });
          results.playlists = playlistRes.data || [];
          break;
        case "Album":
          const albumRes = await SearchAlbums({ name: query });
          results.albums = albumRes.data || [];
          break;
        case "Artist":
          const artistRes = await SearchArtists({ name: query });
          results.artists = artistRes.data || [];
          break;
        case "User":
          const userRes = await SearchUsers(query);
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

  // ============================================
  // SUGGESTIONS
  // ============================================

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
          subtitle: `Search for "${query}"`,
        },
        ...suggestions.map((s, idx) => ({
          id: `suggestion-${idx}`,
          type: "Query",
          title: s,
          subtitle: "Suggested search",
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

  // ============================================
  // HISTORY MANAGEMENT
  // ============================================

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
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  };

  // ============================================
  // NAVIGATION HANDLERS
  // ============================================

  const handleItemPress = useCallback((item: any) => {
    const itemType = item.type || "Track";

    switch (itemType) {
      case "Track":
        navigate("SongScreen", { track: JSON.stringify(item) });
        break;
      case "Playlist":
        navigate("PlaylistScreen", { playlist: JSON.stringify(item) });
        break;
      case "Album":
        navigate("AlbumScreen", { album: JSON.stringify(item) });
        break;
      case "Artist":
        navigate("ArtistScreen", { artist: JSON.stringify(item) });
        break;
      case "User":
        navigate("ProfileSocialScreen", { user: JSON.stringify(item) });
        break;
      default:
        console.log("Unknown item type:", itemType);
    }
  }, [navigate]);

  // ============================================
  // UI HANDLERS
  // ============================================

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

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const renderSearchItem = ({ item, isSuggestion = false }) => {
    let iconName = "musical-notes";
    if (item.type === "Album") iconName = "disc";
    else if (item.type === "Artist") iconName = "person";
    else if (item.type === "Playlist") iconName = "list";
    else if (item.type === "User") iconName = "people-circle";
    else if (item.type === "Query") iconName = "time";

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
        <TouchableOpacity onPress={() => setSearchText(item.title)}>
          <Icon name="arrow-up-left" size={20} color={isDark ? "#888" : "#777"} />
        </TouchableOpacity>
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
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={{
              width: 50,
              height: 50,
              borderRadius: itemType === "Artist" || itemType === "User" ? 25 : 4,
            }}
          />
        ) : (
          <View
            className={`w-12 h-12 rounded-${itemType === "Artist" || itemType === "User" ? "full" : "sm"
              } items-center justify-center ${isDark ? "bg-gray-700" : "bg-gray-300"}`}
          >
            <Icon name={iconName} size={24} color={isDark ? "#fff" : "#000"} />
          </View>
        )}
        <View className="ml-3 flex-1">
          <Text
            className={`text-${isDark ? "white" : "black"} font-semibold text-base`}
            numberOfLines={1}
          >
            {item.name || item.title}
          </Text>
          <Text
            className={`text-${isDark ? "gray-400" : "gray-600"} text-xs`}
            numberOfLines={1}
          >
            {itemType} • {item.subtitle || item.artists?.[0]?.name || ""}
          </Text>
        </View>
        <Icon name="chevron-forward" size={20} color={isDark ? "#888" : "#777"} />
      </TouchableOpacity>
    );
  };

  // Flatten results for filtered view
  const flattenedResults = useMemo(() => {
    if (activeFilter === "All") {
      return [
        ...searchResults.tracks.map(t => ({ ...t, type: "Track" })),
        ...searchResults.playlists.map(p => ({ ...p, type: "Playlist" })),
        ...searchResults.albums.map(a => ({ ...a, type: "Album" })),
        ...searchResults.artists.map(a => ({ ...a, type: "Artist" })),
        // ...searchResults.users.map(u => ({ ...u, type: "User" })),
      ];
    } else {
      const key = activeFilter.toLowerCase() + "s";
      return (searchResults[key] || []).map(item => ({ ...item, type: activeFilter }));
    }
  }, [searchResults, activeFilter]);

  const resultCount = flattenedResults.length;

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <Animated.View
      className="flex-1 pt-3"
      style={{ backgroundColor: containerBackgroundColor }}
    >
      <SafeAreaView className="flex-1">
        {/* Search Bar */}
        <View
          className={`flex-row ${isDark ? "bg-gray-800" : "bg-white"
            } mx-3 rounded-xl px-3 items-center shadow-lg ${isDark
              ? "shadow-black/30"
              : "shadow-gray-300/30 border border-gray-200"
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
            className={`flex-1 ${isDark ? "text-white" : "text-black"} text-base h-full mx-2`}
            placeholder="Search songs, artist, album or playlist"
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

        {/* Content */}
        <View className="flex-1">
          {isFocused && !isSearching ? (
            /* Suggestions/History View */
            <View className="mt-5 mx-3 flex-1">
              <Text
                className={`text-${isDark ? "white" : "black"} font-bold text-lg mb-3`}
              >
                {searchText.length > 0 ? "Search Suggestions" : "Recent searches"}
              </Text>

              {suggestionsLoading && searchText.length > 0 ? (
                <ActivityIndicator size="small" color={ACTIVE_COLOR} />
              ) : (
                <FlatList
                  data={searchText.length > 0 ? querySuggestions : recentSearches}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  renderItem={renderSearchItem}
                  ListFooterComponent={
                    recentSearches.length > 0 && !searchText ? (
                      <CustomButton
                        title="Clear history"
                        onPress={clearHistory}
                        variant="outline"
                        className="mt-5 items-start px-0"
                      />
                    ) : null
                  }
                />
              )}
            </View>
          ) : isSearching ? (
            /* Search Results View */
            <View className="mt-5">
              {/* Filters */}
              <FlatList
                data={filterTypes}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12, marginBottom: 15 }}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleFilterChange(item)}
                    className={`rounded-full px-4 py-2 mr-2 ${item === activeFilter
                      ? "bg-green-500"
                      : isDark
                        ? "bg-gray-700"
                        : "bg-gray-200"
                      }`}
                  >
                    <Text
                      className={`${item === activeFilter
                        ? "text-white"
                        : isDark
                          ? "text-white"
                          : "text-black"
                        } font-semibold text-xs`}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />

              {/* Results Title */}
              <Text
                className={`text-${isDark ? "white" : "black"} font-bold text-lg mx-3 mb-3`}
              >
                {activeFilter === "All" ? "All Results" : `${activeFilter} Results`} for "
                {searchText}" ({resultCount})
              </Text>

              {/* Results List */}
              {loading ? (
                <View className="flex-1 items-center justify-center pt-10">
                  <ActivityIndicator size="large" color={ACTIVE_COLOR} />
                </View>
              ) : resultCount > 0 ? (
                <FlatList
                  data={flattenedResults}
                  keyExtractor={(item, idx) => `${item.id || item.spotifyId}-${idx}`}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 50 }}
                  renderItem={renderResultItem}
                  ItemSeparatorComponent={() => (
                    <View
                      className={`h-px mx-3 my-1 ${isDark ? "bg-gray-800" : "bg-gray-100"
                        }`}
                    />
                  )}
                />
              ) : (
                <View className="flex-1 items-center justify-start pt-10">
                  <Text
                    className={`text-${isDark ? "gray-400" : "gray-600"} text-center`}
                  >
                    No results found for "{searchText}" in {activeFilter}.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            /* Default View - Trending Artists & Categories */
            <View className="mt-5">
              <Text
                className={`text-${isDark ? "white" : "black"} font-bold text-lg ml-3 mb-3`}
              >
                Trending artists
              </Text>
              <FlatList
                data={trendingArtists}
                horizontal
                keyExtractor={(item) => item.spotifyId || item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 12,
                  marginBottom: 20,
                }}
                renderItem={({ item }) => (
                  <ArtistItem
                    name={item.name}
                    image={item.imageUrl}
                    onPress={() =>
                      navigate("ArtistScreen", { artist: JSON.stringify(item) })
                    }
                  />
                )}
              />

              {/* Browse Categories */}
              <Text
                className={`text-${isDark ? "white" : "black"} font-bold text-lg ml-3 mb-3`}
              >
                Browse All
              </Text>
              <FlatList
                data={browseCategories}
                numColumns={2}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 50 }}
                renderItem={({ item }) => (
                  <CategoryItem
                    name={item.name}
                    color={item.color}
                    icon={item.icon}
                    onPress={() =>
                      navigate("CategoryScreen", { category: item.name })
                    }
                  />
                )}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}