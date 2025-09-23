import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import HeaderBackButton from '@/components/button/HeaderBackButton';
import SongItem from '@/components/items/SongItem';
import CustomButton from '@/components/custom/CustomButton';
import Icon from 'react-native-vector-icons/Ionicons';

const sampleArtist = {
  id: '1',
  name: 'Maroon 5',
  image:
    'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  monthlyListeners: '2.3L',
  popularReleases: [
    {
      id: '1',
      title: 'Misery',
      album: 'Maroon 5 - Misery',
      image:
        'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
    },
    {
      id: '2',
      title: 'Payphone',
      album: 'Maroon 5 - Overexposed',
      image:
        'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
    },
    {
      id: '3',
      title: 'Animals',
      album: 'Maroon 5 - V',
      image:
        'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
    },
    {
      id: '4',
      title: 'Sugar',
      album: 'Maroon 5 - Singles',
      image:
        'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
    },
    {
      id: '5',
      title: 'The Sun',
      album: 'Maroon 5 - Songs About Jane',
      image:
        'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
    },
  ],
};

export default function ArtistScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const artist = params.artist ? JSON.parse(params.artist as string) : sampleArtist;
  const popularReleases = artist.popularReleases || [];

  const renderItem = ({ item }: any) => (
    <SongItem
      title={item.title}
      subtitle={item.album}
      image={item.image}
      onOptionsPress={() => {}}
    />
  );

  return (
    <ScrollView className="flex-1  bg-[#0E0C1F]">
      {/* Container cho ảnh và overlay */}
      <View className="relative w-full h-72">
        <Image
          source={{ uri: artist.image }}
          className="w-full h-full object-cover"
        />
        <View className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Header */}
        <View className="absolute top-0 left-0 right-0 p-4 z-10 flex-row items-center">
          <HeaderBackButton onPress={() => router.back()} />
          <View className="flex-1" />
          <TouchableOpacity className="ml-4">
            <Icon name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tên nghệ sĩ */}
        <Text className="absolute bottom-4 left-4 text-white text-4xl font-extrabold">
          {artist.name}
        </Text>
      </View>
      {/* <HeaderBackButton onPress={() => navigation.goBack()} />
      <Image source={{ uri: artist.image }} className="w-full h-full object-cover" /> */}
      <View className="p-4">
        {/* <Text className="text-white text-3xl font-bold mb-1">
          {artist.name}
        </Text> */}
        <Text className="text-gray-400 mb-4">
          {artist.monthlyListeners} monthly listeners
        </Text>
        <View className="flex-row space-x-4 mb-4">
          <CustomButton
            title=""
            onPress={() => {}}
            iconName="person-add"
            className="bg-gray-800 rounded-full px-5 py-2 mr-4 flex-row items-center"
          />
          <CustomButton
            title=""
            onPress={() => {}}
            iconName="share-outline"
            className="bg-gray-800 rounded-full px-5 py-2 flex-row items-center mr-4"
          />
          <CustomButton
            title=""
            onPress={() => {}}
            iconName="play"
            className="bg-green-600 rounded-full px-5 py-2 flex-row items-center"
          />
        </View>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-white text-xl font-bold">Popular releases</Text>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/AllSongsScreen', params: { artist: JSON.stringify(artist) } })}
          >
            <Text className="text-gray-400 font-semibold">See more</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={popularReleases.slice(0, 5)}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}
