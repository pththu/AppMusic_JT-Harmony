import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, useColorScheme } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigate } from '@/hooks/useNavigate';
import LibraryItemButton from '@/components/button/LibraryItemButton';
import SongItem from '@/components/items/SongItem';
import { usePlayerStore } from '@/store/playerStore';

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
    color: '#FFA500',
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
    artists: [
      {
        name: 'The Chainsmokers',
        image:
          'https://images.pexels.com/photos/1674483/pexels-photo-1674483.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
      {
        name: 'Charlee',
        image:
          'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
    ],
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    album: 'Inside Out - Single',
    itag: '251',
    mimeType: 'audio/webm; codecs="opus"',
    bitrate: '160 kbps',
    youtubeUrl: 'https://www.youtube.com/watch?v=R2_V1-GfKzE',
    downloadUrl: 'https://example.com/download/insideout.mp3',
    fileUri: 'https://res.cloudinary.com/chaamz03/video/upload/v1760515668/kltn/audios/iam3qsdamdcjmkeqg2r8.mp3',
  },
  {
    id: '2',
    title: 'Young',
    artists: [
      {
        name: 'The Chainsmokers',
        image:
          'https://images.pexels.com/photos/2085734/pexels-photo-2085734.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
    ],
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    album: 'Memories...Do Not Open',
    itag: '251',
    mimeType: 'audio/webm; codecs="opus"',
    bitrate: '160 kbps',
    youtubeUrl: 'https://www.youtube.com/watch?v=k_y9iN9k3yA',
    downloadUrl: 'https://example.com/download/young.mp3',
  },
  {
    id: '3',
    title: 'Beach House',
    artists: [
      {
        name: 'Chainsmokers',
        image:
          'https://images.pexels.com/photos/1674483/pexels-photo-1674483.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
    ],
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    album: 'Sick Boy',
    itag: '251',
    mimeType: 'audio/webm; codecs="opus"',
    bitrate: '160 kbps',
    youtubeUrl: 'https://www.youtube.com/watch?v=k_y9iN9k3yA',
    downloadUrl: 'https://example.com/download/beachhouse.mp3',
  },
  {
    id: '4',
    title: 'Kills You Slowly',
    artists: [
      {
        name: 'The Chainsmokers',
        image:
          'https://images.pexels.com/photos/2085734/pexels-photo-2085734.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
    ],
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    album: 'World War Joy',
    itag: '251',
    mimeType: 'audio/webm; codecs="opus"',
    bitrate: '160 kbps',
    youtubeUrl: 'https://www.youtube.com/watch?v=k_y9iN9k3yA',
    downloadUrl: 'https://example.com/download/killsyouslowly.mp3',
  }
];

export default function YourLibraryScreen() {
  const { navigate } = useNavigate();
  const colorScheme = useColorScheme();

  const handleSelectSong = (song) => {
    usePlayerStore.getState().setCurrentSong(song);
    navigate('SongScreen');
  }

  const renderLibraryItem = ({ item }: { item: (typeof libraryItems)[0] }) => (
    <LibraryItemButton
      title={item.title}
      icon={item.icon}
      onPress={() => navigate(item.screen)}
      color={item.color}
    />
  );

  const renderRecentlyPlayedItem = ({ item }: { item: (typeof recentlyPlayed)[0]; }) => (
    <SongItem
      title={item.title}
      // Nối tên nghệ sĩ thành một chuỗi
      subtitle={item.artists.map(a => a.name).join(', ')}
      image={item.image}
      // Truyền cả mảng artists
      onPress={() => handleSelectSong(item)}
      onOptionsPress={() => { }}
    />
  );

  return (
    <SafeAreaView className={`flex-1 px-4 pt-4 ${colorScheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <Text className="text-black dark:text-white text-2xl font-semibold mb-4">
        Your Library
      </Text>
      <View className="mb-6  flex-row gap-2 flex-wrap justify-between p-1">
        {libraryItems?.map(item => (
          <LibraryItemButton
            key={item.id}
            title={item.title}
            icon={item.icon}
            onPress={() => navigate(item.screen)}
            color={item.color}
          />
        ))}
      </View>
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-black dark:text-white text-lg font-semibold">
          Recently Played
        </Text>
        <TouchableOpacity>
          <Text className="text-gray-400 dark:text-gray-300">See more</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={recentlyPlayed}
        renderItem={renderRecentlyPlayedItem}
        keyExtractor={item => item.id}
        className=""
      />
    </SafeAreaView>
  );
}
