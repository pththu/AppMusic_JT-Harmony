import React from 'react';
import { Text, TouchableOpacity, Image } from 'react-native';

interface ArtistCardProps {
  name: string;
  image: string;
  onPress?: () => void;
}

export default function ArtistCard({ name, image, onPress }: ArtistCardProps) {
  return (
    <TouchableOpacity className="items-center p-2 flex-1" onPress={onPress}>
      <Image
        source={{ uri: image }}
        className="w-20 h-20 rounded-full mb-2"
      />
      <Text className="text-white text-center">{name}</Text>
    </TouchableOpacity>
  );
}
