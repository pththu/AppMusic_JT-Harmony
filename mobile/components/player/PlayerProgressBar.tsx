// components/player/PlayerProgressBar.tsx (Tệp mới)
import React, { useEffect, useState } from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { usePlayerStore } from '@/store/playerStore';

// Hàm formatTime (copy từ SongScreen)
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export default function PlayerProgressBar() {
  const colorScheme = useColorScheme();
  const [progress, setProgress] = useState(0);

  // *** ĐIỀU QUAN TRỌNG NHẤT ***
  // Chỉ component này lắng nghe 'playbackPosition' và 'duration'
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const playbackPosition = usePlayerStore((state) => state.playbackPosition);
  const duration = usePlayerStore((state) => state.duration);
  const [durationTrack, setDurationTrack] = useState(duration || currentTrack?.duration/1000 || 0);

  useEffect(() => {
    if (durationTrack > 0) {
      const percentage = (playbackPosition / durationTrack) * 100;
      setProgress(percentage);
    } else {
      setProgress(0);
    }
  }, [playbackPosition, durationTrack]);

  return (
    <View className="flex-row items-center px-3 mb-3">
      <Text className={`${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs w-8 text-center`}>
        {formatTime(playbackPosition)}
      </Text>
      <View className={`flex-1 h-1 ${colorScheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-sm mx-2`}>
        <View
          className={`h-1 ${colorScheme === 'dark' ? 'bg-green-700' : 'bg-green-500'} rounded-sm`}
          style={{ width: `${progress}%` }}
        />
      </View>
      <Text className={`${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-800'} text-xs w-8 text-center`}>
        {formatTime(durationTrack)}
      </Text>
    </View>
  );
}