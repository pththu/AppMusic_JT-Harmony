import { AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, TouchableOpacity, Image, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function SongItem({ item, image, onPress, onOptionsPress, isHistoryItem = false, isQueueItem = false }) {
  const colorScheme = useColorScheme();

  const artistName = item?.artists?.map(a => a?.name).join(', ');

  return (
    <TouchableOpacity className="flex-row items-center py-2 mb-1" onPress={onPress}>
      <Image source={{ uri: image }} className="w-12 h-12 rounded-md mr-3" />
      <View className="flex-1">
        <Text className={`${colorScheme === 'dark' ? 'text-white' : 'text-black'} font-semibold`}>{item.name}</Text>
        <Text className={`${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-800'} text-xs`}>{artistName}</Text>
      </View>
      {!isHistoryItem && (
        <TouchableOpacity onPress={onOptionsPress}>
          <Text>
            {isQueueItem ? (
              <SimpleLineIcons name="close" color={colorScheme === 'dark' ? '#888' : 'black'} size={20} />
            ) : (
              <Icon name="ellipsis-vertical" size={20} color={colorScheme === 'dark' ? '#888' : 'black'} />
            )}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
