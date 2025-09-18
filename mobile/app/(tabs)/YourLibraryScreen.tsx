import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    image: 'https://i.scdn.co/image/ab67616d00001e02a1a1a1a1a1a1a1a1a1a1a1a1',
  },
  {
    id: '2',
    title: 'Young',
    artist: 'The Chainsmokers',
    image: 'https://i.scdn.co/image/ab67616d00001e02b2b2b2b2b2b2b2b2b2b2b2b2b',
  },
  {
    id: '3',
    title: 'Beach House',
    artist: 'Chainsmokers - Sick',
    image: 'https://i.scdn.co/image/ab67616d00001e02c3c3c3c3c3c3c3c3c3c3c3c3c',
  },
  {
    id: '4',
    title: 'Kills You Slowly',
    artist: 'The Chainsmokers - World',
    image: 'https://i.scdn.co/image/ab67616d00001e02d4d4d4d4d4d4d4d4d4d4d4d4d',
  },
  {
    id: '5',
    title: 'Setting Fires',
    artist: 'Chainsmokers, XYLO -',
    image: 'https://i.scdn.co/image/ab67616d00001e02e5e5e5e5e5e5e5e5e5e5e5e5e',
  },
  {
    id: '6',
    title: 'Somebody',
    artist: 'Chainsmokers, Drew',
    image: 'https://i.scdn.co/image/ab67616d00001e02f6f6f6f6f6f6f6f6f6f6f6f6f',
  },
];

export default function YourLibraryScreen() {
  const navigation = useNavigation();

  const renderLibraryItem = ({ item }: { item: (typeof libraryItems)[0] }) => (
    <TouchableOpacity
      className="bg-gray-900 rounded-lg p-4 flex-1 m-2"
      // onPress={() => navigation.navigate(item.screen)}
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
    <TouchableOpacity className="flex-row items-center p-2">
      <Image source={{ uri: item.image }} className="w-12 h-12 rounded-md" />
      <View className="ml-4 flex-1">
        <Text className="text-white font-semibold">{item.title}</Text>
        <Text className="text-gray-400">{item.artist}</Text>
      </View>
      <TouchableOpacity>
        <Text className="text-gray-400 text-2xl">⋮</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black px-4 pt-4">
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
      <FlatList
        data={recentlyPlayed}
        renderItem={renderRecentlyPlayedItem}
        keyExtractor={item => item.id}
        className="mb-4"
      />
    </SafeAreaView>
  );
}
