// import React, { useEffect, useState, useMemo } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   useColorScheme,
//   ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useNavigate } from "@/hooks/useNavigate";
// import Icon from "react-native-vector-icons/Ionicons";
// import ArtistItem from "@/components/artists/ArtistItem"; // Tái sử dụng component của bạn

// // --- MOCK DATA (Mô phỏng thư viện nhạc theo Genre) ---
// // Dữ liệu này nên được tách ra file constants, nhưng để demo, tôi đặt ở đây.
// // Chúng ta thêm 'genre' hoặc 'genres' vào dữ liệu.
// const mockLibrary = {
//   playlists: [
//     {
//       id: "p_pop_1",
//       type: "Playlist",
//       title: "Pop Hits",
//       subtitle: "Today's biggest pop songs",
//       imageUrl: "https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg",
//       genre: "POP",
//     },
//     {
//       id: "p_hiphop_1",
//       type: "Playlist",
//       title: "RapCaviar",
//       subtitle: "The hottest hip-hop",
//       imageUrl: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg",
//       genre: "HIP-HOP",
//     },
//     {
//       id: "p_pop_2",
//       type: "Playlist",
//       title: "Pop Rising",
//       subtitle: "The stars of tomorrow",
//       imageUrl: "https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg",
//       genre: "POP",
//     },
//     {
//       id: "p_indie_1",
//       type: "Playlist",
//       title: "Indie Vibes",
//       subtitle: "All indie, all day",
//       imageUrl: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg",
//       genre: "INDIE",
//     },
//     {
//       id: "p_tamil_1",
//       type: "Playlist",
//       title: "Tamil Hot Hits",
//       subtitle: "Latest Tamil chartbusters",
//       imageUrl: "https://images.pexels.com/photos/2111015/pexels-photo-2111015.jpeg",
//       genre: "TAMIL",
//     },
//   ],
//   artists: [
//     {
//       id: "a_bieber",
//       type: "Artist",
//       name: "Justin Bieber",
//       imageUrl: "https://images.pexels.com/photos/226460/pexels-photo-226460.jpeg",
//       genres: ["POP", "INTERNATIONAL"],
//       spotifyId: "1", // Thêm ID để khớp ArtistItem
//     },
//     {
//       id: "a_kanye",
//       type: "Artist",
//       name: "Kanye West",
//       imageUrl: "https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg",
//       genres: ["HIP-HOP"],
//       spotifyId: "2",
//     },
//     {
//       id: "a_gambino",
//       type: "Artist",
//       name: "Childish Gambino",
//       imageUrl: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg",
//       genres: ["HIP-HOP", "INDIE", "POP"],
//       spotifyId: "3",
//     },
//     {
//       id: "a_tamil_1",
//       type: "Artist",
//       name: "Anirudh Ravichander",
//       imageUrl: "https://images.pexels.com/photos/1738675/pexels-photo-1738675.jpeg",
//       genres: ["TAMIL"],
//       spotifyId: "4",
//     },
//   ],
//   tracks: [
//     {
//       id: "t_bieber_1",
//       type: "Track",
//       title: "Peaches",
//       subtitle: "Justin Bieber",
//       imageUrl: "https://images.pexels.com/photos/226460/pexels-photo-226460.jpeg",
//       genre: "POP",
//     },
//     {
//       id: "t_kanye_1",
//       type: "Track",
//       title: "Stronger",
//       subtitle: "Kanye West",
//       imageUrl: "https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg",
//       genre: "HIP-HOP",
//     },
//     {
//       id: "t_tamil_1",
//       type: "Track",
//       title: "Arabic Kuthu",
//       subtitle: "Anirudh Ravichander",
//       imageUrl: "https://images.pexels.com/photos/1738675/pexels-photo-1738675.jpeg",
//       genre: "TAMIL",
//     },
//     {
//       id: "t_indie_1",
//       type: "Track",
//       title: "Redbone",
//       subtitle: "Childish Gambino",
//       imageUrl: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg",
//       genre: "INDIE",
//     },
//   ],
// };
// // ----------------------------------------------------

// // Component nội bộ để hiển thị Playlist/Track (vì chúng tương tự nhau)
// const ContentItem = ({ item, onPress }) => {
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === "dark";

