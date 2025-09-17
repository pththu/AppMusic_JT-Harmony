import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface SettingItemProps {
  title: string;
  value?: string;
  onPress?: () => void;
}

export default function SettingItem({ title, value, onPress }: SettingItemProps) {
  return (
    <TouchableOpacity
      className="py-3 border-b border-gray-700 active:opacity-75 active:scale-95"
      onPress={onPress}
    >
      <Text className="text-gray-400 text-xl">{title}</Text>
      {value && <Text className="text-gray-400 text-xl">{value}</Text>}
    </TouchableOpacity>
  );
}
