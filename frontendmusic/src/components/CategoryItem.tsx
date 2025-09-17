import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface CategoryItemProps {
  name: string;
  icon: string;
  color: string;
  onPress?: () => void;
}

export default function CategoryItem({ name, icon, color, onPress }: CategoryItemProps) {
  return (
    <TouchableOpacity
      className="flex-1 m-1 h-20 rounded-lg justify-center items-center"
      style={{ backgroundColor: color }}
      onPress={onPress}
    >
      <Icon name={icon} size={24} color="#fff" className="mb-1" />
      <Text className="text-white font-bold text-xs">{name}</Text>
    </TouchableOpacity>
  );
}
