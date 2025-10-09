import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialIcons";

import LyricsSection from "@/components/LyricsSection";
import ArtistsSection from "@/components/artists/ArtistsSection";
import { useNavigate } from "@/hooks/useNavigate";
import { usePlayerStore } from "@/store/playerStore";
import { useQueueStore } from "@/store/queueStore";
import { router } from "expo-router";
import { useTheme } from "@/components/ThemeContext";

// Định nghĩa kiểu dữ liệu cho bài hát và nghệ sĩ ở đây để sử dụng trong file này
interface Artist {
  name: string;
  image: string;
}

interface Song {
  id: string;
  title: string;
  artists: Artist[];
  image: string;
  album?: string;
  itag?: string;
  mimeType?: string;
  bitrate?: string;
  youtubeUrl?: string;
  downloadUrl?: string;
}

const screenWidth = Dimensions.get("window").width;

const upNextSongs = [
  {
    id: "2",
    title: "Young",
    artists: [
      {
        name: "The Chainsmokers",
        image:
          "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      },
    ],
    image:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    album: "Memories...Do Not Open",
    itag: "251",
    mimeType: 'audio/webm; codecs="opus"',
    bitrate: "160 kbps",
    youtubeUrl: "https://www.youtube.com/watch?v=k_y9iN9k3yA",
    downloadUrl: "https://example.com/download/young.mp3",
  },
  {
    id: "3",
    title: "Beach House",
    artists: [
      {
        name: "Chainsmokers - Sick",
        image:
          "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      },
    ],
    image:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    album: "Sick Boy",
    itag: "251",
    mimeType: 'audio/webm; codecs="opus"',
    bitrate: "160 kbps",
    youtubeUrl: "https://www.youtube.com/watch?v=k_y9iN9k3yA",
    downloadUrl: "https://example.com/download/beachhouse.mp3",
  },
  {
    id: "4",
    title: "Kills You Slowly",
    artists: [
      {
        name: "The Chainsmokers - World",
        image:
          "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      },
    ],
    image:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    album: "World War Joy",
    itag: "251",
    mimeType: 'audio/webm; codecs="opus"',
    bitrate: "160 kbps",
    youtubeUrl: "https://www.youtube.com/watch?v=k_y9iN9k3yA",
    downloadUrl: "https://example.com/download/killsyouslowly.mp3",
  },
];

// type SongScreenRouteProp = RouteProp<YourLibraryStackParamList, 'SongScreen'>;
// type SongScreenNavigationProp = NavigationProp<
//   YourLibraryStackParamList,
//   'SongScreen'
// >;

// type Props = {
//   route: SongScreenRouteProp;
//   navigation: SongScreenNavigationProp;
// };

export default function SongScreen() {
  // const params = useLocalSearchParams();
  // const song = JSON.parse(params.song as string);
  const song = usePlayerStore().currentSong;

  const [isPlaying, setIsPlaying] = useState(false);
  const { navigate } = useNavigate();
  const { theme } = useTheme(); // Ensure component re-renders on theme change

  // Dynamic icon colors based on theme
  const primaryIconColor = theme === 'dark' ? 'white' : 'black';
  const secondaryIconColor = theme === 'dark' ? '#888' : 'gray';

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSelectQueue = () => {
    const { setNowPlaying, setQueue } = useQueueStore.getState();
    setNowPlaying(song);
    setQueue(upNextSongs);
    navigate("QueueScreen");
  };

  const handleSelectInfo = (song: Song) => {
    navigate("SongInfoScreen", { song: JSON.stringify(song) });
  };

  const renderUpNextItem = ({ item }: { item: Song }) => (
    <View className="flex-row items-center py-2 border-b border-gray-300 dark:border-gray-700">
      <Image source={{ uri: item.image }} className="w-12 h-12 rounded-md" />
      <View className="flex-1 ml-3">
        <Text className="text-black dark:text-white font-bold text-base">{item.title}</Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm">
          {item.artists?.map((a) => a.name).join(", ")}
        </Text>
      </View>
      <TouchableOpacity>
        <Icon name="more-vert" size={24} color={secondaryIconColor} />
      </TouchableOpacity>
    </View>
  );

  const ListHeader = () => (
    <View>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="chevron-down" size={28} color={primaryIconColor} />
      </TouchableOpacity>
      <View className="flex-1 items-center">
        <Text className="text-black dark:text-gray-400 text-sm">Now playing</Text>
        <Text className="text-black dark:text-white text-base font-semibold">
          {song.title}
        </Text>
      </View>
        {/* <TouchableOpacity>
          <Icon name="more-vert" size={28} color="white" />
        </TouchableOpacity> */}
      </View>

      {/* Album Art */}
      <View className="items-center mb-4">
        <View className="relative">
          <Image
            source={{ uri: song.image }}
            style={{ width: screenWidth - 32, height: screenWidth - 32 }}
            className="rounded-xl"
            resizeMode="cover"
            onError={(e) => {
              console.log("Image load error:", e.nativeEvent.error);
            }}
          />
          <View className="absolute inset-0 justify-center pb-6 items-center bg-opacity-50 rounded-xl px-4">
            <Text className="text-black dark:text-white text-3xl font-bold mb-2 text-center">
              {song.title}
            </Text>
            <Text className="text-gray-500 dark:text-gray-300 text-lg mb-1 text-center">
              {song.artists?.map((a) => a.name).join(", ")}
            </Text>
          </View>
        </View>
      </View>

      {/* Song Info and Action Buttons */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-black dark:text-white text-2xl font-bold">{song.title}</Text>
          <Text className="text-gray-600 dark:text-gray-400 text-base">
            {song.artists?.map((a) => a.name).join(", ")}
          </Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity
            className="mr-4"
            onPress={() => handleSelectInfo(song)}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={primaryIconColor}
            />
          </TouchableOpacity>
          <TouchableOpacity className="mr-4">
            <Icon name="favorite-border" size={24} color={primaryIconColor} />
          </TouchableOpacity>
          <TouchableOpacity className="mr-4">
            <Icon name="download" size={24} color={primaryIconColor} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="share" size={24} color={primaryIconColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row justify-between items-center mb-3 px-6">
        <TouchableOpacity>
          <Icon name="shuffle" size={24} color={secondaryIconColor} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="skip-previous" size={30} color={primaryIconColor} />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white rounded-full p-2 shadow-lg"
          onPress={togglePlayPause}
        >
          <Icon
            name={isPlaying ? "pause" : "play-arrow"}
            size={40}
            color={primaryIconColor}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="skip-next" size={30} color={primaryIconColor} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="repeat" size={24} color={secondaryIconColor} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="flex-row items-center px-3 mb-3">
        <Text className="text-gray-600 dark:text-gray-400 text-xs w-8 text-center">0:25</Text>
        <View className="flex-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-sm mx-2">
          <View className="w-1/3 h-1 bg-black dark:bg-white rounded-sm" />
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-xs w-8 text-center">3:15</Text>
      </View>

      {/* Up Next Header */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-black dark:text-white text-lg font-bold">Up Next</Text>
        <TouchableOpacity onPress={() => handleSelectQueue()}>
          <Text className="text-gray-600 dark:text-gray-400 text-base">Queue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListFooter = () => (
    <View>
      <LyricsSection />
      <ArtistsSection artists={song.artists} />
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-[#0E0C1F] px-4 pt-4">
      <FlatList
        data={upNextSongs}
        renderItem={renderUpNextItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      />
    </View>
  );
}
