import React, { useCallback, useState } from "react";
import {
  Button,
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
import { useAudioPlayer } from 'expo-audio';
import { albumData, trackData } from "@/constants/data";
// import YoutubePlayer from "react-native-youtube-iframe";

const screenWidth = Dimensions.get("window").width;

export default function SongScreen() {
  const song = usePlayerStore((state) => state.currentSong);

  const [isPlaying, setIsPlaying] = useState(false);
  const { navigate } = useNavigate();
  const { theme } = useTheme();

  const primaryIconColor = theme === 'dark' ? 'white' : 'black';
  const secondaryIconColor = theme === 'dark' ? '#888' : 'gray';

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    console.log('play')
  };

  const handleSelectQueue = () => {
    const { setNowPlaying, setQueue } = useQueueStore.getState();
    setNowPlaying(song);
    setQueue(trackData.filter((s) => s.spotifyId !== song.spotifyId));
    navigate("QueueScreen");
  };

  const handleSelectInfo = (song) => {
    navigate("SongInfoScreen", { song: JSON.stringify(song) });
  };

  const renderUpNextItem = ({ item }: { item }) => (
    <View className="flex-row items-center py-2 border-b border-gray-300 dark:border-gray-700">
      <Image source={{ uri: item.imageUrl || albumData.find(album => album.name === item.album)?.imageUrl || '' }} className="w-12 h-12 rounded-md" />
      <View className="flex-1 ml-3">
        <Text className="text-black dark:text-white font-bold text-base">{item.name}</Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm">
          {item.artists?.map(a => a).join(", ")}
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
          <Text className="text-black dark:text-white text-base font-semibold">
            {song.name}
          </Text>
        </View>
      </View>

      {/* Album Art */}
      <View className="items-center mb-4">
        <View className="relative">
          <Image
            source={{ uri: song.imageUrl || albumData.find(album => album.name === song.album)?.imageUrl || '' }}
            style={{ width: screenWidth - 32, height: screenWidth - 32 }}
            className="rounded-xl"
            resizeMode="cover"
            onError={(e) => {
              console.log("Image load error:", e.nativeEvent.error);
            }}
          />
          <View className="absolute inset-0 justify-center pb-6 items-center bg-opacity-50 rounded-xl px-4">
            <Text className="text-black dark:text-white text-3xl font-bold mb-2 text-center">
              {song.name}
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
          <Text className="text-black dark:text-white text-2xl font-bold">{song.name}</Text>
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
        <Text className="text-black dark:text-white text-lg font-bold">Phát kế tiếp</Text>
        <TouchableOpacity onPress={() => handleSelectQueue()}>
          <Text className="text-gray-600 dark:text-gray-400 text-base">Danh sách chờ</Text>
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
        data={trackData.filter((s) => s.spotifyId !== song.spotifyId).slice(0, 5)}
        renderItem={renderUpNextItem}
        keyExtractor={(item) => item.spotifyId}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      />
    </View>
  );
}
