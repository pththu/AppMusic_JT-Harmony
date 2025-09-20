import React, { useState } from 'react';
import { View, Text, FlatList, Switch, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const queueSongs = [
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

export default function QueueScreen() {
  const [autoRecommendations, setAutoRecommendations] = useState(true);

  const renderQueueItem = ({ item }: { item: { id: string; title: string; artist: string; image: string } }) => (
    <View className="flex-row items-center p-2 border-b border-gray-700">
      <Image source={{ uri: item.image }} className="w-12 h-12 rounded-md" />
      <View className="ml-4 flex-1">
        <Text className="text-white font-semibold">{item.title}</Text>
        <Text className="text-gray-400">{item.artist}</Text>
      </View>
      <TouchableOpacity>
        <Icon name="drag-handle" size={24} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity className="ml-4">
        <Icon name="more-vert" size={24} color="gray" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1  bg-[#0E0C1F] p-4">
      <Text className="text-white text-xl font-semibold mb-4">In Queue</Text>
      <FlatList
        data={queueSongs}
        renderItem={renderQueueItem}
        keyExtractor={item => item.id}
        className="mb-4"
      />
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-lg font-semibold">Auto-recommendations</Text>
        <Switch
          value={autoRecommendations}
          onValueChange={setAutoRecommendations}
          trackColor={{ false: '#767577', true: '#34D399' }}
          thumbColor={autoRecommendations ? '#10B981' : '#f4f3f4'}
        />
      </View>
    </View>
  );
}
