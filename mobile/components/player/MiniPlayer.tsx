import React from "react";
import { View, Text, TouchableOpacity, Image, Pressable } from "react-native";
import { useSegments } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@/components/ThemeContext";
import { useNavigate } from "@/hooks/useNavigate";
import { usePlayerStore } from "@/store/playerStore";

const MINI_PLAYER_HEIGHT = 60;

export { MINI_PLAYER_HEIGHT };

export default function MiniPlayer() {
  const segments = useSegments();
  const { theme } = useTheme();
  const { navigate } = useNavigate();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const playNext = usePlayerStore((state) => state.playNext);
  const tabBarHeight = usePlayerStore((state) => state.tabBarHeight);

  // không hiển thị ở auth và song screen
  const isAuthScreen = segments[0] === "(auth)";
  const isSongScreen = segments[1] === "SongScreen";

  if (!currentTrack || isAuthScreen || isSongScreen) {
    return null;
  }

  const iconColor = theme === "light" ? "#000" : "#fff";

  return (
    <Pressable
      style={{ height: MINI_PLAYER_HEIGHT, bottom: tabBarHeight || 0 }}
      className="absolute left-0 right-0 bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700"
      onPress={() => {
        navigate('SongScreen');
      }}
    >
      <View className="flex-row items-center justify-between h-full px-4">
        <Image
          source={{ uri: currentTrack.imageUrl || "default_image_url_here" }}
          className="w-10 h-10 rounded"
        />
        <View className="flex-1 mx-3">
          <Text
            className="text-black dark:text-white font-semibold"
            numberOfLines={1}
          >
            {currentTrack.name}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-xs">
            {currentTrack.artists.join(", ")}
          </Text>
        </View>

        <TouchableOpacity onPress={togglePlayPause} className="p-2">
          <Icon
            name={isPlaying ? "pause" : "play"}
            size={28}
            color={iconColor}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={playNext} className="p-2 ml-2">
          <Icon name="play-skip-forward" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}