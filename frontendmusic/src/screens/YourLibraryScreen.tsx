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

// Định nghĩa các type cần thiết để tránh lỗi TypeScript
interface Artist {
  name: string;
  image: string;
}

interface Song {
  id: string;
  title: string;
  artists: Artist[];
  image: string;
  album?: string;
  itag?: string;
  mimeType?: string;
  bitrate?: string;
  youtubeUrl?: string;
  downloadUrl?: string;
}

// Cập nhật mảng recentlyPlayed với dữ liệu chi tiết
const recentlyPlayed: Song[] = [
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
  },
  {
    id: '5',
    title: 'Setting Fires',
    artists: [
      {
        name: 'Chainsmokers',
        image:
          'https://images.pexels.com/photos/1674483/pexels-photo-1674483.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
    ],
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    album: 'Collage',
    itag: '251',
    mimeType: 'audio/webm; codecs="opus"',
    bitrate: '160 kbps',
    youtubeUrl: 'https://www.youtube.com/watch?v=x0X6V19LgLg',
    downloadUrl: 'https://example.com/download/settingfires.mp3',
  },
  {
    id: '6',
    title: 'Somebody',
    artists: [
      {
        name: 'Chainsmokers',
        image:
          'https://images.pexels.com/photos/2085734/pexels-photo-2085734.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
    ],
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    album: 'Somebody - Single',
    itag: '251',
    mimeType: 'audio/webm; codecs="opus"',
    bitrate: '160 kbps',
    youtubeUrl: 'https://www.youtube.com/watch?v=R2_V1-GfKzE',
    downloadUrl: 'https://example.com/download/somebody.mp3',
  },
  {
    id: '7',
    title: 'Somebody',
    artists: [
      {
        name: 'Chainsmokers',
        image:
          'https://images.pexels.com/photos/1674483/pexels-photo-1674483.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
    ],
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    album: 'Somebody - Single',
    itag: '251',
    mimeType: 'audio/webm; codecs="opus"',
    bitrate: '160 kbps',
    youtubeUrl: 'https://www.youtube.com/watch?v=R2_V1-GfKzE',
    downloadUrl: 'https://example.com/download/somebody.mp3',
  },
  {
    id: '8',
    title: 'Somebody',
    artists: [
      {
        name: 'Chainsmokers',
        image:
          'https://images.pexels.com/photos/2085734/pexels-photo-2085734.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
    ],
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    album: 'Somebody - Single',
    itag: '251',
    mimeType: 'audio/webm; codecs="opus"',
    bitrate: '160 kbps',
    youtubeUrl: 'https://www.youtube.com/watch?v=R2_V1-GfKzE',
    downloadUrl: 'https://example.com/download/somebody.mp3',
  },
  {
    id: '9',
    title: 'Somebody',
    artists: [
      {
        name: 'Chainsmokers',
        image:
          'https://images.pexels.com/photos/1674483/pexels-photo-1674483.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
    ],
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    album: 'Somebody - Single',
    itag: '251',
    mimeType: 'audio/webm; codecs="opus"',
    bitrate: '160 kbps',
    youtubeUrl: 'https://www.youtube.com/watch?v=R2_V1-GfKzE',
    downloadUrl: 'https://example.com/download/somebody.mp3',
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
      // Nối tên nghệ sĩ thành một chuỗi
      subtitle={item.artists.map(a => a.name).join(', ')}
      image={item.image}
      // Truyền cả mảng artists
      onPress={() => navigation.navigate('SongScreen' as any, { song: item })}
      onOptionsPress={() => {}}
    />
  );

  return (
    <ScrollView
      className="flex-1 bg-[#0E0C1F]"
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
        scrollEnabled={false}
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
        scrollEnabled={false}
      />
    </ScrollView>
  );
}
