import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface SearchItemProps {
  type: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  onDelete: () => void;
}

export default function SearchItem({ type, title, subtitle, onPress, onDelete }: SearchItemProps) {
  let iconName = 'musical-notes';
  if (type === 'Album') iconName = 'disc';
  else if (type === 'Artist') iconName = 'person';
  else if (type === 'Playlist') iconName = 'list';

  return (
    <View className="flex-row justify-between items-center py-3">
      <TouchableOpacity className="flex-row items-center flex-1" onPress={onPress}>
        <Icon name={iconName} size={18} color="#888" />
        <View>
          <Text className="text-white font-bold text-sm">{title}</Text>
          {subtitle ? (
            <Text className="text-gray-400 text-xs">{subtitle}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete}>
        <Icon name="close" size={20} color="#888" />
      </TouchableOpacity>
    </View>
  );
}
