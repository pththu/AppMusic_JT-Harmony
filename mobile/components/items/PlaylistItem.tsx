import { usePlayerStore } from '@/store/playerStore';
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';


export default function PlaylistItem({ title, type, songs, image, onPress = () => { }, onOptionsPress = () => { } }) {

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
      className="items-start py-3 active:opacity-75 mr-4"
    >
      <Image
        source={{ uri: image }}
        className="w-32 h-32 rounded-md shadow-md"
      />
      <View className="flex-1 justify-center">
        <Text className="text-white text-base font-semibold">{formatTitle(title)}</Text>
        {/* <Text className="text-gray-400 text-sm">
          {songs} bài hát
        </Text> */}
      </View>
    </TouchableOpacity>
  );
}
