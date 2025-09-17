import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { YourLibraryStackParamList } from '../navigation/YourLibraryStackNavigator';
import SongItem from '../components/SongItem';

const libraryItems = [
  { id: '1', title: 'Liked Songs', icon: '❤️', screen: 'LikedSongsScreen' },
  { id: '2', title: 'Downloads', icon: '⬇️', screen: 'DownloadsScreen' },
  { id: '3', title: 'Playlists', icon: '🎵', screen: 'PlaylistsScreen' },
  { id: '4', title: 'Artists', icon: '👤', screen: 'ArtistsFollowingScreen' },
];

const recentlyPlayed = [
  {
    id: '1',
    title: 'Inside Out',
    artist: 'The Chainsmokers, Charlee',
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '2',
    title: 'Young',
    artist: 'The Chainsmokers',
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '3',
    title: 'Beach House',
    artist: 'Chainsmokers - Sick',
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '4',
    title: 'Kills You Slowly',
    artist: 'The Chainsmokers - World',
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '5',
    title: 'Setting Fires',
    artist: 'Chainsmokers, XYLO -',
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '6',
    title: 'Somebody',
    artist: 'Chainsmokers, Drew',
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
];

export default function YourLibraryScreen() {
  const navigation = useNavigation<NavigationProp<YourLibraryStackParamList>>();

  const renderLibraryItem = ({ item }: { item: (typeof libraryItems)[0] }) => (
    <TouchableOpacity
      className="bg-gray-900 rounded-lg p-4 flex-1 m-2"
      onPress={() => navigation.navigate(item.screen as any)}
    >
      <Text className="text-white text-lg font-semibold">{item.icon}</Text>
      <Text className="text-white font-semibold mt-2">{item.title}</Text>
    </TouchableOpacity>
  );

  const renderRecentlyPlayedItem = ({
    item,
  }: {
    item: (typeof recentlyPlayed)[0];
  }) => (
    <SongItem
      title={item.title}
      subtitle={item.artist}
      image={item.image}
      onPress={() => navigation.navigate('SongScreen' as any, { song: item })}
      onOptionsPress={() => {}}
    />
  );

  return (
    <View className="flex-1 bg-black px-4 pt-4">
      <Text className="text-white text-2xl font-semibold mb-4">
        Your Library
      </Text>
      <FlatList
        data={libraryItems}
        renderItem={renderLibraryItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        className="mb-6"
      />
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-white text-lg font-semibold">
          Recently Played
        </Text>
        <TouchableOpacity>
          <Text className="text-gray-400">See more</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-white text-lg font-semibold">Up Next</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('QueueScreen' as any)}
        >
          <Text className="text-gray-400">Queue</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={recentlyPlayed}
        renderItem={renderRecentlyPlayedItem}
        keyExtractor={item => item.id}
        className="mb-4"
      />
    </View>
  );
}
