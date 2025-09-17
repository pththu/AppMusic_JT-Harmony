import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface PlaylistItemProps {
  title: string;
  type: string;
  songs: number;
  image: string;
  onPress?: () => void;
  onOptionsPress?: () => void;
}

export default function PlaylistItem({
  title,
  type,
  songs,
  image,
  onPress,
  onOptionsPress,
}: PlaylistItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-3 active:opacity-75"
    >
      <Image
        source={{ uri: image }}
        className="w-16 h-16 rounded-md shadow-md"
      />
      <View className="ml-4 flex-1 justify-center">
        <Text className="text-white text-base font-semibold">{title}</Text>
        <Text className="text-gray-400 text-sm">
          {type} • {songs} songs
        </Text>
      </View>
      <TouchableOpacity className="p-2" onPress={onOptionsPress}>
        <Icon name="ellipsis-horizontal" size={24} color="#888" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
