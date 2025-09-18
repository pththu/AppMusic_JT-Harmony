import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  Keyboard,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const trendingArtists = [
  {
    id: '1',
    name: 'Childish Gambino',
    image:
      'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '2',
    name: 'Marvin Gaye',
    image:
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '3',
    name: 'Kanye West',
    image:
      'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '4',
    name: 'Justin Bieber',
    image:
      'https://images.pexels.com/photos/226460/pexels-photo-226460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
];

const browseCategories = [
  { id: '1', name: 'TAMIL', color: '#1E90FF', icon: 'musical-notes' },
  { id: '2', name: 'INTERNATIONAL', color: '#FF4500', icon: 'globe' },
  { id: '3', name: 'POP', color: '#FF1493', icon: 'heart' },
  { id: '4', name: 'HIP-HOP', color: '#8A2BE2', icon: 'headset' },
  { id: '5', name: 'DANCE', color: '#FFD700', icon: 'body' },
  { id: '6', name: 'COUNTRY', color: '#32CD32', icon: 'guitar' },
  { id: '7', name: 'INDIE', color: '#FF8C00', icon: 'star' },
  { id: '8', name: 'JAZZ', color: '#00BFFF', icon: 'radio' },
];

const recentSearches = [
  {
    id: '1',
    type: 'Song',
    title: 'You (feat. Travis Scott)',
    subtitle: 'Don Toliver',
  },
  {
    id: '2',
    type: 'Album',
    title: 'John Wick: Chapter 4 (Original Soundtrack)',
    subtitle: 'Tyler Bates, Joel J. Richard',
  },
  { id: '3', type: 'Artist', title: 'Maroon 5', subtitle: '' },
  { id: '4', type: 'Playlist', title: 'Phonk Madness', subtitle: '' },
];

export default function SearchScreen() {
  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const animation = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setIsFocused(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const onBlur = () => {
    setIsFocused(false);
    Keyboard.dismiss();
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const containerBackgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#000', '#121212'],
  });

  const clearSearch = () => {
    setSearchText('');
    inputRef.current?.clear();
  };

  return (
    <Animated.View
      className="flex-1 pt-3"
      style={{ backgroundColor: containerBackgroundColor }}
    >
      <SafeAreaView>
        <View className="flex-row bg-gray-800 mx-3 rounded-lg px-3 items-center h-10 shadow-lg shadow-black/30">
          {isFocused ? (
            <TouchableOpacity onPress={onBlur} className="mr-2">
              <Icon name="arrow-back" size={20} color="#888" />
            </TouchableOpacity>
          ) : (
            <Icon name="search" size={20} color="#888" className="mr-2" />
          )}
          <TextInput
            ref={inputRef}
            className="flex-1 text-white text-base h-full"
            placeholder="Search songs, artist, album or playlist"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
            onFocus={onFocus}
            onBlur={onBlur}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch} className="ml-2">
              <Icon name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {!isFocused ? (
          <View className="mt-5">
            <Text className="text-white font-bold text-lg ml-3 mb-3">
              Trending artists
            </Text>
            <FlatList
              data={trendingArtists}
              horizontal
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12, marginBottom: 20 }}
              renderItem={({ item }) => (
                <View className="mr-4 items-center">
                  <Image
                    source={{ uri: item.image }}
                    className="w-16 h-16 rounded-full mb-1 border-2 border-gray-600"
                  />
                  <Text
                    className="text-white text-sm text-center w-16"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </View>
              )}
            />

            <Text className="text-white font-bold text-lg ml-3 mb-3">Browse</Text>
            <FlatList
              data={browseCategories}
              numColumns={4}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={{ marginHorizontal: 12 }}
              renderItem={({ item }) => (
                <View
                  className="flex-1 m-1 h-20 rounded-lg justify-center items-center"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon
                    name={item.icon}
                    size={24}
                    color="#fff"
                    className="mb-1"
                  />
                  <Text className="text-white font-bold text-xs">
                    {item.name}
                  </Text>
                </View>
              )}
            />
          </View>
        ) : (
          <View className="mt-5 mx-3">
            <Text className="text-white font-bold text-lg mb-3">
              Recent searches
            </Text>
            <FlatList
              data={recentSearches}
              keyExtractor={item => item.id}
              ItemSeparatorComponent={() => <View className="h-px bg-gray-700" />}
              renderItem={({ item }) => {
                let iconName = 'musical-notes';
                if (item.type === 'Album') iconName = 'disc';
                else if (item.type === 'Artist') iconName = 'person';
                else if (item.type === 'Playlist') iconName = 'list';

                return (
                  <View className="flex-row justify-between items-center py-3">
                    <View className="flex-row items-center flex-1">
                      <Icon
                        name={iconName}
                        size={18}
                        color="#888"
                        className="mr-3"
                      />
                      <View>
                        <Text className="text-white font-bold text-sm">
                          {item.title}
                        </Text>
                        {item.subtitle ? (
                          <Text className="text-gray-400 text-xs">
                            {item.subtitle}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <TouchableOpacity>
                      <Icon name="close" size={20} color="#888" />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
            <TouchableOpacity className="mt-5 items-end">
              <Text className="text-gray-400 font-bold">Clear history</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Animated.View>
  );
}