//   return (
//     <TouchableOpacity onPress={onPress} className="w-36 mr-4">
//       <Image
//         source={{ uri: item.imageUrl || "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg" }}
//         className="w-36 h-36 rounded-lg"
//       />
//       <Text className={`mt-2 font-semibold ${isDark ? "text-white" : "text-black"}`} numberOfLines={1}>
//         {item.title}
//       </Text>
//       <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`} numberOfLines={1}>
//         {item.subtitle}
//       </Text>
//     </TouchableOpacity>
//   );
// };

// // Component nội bộ cho một Section (Tiêu đề + List ngang)
// const ContentSection = ({ title, data, renderItem, keyExtractor }) => {
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === "dark";

//   if (data.length === 0) {
//     return null; // Ẩn section nếu không có dữ liệu
//   }

//   return (
//     <View className="mb-6">
//       <Text className={`font-bold text-xl ml-3 mb-3 ${isDark ? "text-white" : "text-black"}`}>
//         {title}
//       </Text>
//       <FlatList
//         data={data}
//         renderItem={renderItem}
//         keyExtractor={keyExtractor}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ paddingHorizontal: 12 }}
//       />
//     </View>
//   );
// };

// export default function CategoryScreen() {
//   const router = useRouter();
//   const { navigate } = useNavigate();
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === "dark";
//   // Lấy param 'category' từ navigate
//   const { category } = useLocalSearchParams<{ category: string }>();

//   const [playlists, setPlaylists] = useState([]);
//   const [artists, setArtists] = useState([]);
//   const [tracks, setTracks] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Chuẩn hóa tên category để filter
//   const categoryName = useMemo(() => (category || "").toUpperCase(), [category]);

//   // Mô phỏng việc fetch dữ liệu khi màn hình được tải
//   useEffect(() => {
//     setLoading(true);

//     // Mô phỏng API call
//     const fetchCategoryData = () => {
//       if (!categoryName) {
//         setLoading(false);
//         return;
//       }

//       const filteredPlaylists = mockLibrary.playlists.filter(
//         (p) => p.genre === categoryName
//       );
//       const filteredArtists = mockLibrary.artists.filter((a) =>
//         a.genres.includes(categoryName)
//       );
//       const filteredTracks = mockLibrary.tracks.filter(
//         (t) => t.genre === categoryName
//       );

//       setPlaylists(filteredPlaylists);
//       setArtists(filteredArtists);
//       setTracks(filteredTracks);
//       setLoading(false);
//     };

//     // Thêm delay nhỏ để mô phỏng loading
//     const timer = setTimeout(fetchCategoryData, 300);
//     return () => clearTimeout(timer);
//   }, [categoryName]);

//   // --- Handlers (Giống SearchScreen) ---
//   const handlePlaylistPress = (item) => {
//     navigate("PlaylistScreen", { playlist: JSON.stringify(item) });
//   };
//   const handleArtistPress = (item) => {
//     navigate("ArtistScreen", { artist: JSON.stringify(item) });
//   };
//   const handleTrackPress = (item) => {
//     navigate("SongScreen", { track: JSON.stringify(item) });
//   };

//   const renderEmptyState = () => (
//     <View className="flex-1 items-center justify-center">
//       <Text className={isDark ? "text-gray-400" : "text-gray-600"}>
//         No content found for "{category}".
//       </Text>
//     </View>
//   );

//   const renderLoading = () => (
//     <View className="flex-1 items-center justify-center">
//       <ActivityIndicator size="large" color={isDark ? "#FFF" : "#000"} />
//     </View>
//   );

//   return (
//     <SafeAreaView className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}>
//       {/* Header */}
//       <View className="flex-row items-center justify-between px-3 py-2">
//         <TouchableOpacity onPress={() => router.back()} className="p-2">
//           <Icon name="arrow-back" size={24} color={isDark ? "#FFF" : "#000"} />
//         </TouchableOpacity>
//         <Text
//           className={`text-xl font-bold ${isDark ? "text-white" : "text-black"}`}
//         >
//           {category}
//         </Text>
//         <View className="w-10" />
//       </View>

