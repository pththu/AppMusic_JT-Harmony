import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const screenWidth = Dimensions.get('window').width;

const upNextSongs = [
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
];

import { RouteProp, NavigationProp } from '@react-navigation/native';
import { YourLibraryStackParamList } from '../navigation/YourLibraryStackNavigator';

type SongScreenRouteProp = RouteProp<YourLibraryStackParamList, 'SongScreen'>;
type SongScreenNavigationProp = NavigationProp<
  YourLibraryStackParamList,
  'SongScreen'
>;

type Props = {
  route: SongScreenRouteProp;
  navigation: SongScreenNavigationProp;
};

export default function SongScreen({ route, navigation }: Props) {
  // Thay thử URL ảnh mặc định để kiểm tra hiển thị
  const { song } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const renderUpNextItem = ({
    item,
  }: {
    item: { id: string; title: string; artist: string; image: string };
  }) => (
    <View className="flex-row items-center py-2 border-b border-gray-700">
      <Image source={{ uri: item.image }} className="w-12 h-12 rounded-md" />
      <View className="flex-1 ml-3">
        <Text className="text-white font-bold text-base">{item.title}</Text>
        <Text className="text-gray-400 text-sm">{item.artist}</Text>
      </View>
      <TouchableOpacity>
        <Icon name="more-vert" size={24} color="gray" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color="white" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-gray-400 text-sm">Playing from album</Text>
          <Text className="text-white text-base font-semibold">
            {song.title}
          </Text>
        </View>
        <TouchableOpacity>
          <Icon name="more-vert" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View className="items-center mb-4">
        <View className="relative">
          <Image
            source={{ uri: song.image }}
            style={{ width: screenWidth - 32, height: screenWidth - 32 }}
            className="rounded-xl"
            resizeMode="cover"
            onError={e => {
              console.log('Image load error:', e.nativeEvent.error);
            }}
          />
          <View className="absolute inset-0 justify-center pb-6 items-center bg-opacity-50 rounded-xl px-4">
            <Text className="text-white text-3xl font-bold mb-2 text-center">
              {song.title}
            </Text>
            <Text className="text-gray-300 text-lg mb-1 text-center">
              {song.artist}
            </Text>
            <Text className="text-gray-300 text-base text-center">
              feat. Artist 2
            </Text>
            <Text className="text-gray-400 text-sm mt-4 text-center">
              Lyrics here...
            </Text>
          </View>
        </View>
      </View>

      {/* Connect to device */}
      <TouchableOpacity className="bg-gray-800 px-4 py-2 rounded-full self-center mb-4 flex-row items-center">
        <Ionicons name="devices" size={20} color="white" />
        <Text className="text-white text-sm ml-2">Connect to a device</Text>
      </TouchableOpacity>

      {/* Song Info and Action Buttons */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-white text-2xl font-bold">{song.title}</Text>
          <Text className="text-gray-400 text-base">{song.artist}</Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity className="mr-4">
            <Icon name="favorite-border" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="mr-4">
            <Icon name="download" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="share" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row justify-between items-center mb-3 px-6">
        <TouchableOpacity>
          <Icon name="shuffle" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="skip-previous" size={36} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white rounded-full p-2 shadow-lg"
          onPress={togglePlayPause}
        >
          <Icon
            name={isPlaying ? 'pause' : 'play-arrow'}
            size={48}
            color="black"
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="skip-next" size={36} color="white" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="repeat" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="flex-row items-center px-3 mb-3">
        <Text className="text-gray-400 text-xs w-8 text-center">0:25</Text>
        <View className="flex-1 h-1 bg-gray-700 rounded-sm mx-2">
          <View className="w-1/3 h-1 bg-white rounded-sm" />
        </View>
        <Text className="text-gray-400 text-xs w-8 text-center">3:15</Text>
      </View>

      {/* Up Next Header */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-white text-lg font-bold">Up Next</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('QueueScreen' as never)}
        >
          <Text className="text-gray-400 text-base">Queue</Text>
        </TouchableOpacity>
      </View>

      {/* Up Next List */}
      <FlatList
        data={upNextSongs}
        renderItem={renderUpNextItem}
        keyExtractor={item => item.id}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}
