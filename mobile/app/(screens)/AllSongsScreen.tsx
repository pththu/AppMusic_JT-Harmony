import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import HeaderBackButton from '@/components/button/HeaderBackButton';
import SongItem from '@/components/items/SongItem';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeContext';

const sampleSongs = [
  {
    id: '1',
    title: 'Bet My Heart',
    album: 'Maroon 5 - Red Pill Blue Deluxe',
    image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
  },
  {
    id: '2',
    title: 'Misery',
    album: 'Maroon 5 - Misery',
    image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
  },
  {
    id: '3',
    title: 'Plastic Rose',
    album: 'Maroon 5 - Red Pill Blue Deluxe',
    image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
  },
  {
    id: '4',
    title: 'Shoot Love',
    album: 'Maroon 5 - V Asia Tour Edition',
    image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
  },
  {
    id: '5',
    title: 'Lost Stars',
    album: 'Maroon 5 - V Asia Tour Edition',
    image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
  },
  {
    id: '6',
    title: 'Wake Up Call',
    album: "Maroon 5 - It Won't Be Soon Before Long",
    image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
  },
  {
    id: '7',
    title: 'Denim Jacket',
    album: 'Maroon 5 - Red Pill Blues',
    image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
  },
  {
    id: '8',
    title: 'Beautiful Goodbye',
    album: 'Maroon 5 - Overexposed Deluxe',
    image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
  },
  {
    id: '9',
    title: 'Payphone',
    album: 'Maroon 5 - Overexposed',
    image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
  },
  {
    id: '10',
    title: 'In Your Pocket',
    album: 'Maroon 5 - V',
    image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
  },
];

export default function AllSongsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const artist = params.artist ? JSON.parse(params.artist as string) : { name: 'Artist' };

  const { theme } = useTheme();
  const primaryIconColor = theme === 'dark' ? 'white' : 'black';

  const renderItem = ({ item }: any) => (
    <SongItem
      title={item.title}
      subtitle={item.album}
      image={item.image}
      onOptionsPress={() => { }}
    />
  );

  return (
    <View className="flex-1 bg-white dark:bg-[#0E0C1F]">
      <HeaderBackButton onPress={() => router.back()} />
      <Text className="text-black dark:text-white text-2xl font-bold px-4 mb-4">All Songs</Text>
      <Text className="text-black dark:text-white text-lg font-semibold px-4 mb-2">
        {artist.name}
      </Text>
      <FlatList
        data={sampleSongs}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
      <TouchableOpacity className="bg-green-600 rounded-full px-5 py-3 m-4 flex-row items-center justify-center">
        <Icon name="play" size={20} color={primaryIconColor} />
        <Text className="text-black dark:text-white font-semibold ml-3">Play All</Text>
      </TouchableOpacity>
    </View>
  );
}
