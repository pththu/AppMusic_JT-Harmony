import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Pressable, useColorScheme } from "react-native";
import { useSegments } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@/components/ThemeContext";
import { useNavigate } from "@/hooks/useNavigate";
import { usePlayerStore } from "@/store/playerStore";
import TextTicker from "react-native-text-ticker";

const MINI_PLAYER_HEIGHT = 60;

export { MINI_PLAYER_HEIGHT };

export default function MiniPlayer() {
  const segments = useSegments();
  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);
  const tabBarHeight = usePlayerStore((state) => state.tabBarHeight);
  const setMiniPlayerVisible = usePlayerStore((state) => state.setMiniPlayerVisible);
  // không hiển thị ở auth và song screen
  const isAuthScreen = segments[0] === "(auth)";
  const isSongScreen = segments[1] === "SongScreen";
  const isQueueScreen = segments[1] === "QueueScreen";
  const isTabScreen = segments[0] === "(tabs)";

  const isVisible = !!currentTrack && !isAuthScreen && !isSongScreen && !isQueueScreen;

  useEffect(() => {
    setMiniPlayerVisible(isVisible);
    return () => {
      if (!isVisible) {
        setMiniPlayerVisible(false);
      }
    }
  }, [isVisible, setMiniPlayerVisible]); // <-- THÊM HOOK NÀY

  if (!isVisible) { // <-- SỬA DÒNG NÀY
    return null;
  }

  return (
    <Pressable
      style={{ height: MINI_PLAYER_HEIGHT, bottom: isTabScreen === true ? tabBarHeight : 0 }}
      className={`absolute left-0 right-0 border-t ${colorScheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-green-400 border-gray-200'} `}
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
          <TextTicker
            style={{
              color: colorScheme === 'dark' ? 'white' : 'black',
              fontSize: 14,
              fontWeight: 'bold'
            }}
            duration={10000}
            loop
            bounce={false}
            repeatSpacer={50}
            marqueeDelay={500}
          >
            {currentTrack.name}
          </TextTicker>
          <Text className={`${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
            {currentTrack?.artists?.map(artist => artist.name).join(", ")}
          </Text>
        </View>

        <TouchableOpacity onPress={playPrevious} className="p-2 ml-2">
          <Icon name="play-skip-back" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePlayPause} className="p-2">
          <Icon
            name={isPlaying ? "pause" : "play"}
            size={28}
            color={colorScheme === 'dark' ? 'white' : 'black'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={playNext} className="p-2 ml-2">
          <Icon name="play-skip-forward" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}