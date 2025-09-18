import React from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const likedSongs = [
  { id: '1', title: 'Inside Out', artist: 'The Chainsmokers, Charlee', image: 'https://i.scdn.co/image/ab67616d00001e02a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1' },
  { id: '2', title: 'Young', artist: 'The Chainsmokers', image: 'https://i.scdn.co/image/ab67616d00001e02b2b2b2b2b2b2b2b2b2b2b2b2b2b2b' },
  { id: '3', title: 'Beach House', artist: 'Chainsmokers - Sick', image: 'https://i.scdn.co/image/ab67616d00001e02c3c3c3c3c3c3c3c3c3c3c3c3c3c3c' },
  { id: '4', title: 'Kills You Slowly', artist: 'The Chainsmokers - World', image: 'https://i.scdn.co/image/ab67616d00001e02d4d4d4d4d4d4d4d4d4d4d4d4d4d4d' },
  { id: '5', title: 'Setting Fires', artist: 'Chainsmokers, XYLO -', image: 'https://i.scdn.co/image/ab67616d00001e02e5e5e5e5e5e5e5e5e5e5e5e5e5e' },
  { id: '6', title: 'Somebody', artist: 'Chainsmokers, Drew', image: 'https://i.scdn.co/image/ab67616d00001e02f6f6f6f6f6f6f6f6f6f6f6f6f6f' },
];

export default function LikedSongsScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-black px-4 pt-4">
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-2xl font-semibold mb-2">Liked Songs</Text>
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
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
        )}
      />
    </View>
  );
}