//       {loading ? (
//         renderLoading()
//       ) : (
//         <ScrollView contentContainerStyle={{ paddingTop: 10, paddingBottom: 50 }}>
//           {/* Section 1: Playlists */}
//           <ContentSection
//             title="Featured Playlists"
//             data={playlists}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <ContentItem item={item} onPress={() => handlePlaylistPress(item)} />
//             )}
//           />

//           {/* Section 2: Artists */}
//           <ContentSection
//             title="Popular Artists"
//             data={artists}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <ArtistItem
//                 name={item.name}
//                 image={item.imageUrl}
//                 onPress={() => handleArtistPress(item)}
//               />
//             )}
//           />

//           {/* Section 3: Tracks */}
//           <ContentSection
//             title="Popular Tracks"
//             data={tracks}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <ContentItem item={item} onPress={() => handleTrackPress(item)} />
//             )}
//           />

//           {/* Trạng thái rỗng nếu không có section nào được render */}
//           {!loading &&
//             playlists.length === 0 &&
//             artists.length === 0 &&
//             tracks.length === 0 &&
//             renderEmptyState()}
//         </ScrollView>
//       )}
//     </SafeAreaView>
//   );
// }

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useNavigate } from "@/hooks/useNavigate";
import Icon from "react-native-vector-icons/Ionicons";
import ArtistItem from "@/components/artists/ArtistItem";
import { GetCategoryContent } from "@/services/musicService";
import { useCustomAlert } from "@/hooks/useCustomAlert";

// Component hiển thị Playlist/Track
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

// Component hiển thị Section
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
  const { navigate } = useNavigate();
  const { info } = useCustomAlert();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Lấy param 'category' từ navigate
  const { category } = useLocalSearchParams<{ category: string }>();
  console.log(category)

  // States
  const [categoryData, setCategoryData] = useState({
    genre: null,
    playlists: [],
    artists: [],
    tracks: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch category data khi component mount
  useEffect(() => {
    if (!category) {
      setError("No category specified");
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
        // setCategoryData(response.data);
        info("Category data fetched successfully (mock)");
      } else {
        setError(response.message || "Failed to load category content");
      }
    } catch (err: any) {
      console.error("Error fetching category data:", err);
      setError(err.message || "An error occurred while loading content");
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handlePlaylistPress = (item) => {
    navigate("PlaylistScreen", { playlist: JSON.stringify(item) });
  };

  const handleArtistPress = (item) => {
    navigate("ArtistScreen", { artist: JSON.stringify(item) });
  };

  const handleTrackPress = (item) => {
    navigate("SongScreen", { track: JSON.stringify(item) });
  };

  // Render states
  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={isDark ? "#FFF" : "#000"} />
      <Text
        className={`mt-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        Loading {category}...
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
        <Text className="text-white font-semibold">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <Icon name="musical-notes-outline" size={64} color={isDark ? "#888" : "#666"} />
      <Text
        className={`mt-4 text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        No content found for "{category}".
      </Text>
    </View>
  );

  const hasContent =
    categoryData.playlists.length > 0 ||
    categoryData.artists.length > 0 ||
    categoryData.tracks.length > 0;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-3 py-2">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Icon name="arrow-back" size={24} color={isDark ? "#FFF" : "#000"} />
        </TouchableOpacity>
        <Text
          className={`text-xl font-bold ${isDark ? "text-white" : "text-black"}`}
        >
          {category}
        </Text>
        <View className="w-10" />
      </View>

      {/* Content */}
      {loading ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : !hasContent ? (
        renderEmptyState()
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Featured Playlists */}
          <ContentSection
            title="Featured Playlists"
            data={categoryData.playlists}
            keyExtractor={(item) => item.id || item.spotifyId}
            renderItem={({ item }) => (
              <ContentItem
                item={item}
                onPress={() => handlePlaylistPress(item)}
              />
            )}
          />

          {/* Popular Artists */}
          <ContentSection
            title="Popular Artists"
            data={categoryData.artists}
            keyExtractor={(item) => item.id || item.spotifyId}
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
            title="Popular Tracks"
            data={categoryData.tracks}
            keyExtractor={(item) => item.id || item.spotifyId}
            renderItem={({ item }) => (
              <ContentItem
                item={item}
                onPress={() => handleTrackPress(item)}
              />
            )}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}