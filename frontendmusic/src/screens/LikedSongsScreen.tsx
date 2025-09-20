import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import SongItem from '../components/SongItem';

const likedSongs = [
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

export default function LikedSongsScreen({ route }: { route: any }) {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-[#0E0C1F] px-4 pt-4">
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={handleBackPress} className="mr-4">
          <Icon name="chevron-down" size={24} color="white" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-2xl font-semibold mb-2">
            Liked Songs
          </Text>
          <Text className="text-gray-400">120 liked songs</Text>
        </View>
      </View>
      <View className="flex-row items-center mb-4">
        <View className="flex-1 bg-gray-800 rounded-md p-2 flex-row items-center">
          <Icon name="search" size={20} color="#888" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#888"
            className="ml-2 flex-1 text-white"
          />
        </View>
        <TouchableOpacity className="ml-4">
          <Icon name="swap-vertical" size={24} color="#888" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={likedSongs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <SongItem
            title={item.title}
            subtitle={item.artist}
            image={item.image}
            onOptionsPress={() => {}}
          />
        )}
      />
    </View>
  );
}
