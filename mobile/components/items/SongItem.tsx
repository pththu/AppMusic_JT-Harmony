import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function SongItem({ item, image, onPress, onOptionsPress }) {

  const artistName = item?.artists?.map(a => a.name).join(', ');
  return (
    <TouchableOpacity className="flex-row items-center py-2 mb-1" onPress={onPress}>
      <Image source={{ uri: image }} className="w-12 h-12 rounded-md mr-3" />
      <View className="flex-1">
        <Text className="text-black dark:text-white font-semibold">{item.name}</Text>
        <Text className="text-gray-400 dark:text-gray-300 text-xs">{artistName}</Text>
      </View>
      <TouchableOpacity onPress={onOptionsPress}>
        <Text>
          <Icon name="ellipsis-vertical" size={20} color="#888" />
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
