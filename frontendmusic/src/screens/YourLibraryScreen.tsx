import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { YourLibraryStackParamList } from '../navigation/YourLibraryStackNavigator';
import SongItem from '../components/SongItem';
import LibraryItemButton from '../components/LibraryItemButton';

const libraryItems = [
  {
    id: '1',
    title: 'Favorite Songs',
    icon: 'favorite',
    screen: 'LikedSongsScreen',
    color: '#ffb5b5',
  },
  {
    id: '2',
    title: 'Artists',
    icon: 'person',
    screen: 'ArtistsFollowingScreen',
    color: '#fff999',
  },
  {
    id: '3',
    title: 'Playlists',
    icon: 'list',
    screen: 'PlaylistsScreen',
    color: '#82d8ff',
  },
  {
    id: '4',
    title: 'Downloaded',
    icon: 'cloud-download',
    screen: 'DownloadsScreen',
    color: '#88d89a',
  },
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
  {
    id: '7',
    title: 'Somebody',
    artist: 'Chainsmokers, Drew',
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '8',
    title: 'Somebody',
    artist: 'Chainsmokers, Drew',
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '9',
    title: 'Somebody',
    artist: 'Chainsmokers, Drew',
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
];

export default function YourLibraryScreen() {
  const navigation = useNavigation<NavigationProp<YourLibraryStackParamList>>();

  const renderLibraryItem = ({ item }: { item: (typeof libraryItems)[0] }) => (
    <LibraryItemButton
      title={item.title}
      icon={item.icon}
      onPress={() => navigation.navigate(item.screen as any)}
      color={item.color}
    />
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
    <ScrollView
      className="flex-1  bg-[#0E0C1F]"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
    >
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
        scrollEnabled={false} // Tắt cuộn của FlatList để nó không xung đột với ScrollView
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
        scrollEnabled={false} // Tắt cuộn của FlatList
      />
    </ScrollView>
  );
}
