import React from 'react';
import { Text, TouchableOpacity, Image, useColorScheme } from 'react-native';

interface ArtistItemProps {
  name: string;
  image: string;
  onPress?: () => void;
}

export default function ArtistItem({ name, image, onPress }: ArtistItemProps) {

  const colorScheme = useColorScheme();
  const imageDefault = 'https://res.cloudinary.com/chaamz03/image/upload/v1763270755/kltn/JT_Harmony_aoi1iv.png';
  return (
    <TouchableOpacity className="items-center mr-4 mb-4" onPress={onPress}>
      <Image source={{ uri: image || imageDefault }} className="w-16 h-16 rounded-full mb-1 border-2 border-green-400" />
      <Text className={`text-${colorScheme === "dark" ? "white" : "black"} text-sm text-center w-16`} numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}
