import { AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, TouchableOpacity, Image, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function SongItem({
  item,
  image,
  onPress,
  onOptionsPress,
  isHistoryItem = false,
  isQueueItem = false,
  updateAt = new Date(),
}) {
  const colorScheme = useColorScheme();


  // giới hạn ký tự tên nghệ sĩ hiển thị
  const formatArtistNames = (artists) => {
    const maxLength = 60;
    let names = artists.map(artist => artist.name).join(', ');
    if (names.length > maxLength) {
      names = names.substring(0, maxLength) + '...';
    }
    return names;
  }

  // dd/MM/yyyy HH:mm
  const formatDateTime = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  return (
    <TouchableOpacity className="flex-row items-center py-2 mb-1" onPress={onPress}>
      <Image source={{ uri: image }} className="w-12 h-12 rounded-md mr-3" />
      <View className="flex-1">
        <Text className={`${colorScheme === 'dark' ? 'text-white' : 'text-black'} font-semibold`}>{item.name}</Text>
        <Text className={`${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-800'} text-xs`}>{formatArtistNames(item.artists)}</Text>
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
      {isHistoryItem && (
        <Text className={`${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs ml-2`}>
          {updateAt ? `Đã nghe vào ${formatDateTime(updateAt)}` : ''}
        </Text>
      )}
    </TouchableOpacity>
  );
}
