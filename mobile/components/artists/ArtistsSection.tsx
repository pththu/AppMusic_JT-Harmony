import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ImageBackground,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

const ArtistsSection = ({ artists, onPress = () => { } }) => {
  const renderArtistCard = ({ item }) => (
    <View className="mb-6 mx-4 rounded-xl overflow-hidden">
      <View
        style={{
          width: screenWidth - 32,
          height: screenWidth - 32,
          overflow: 'hidden',
        }}
      >
        <ImageBackground
          source={{ uri: item?.imageUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1762574889/kltn/user_hnoh3o.png' }}
          className="w-full h-full justify-end rounded-lg"
          resizeMode="cover"
        >
          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-white text-xl font-bold m-4">{item?.name}</Text>
            </View>
            <TouchableOpacity className="bg-white py-2 px-6 rounded-full m-4" onPress={onPress}>
              <Text className="text-black font-bold">Xem</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
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
