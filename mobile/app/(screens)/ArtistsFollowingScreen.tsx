import React from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { router } from 'expo-router';

const artists = [
  { id: '1', name: 'One Republic', image: 'https://i.scdn.co/image/ab6761610000e5eb1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1' },
  { id: '2', name: 'Coldplay', image: 'https://i.scdn.co/image/ab6761610000e5eb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b' },
  { id: '3', name: 'The Chainsmokers', image: 'https://i.scdn.co/image/ab6761610000e5eb3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c' },
  { id: '4', name: 'Linkin Park', image: 'https://i.scdn.co/image/ab6761610000e5eb4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d' },
  { id: '5', name: 'Sia', image: 'https://i.scdn.co/image/ab6761610000e5eb5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e' },
  { id: '6', name: 'Ellie Goulding', image: 'https://i.scdn.co/image/ab6761610000e5eb6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f' },
  { id: '7', name: 'Katy Perry', image: 'https://i.scdn.co/image/ab6761610000e5eb7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a' },
  { id: '8', name: 'Maroon 5', image: 'https://i.scdn.co/image/ab6761610000e5eb8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b' },
];

export default function ArtistsFollowingScreen() {

  return (
    <View className="flex-1 bg-black px-4 pt-4">
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-2xl font-semibold mb-2">Artists Following</Text>
          <Text className="text-gray-400">8 artists following</Text>
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
        data={artists}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <TouchableOpacity className="items-center p-2 flex-1">
            <Image source={{ uri: item.image }} className="w-20 h-20 rounded-full mb-2" />
            <Text className="text-white text-center">{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
