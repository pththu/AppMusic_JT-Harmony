import React from 'react';
import { Text, TouchableOpacity, Image } from 'react-native';

interface ArtistItemProps {
  name: string;
  image: string;
  onPress?: () => void;
}

export default function ArtistItem({ name, image, onPress }: ArtistItemProps) {
  return (
    <TouchableOpacity className="items-center mr-4" onPress={onPress}>
      <Image source={{ uri: image }} className="w-16 h-16 rounded-full mb-1 border-2 border-gray-600" />
      <Text className="text-white text-sm text-center w-16" numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}
