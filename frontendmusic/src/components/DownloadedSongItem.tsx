import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

interface DownloadedSongItemProps {
  title: string;
  artist: string;
  image: string;
  onPress?: () => void;
  onOptionsPress?: () => void;
}

export default function DownloadedSongItem({
  title,
  artist,
  image,
  onPress,
  onOptionsPress,
}: DownloadedSongItemProps) {
  return (
    <TouchableOpacity className="flex-row items-center p-2" onPress={onPress}>
      <Image source={{ uri: image }} className="w-12 h-12 rounded-md" />
      <View className="ml-4 flex-1">
        <Text className="text-white font-semibold">{title}</Text>
        <Text className="text-gray-400">{artist}</Text>
      </View>
      <TouchableOpacity onPress={onOptionsPress}>
        <Text className="text-gray-400 text-2xl">⋮</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
