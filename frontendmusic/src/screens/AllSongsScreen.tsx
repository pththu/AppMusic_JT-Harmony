import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import HeaderBackButton from '../components/HeaderBackButton';
import SongItem from '../components/SongItem';

const sampleSongs = [
  { id: '1', title: 'Bet My Heart', album: 'Maroon 5 - Red Pill Blue Deluxe', image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg' },
  { id: '2', title: 'Misery', album: 'Maroon 5 - Misery', image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg' },
  { id: '3', title: 'Plastic Rose', album: 'Maroon 5 - Red Pill Blue Deluxe', image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg' },
  { id: '4', title: 'Shoot Love', album: 'Maroon 5 - V Asia Tour Edition', image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg' },
  { id: '5', title: 'Lost Stars', album: 'Maroon 5 - V Asia Tour Edition', image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg' },
  { id: '6', title: 'Wake Up Call', album: 'Maroon 5 - It Won\'t Be Soon Before Long', image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg' },
  { id: '7', title: 'Denim Jacket', album: 'Maroon 5 - Red Pill Blues', image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg' },
  { id: '8', title: 'Beautiful Goodbye', album: 'Maroon 5 - Overexposed Deluxe', image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg' },
  { id: '9', title: 'Payphone', album: 'Maroon 5 - Overexposed', image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg' },
  { id: '10', title: 'In Your Pocket', album: 'Maroon 5 - V', image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg' },
];

export default function AllSongsScreen({ navigation, route }: any) {
  const artist = route.params?.artist || { name: 'Artist' };

  const renderItem = ({ item }: any) => (
    <SongItem
      title={item.title}
      album={item.album}
      image={item.image}
      onOptionsPress={() => {}}
    />
  );

  return (
    <View className="flex-1 bg-black">
      <HeaderBackButton onPress={() => navigation.goBack()} />
      <Text className="text-white text-2xl font-bold px-4 mb-4">All Songs</Text>
      <Text className="text-white text-lg font-semibold px-4 mb-2">{artist.name}</Text>
      <FlatList
        data={sampleSongs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
      <TouchableOpacity className="bg-green-600 rounded-full px-5 py-3 m-4 flex-row items-center justify-center">
        <Icon name="play" size={20} color="white" />
        <Text className="text-white font-semibold ml-3">Play All</Text>
      </TouchableOpacity>
    </View>
  );
}
