// components/player/PlayerProgressBar.tsx (Tệp mới)
import { usePlayerStore } from '@/store/playerStore';
import React, { useEffect, useState } from 'react';
import { Text, useColorScheme, View } from 'react-native';

// Hàm formatTime (copy từ SongScreen)
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const PlayerProgressBar = () => {
  const colorScheme = useColorScheme();
  const [progress, setProgress] = useState(0);

  // *** ĐIỀU QUAN TRỌNG NHẤT ***
  // Chỉ component này lắng nghe 'playbackPosition' và 'duration'
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const playbackPosition = usePlayerStore((state) => state.playbackPosition);
  const duration = usePlayerStore((state) => state.duration);
  const [durationTrack, setDurationTrack] = useState(duration / 1000 || currentTrack?.duration / 1000 || 0);

  useEffect(() => {
    if (durationTrack > 0) {
      const percentage = (playbackPosition / (durationTrack < 10 ? durationTrack * 1000 : durationTrack)) * 100;
      setProgress(Math.min(percentage, 100));
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
        {formatTime(durationTrack > 10 ? durationTrack : currentTrack?.duration / 1000 || 0)}
      </Text>
    </View>
  );
}

export default React.memo(PlayerProgressBar);