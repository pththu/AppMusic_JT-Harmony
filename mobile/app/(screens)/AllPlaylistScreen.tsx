import React from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/components/ThemeContext';

const playlists = [
  { id: '1', title: 'Maroon 5 Songs', type: 'Playlist', image: 'https://i.scdn.co/image/ab67616d00001e02a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1' },
  { id: '2', title: 'Phonk Madness', type: 'Playlist', image: 'https://i.scdn.co/image/ab67616d00001e02b2b2b2b2b2b2b2b2b2b2b2b2b2b2b' },
  { id: '3', title: 'John Wick Chapter 4', type: 'Album', image: 'https://i.scdn.co/image/ab67616d00001e02c3c3c3c3c3c3c3c3c3c3c3c3c3c3c' },
  { id: '4', title: 'Gryffin Collections', type: 'Playlist', image: 'https://i.scdn.co/image/ab67616d00001e02d4d4d4d4d4d4d4d4d4d4d4d4d4d4d' },
];

export default function AllPlaylistScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const primaryIconColor = theme === 'dark' ? 'white' : 'black';

  return (
    <View className="flex-1 bg-white dark:bg-[#0E0C1F] px-4 pt-4">
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color={primaryIconColor} />
        </TouchableOpacity>
        <View>
          <Text className="text-black dark:text-white text-2xl font-semibold mb-2">Playlists</Text>
          <Text className="text-gray-600 dark:text-gray-400">12 playlists</Text>
        </View>
      </View>
      <View className="flex-row items-center mb-4">
        <View className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-md p-2 flex-row items-center">
          <Icon name="search" size={20} color="#888" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#888"
            className="ml-2 flex-1 text-black dark:text-white"
          />
        </View>
        <TouchableOpacity className="ml-4">
          <Icon name="swap-vertical" size={24} color="#888" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity className="flex-row items-center p-2">
            <Image source={{ uri: item.image }} className="w-24 h-24 rounded-md" />
            <View className="ml-4 flex-1 justify-center">
              <Text className="text-black dark:text-white font-semibold">{item.title}</Text>
              <Text className="text-gray-600 dark:text-gray-400">{item.type}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
