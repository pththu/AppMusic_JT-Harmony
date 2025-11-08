import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

const ArtistsSection = ({ artists }) => {
  const renderArtistCard = ({ item }) => (
    <View className="mb-6">
      <View
        style={{
          width: screenWidth - 32,
          height: screenWidth - 32,
          overflow: 'hidden',
        }}
        className="rounded-xl relative"
      >
        <Image
          source={{ uri: item?.imageUrl }}
          style={{ width: screenWidth - 32, height: screenWidth - 32 }}
          className="absolute"
        />
        <View className="absolute inset-0 bg-black opacity-30"></View>

        <View className="flex-1 justify-end p-4">
          <View className="absolute top-4 left-4">
            <Text className="text-white text-xl font-bold">Artists</Text>
          </View>
          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-white text-xl font-bold">{item?.name}</Text>
            </View>
            <TouchableOpacity className="bg-white py-2 px-6 rounded-full">
              <Text className="text-black font-bold">Xem</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={artists}
      renderItem={renderArtistCard}
      keyExtractor={item => item.name}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={screenWidth}
      snapToAlignment="center"
      decelerationRate="fast"
    />
  );
};

export default ArtistsSection;
