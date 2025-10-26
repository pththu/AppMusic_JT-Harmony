import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigate } from '@/hooks/useNavigate';
import LibraryItemButton from '@/components/button/LibraryItemButton';
import SongItem from '@/components/items/SongItem';
import { usePlayerStore } from '@/store/playerStore';
import { trackData, albumData } from '@/constants/data';

const libraryItems = [
  {
    id: '1',
    title: 'Bài hát yêu thích',
    icon: 'favorite',
    screen: 'LikedSongsScreen',
    color: '#ffb5b5',
  },
  {
    id: '2',
    title: 'Nghệ sĩ',
    icon: 'person',
    screen: 'ArtistsFollowingScreen',
    color: '#FFA500',
  },
  {
    id: '3',
    title: 'Danh sách phát',
    icon: 'list',
    screen: 'AllPlaylistScreen',
    color: '#82d8ff',
  },
  {
    id: '4',
    title: 'Đã tải xuống',
    icon: 'cloud-download',
    screen: 'DownloadsScreen',
    color: '#88d89a',
  },
];

export default function YourLibraryScreen() {
  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong);
  const { navigate } = useNavigate();
  const colorScheme = useColorScheme();

  const handleSelectSong = (song) => {
    setCurrentSong(song);
    navigate('SongScreen');
  }

  const renderRecentlyPlayedItem = ({ item }: { item: (typeof trackData)[0]; }) => (
    <SongItem
      title={item.name}
      subtitle={item.artists.map(a => a).join(', ')} // Nối tên nghệ sĩ thành một chuỗi
      image={item.imageUrl || albumData.find(album => album.name === item.album)?.imageUrl || ''}
      onPress={() => handleSelectSong(item)} // Truyền cả mảng artists
      onOptionsPress={() => { }}
    />
  );

  return (
    <SafeAreaView className={`flex-1 px-4 pt-4 ${colorScheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <Text className="text-black dark:text-white text-2xl font-semibold mb-4">
        Thư viện của bạn
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
          Nghe gần đây
        </Text>
        <TouchableOpacity>
          <Text className="text-gray-400 dark:text-gray-300">Xem thêm</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={trackData}
        renderItem={renderRecentlyPlayedItem}
        keyExtractor={item => item.id.toString()}
        className=''
      />
    </SafeAreaView>
  );
}
