import { usePlayerStore } from '@/store/playerStore';
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';


export default function PlaylistItem({ title, type, songs, image, onPress = () => { }, onOptionsPress = () => { } }) {

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
      className="items-start py-3 active:opacity-75 mr-4"
    >
      <Image
        source={{ uri: image }}
        className="w-32 h-32 rounded-md shadow-md"
      />
      <View className="flex-1 justify-center">
        <Text className={`text-sm mt-2 font-semibold ${colorScheme === 'dark' ? 'text-gray-400' : 'text-black'}`}>{formatTitle(title)}</Text>
      </View>
    </TouchableOpacity>
  );
}
