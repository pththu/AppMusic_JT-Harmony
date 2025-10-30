import React, { useCallback, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
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
import { albumData, trackData } from "@/constants/data";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

export default function SongScreen() {

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);

  console.log('song', currentTrack)

  const { navigate } = useNavigate();
  const { theme } = useTheme();
  const colorScheme = useColorScheme();
  const setNowPlaying = useQueueStore((state) => state.setNowPlaying);
  const setQueue = useQueueStore((state) => state.setQueue);

  const primaryIconColor = theme === 'dark' ? 'white' : 'black';
  const secondaryIconColor = theme === 'dark' ? '#888' : 'gray';

  const handleSelectQueue = () => {
    setNowPlaying(currentTrack);
    if (!currentTrack) return;
    setQueue(trackData.filter((s) => s.spotifyId !== currentTrack.spotifyId));
    navigate("QueueScreen");
  };

  const handleSelectInfo = (track) => {
    navigate("SongInfoScreen", { track: JSON.stringify(track) });
  };

  const renderUpNextItem = ({ item }) => (
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
            {currentTrack.name}
          </Text>
        </View>
      </View>

      {/* Album Art */}
      <View className="items-center mb-4">
        <View className="relative">
          <Image
            source={{ uri: currentTrack.imageUrl || albumData.find(album => album.name === currentTrack.album)?.imageUrl || '' }}
            style={{ width: screenWidth - 32, height: screenWidth - 32 }}
            className="rounded-xl"
            resizeMode="cover"
            onError={(e) => {
              console.log("Image load error:", e.nativeEvent.error);
            }}
          />
          <View className="absolute inset-0 justify-center pb-6 items-center bg-opacity-50 rounded-xl px-4">
            <Text className="text-black dark:text-white text-3xl font-bold mb-2 text-center">
              {currentTrack.name}
            </Text>
            <Text className="text-gray-500 dark:text-gray-300 text-lg mb-1 text-center">
              {currentTrack.artists?.map((a) => a.name).join(", ")}
            </Text>
          </View>
        </View>
      </View>

      {/* Song Info and Action Buttons */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-black dark:text-white text-2xl font-bold">{currentTrack.name}</Text>
          <Text className="text-gray-600 dark:text-gray-400 text-base">
            {currentTrack.artists?.map((a) => a.name).join(", ")}
          </Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity
            className="mr-4"
            onPress={() => handleSelectInfo(currentTrack)}
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
        <TouchableOpacity onPress={playPrevious}>
          <Icon name="skip-previous" size={30} color={primaryIconColor} />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white rounded-full p-2 shadow-lg"
          onPress={togglePlayPause}
        >
          <Icon
            name={isPlaying ? "pause" : "play-arrow"}
            size={40}
            color={`${colorScheme === 'dark' ? 'black' : 'white'}`}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={playNext}>
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
      <ArtistsSection artists={currentTrack.artists} />
    </View>
  );

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 bg-white dark:bg-[#0E0C1F] px-4 pt-4">
        <ListHeader />
        {
          trackData.filter((s) => s.spotifyId !== currentTrack.spotifyId).slice(0, 5).map((item, index) => (
            <View key={index.toString().concat(item.spotifyId)}>
              {renderUpNextItem({ item })}
            </View>
          ))
        }
        <ListFooter />
      </ScrollView>
    </SafeAreaView>
  );
}
