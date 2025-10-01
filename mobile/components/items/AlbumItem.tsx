import React from 'react';
import { Text, TouchableOpacity, Image } from 'react-native';

interface AlbumItemProps {
  title: string;
  subtitle?: string;
  image: string;
  onPress?: () => void;
}

export default function AlbumItem({ title, subtitle, image, onPress }: AlbumItemProps) {
  return (
    <TouchableOpacity className="mr-4" onPress={onPress}>
      <Image source={{ uri: image }} className="w-32 h-32 rounded-lg" />
      <Text className="text-white mt-1 text-base font-bold">{title}</Text>
      {subtitle && <Text className="text-gray-400 text-sm">{subtitle}</Text>}
    </TouchableOpacity>
  );
}
