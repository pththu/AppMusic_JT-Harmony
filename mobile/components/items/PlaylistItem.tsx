import { usePlayerStore } from '@/store/playerStore';
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';


export default function PlaylistItem({ item, totalTrack, onPress = () => { }, onOptionsPress = () => { } }) {

  const colorScheme = useColorScheme();

  const formatTitle = (title: string) => {
    const maxLength = 20;
    if (title.length > maxLength) {
      return title.substring(0, maxLength - 3) + '...';
    }
    return title;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mr-4"
    >
      <Image source={{ uri: item?.imageUrl }} className="w-32 h-32 rounded-lg" />
      <Text className={`mt-2 text-sm text-wrap font-bold ${colorScheme === "dark" ? "text-white" : "text-black"}`}>{formatTitle(item?.name)}</Text>
      <Text className="text-gray-400 text-sm">{totalTrack || '..'} bài hát</Text>
    </TouchableOpacity>
  );
}
