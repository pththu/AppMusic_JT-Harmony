import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import PlaylistItem from '../components/PlaylistItem';

const playlists = [
  {
    id: '1',
    title: 'Maroon 5 Songs',
    type: 'Playlist',
    songs: 50,
    creator: 'User A',
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '2',
    title: 'Phonk Madness',
    type: 'Playlist',
    songs: 30,
    creator: 'User B',
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '3',
    title: 'John Wick Chapter 4',
    type: 'Album',
    songs: 15,
    creator: 'Soundtrack',
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '4',
    title: 'Gryffin Collections',
    type: 'Playlist',
    songs: 72,
    creator: 'Gryffin',
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
];



export default function PlaylistsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchText, setSearchText] = useState('');

  const filteredPlaylists = playlists.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePressPlaylistItem = (item: typeof playlists[0]) => {
    // Logic điều hướng đến màn hình chi tiết của playlist
    console.log('Bạn đã nhấn vào playlist:', item.title);
    // Ví dụ: navigation.navigate('PlaylistDetailScreen', { playlistId: item.id });
  };

  return (
    <View className="flex-1  bg-[#0E0C1F] px-4 pt-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={handleBackPress} className="mr-4 p-1">
          <Icon name="chevron-down" size={32} color="white" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-3xl font-bold mb-1">Playlists</Text>
          <Text className="text-gray-400 text-sm">
            {playlists.length} playlists
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-6">
        <View className="flex-1 bg-gray-800 rounded-full p-2 flex-row items-center">
          <Icon name="search" size={20} color="#888" className="ml-2" />
          <TextInput
            placeholder="Search playlists"
            placeholderTextColor="#888"
            className="ml-2 flex-1 text-white"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity className="ml-4 active:opacity-75">
          <Icon name="swap-vertical" size={24} color="#888" />
        </TouchableOpacity>
      </View>

      {filteredPlaylists.length > 0 ? (
        <FlatList
          data={filteredPlaylists}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PlaylistItem
              title={item.title}
              type={item.type}
              songs={item.songs}
              image={item.image}
              onPress={() => handlePressPlaylistItem(item)}
              onOptionsPress={() => {}}
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Icon name="folder-open-outline" size={64} color="#555" />
          <Text className="text-gray-500 mt-4 text-center">
            Không tìm thấy playlist nào.
          </Text>
        </View>
      )}
    </View>
  );
}