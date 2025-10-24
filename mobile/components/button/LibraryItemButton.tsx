import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface LibraryItemButtonProps {
  title: string;
  icon: string;
  onPress: () => void;
  color: string;
}

export default function LibraryItemButton({
  title,
  icon,
  onPress,
  color,
}: LibraryItemButtonProps) {
  return (
    <TouchableOpacity
      className={`flex-1 m-2 rounded-lg p-4`}
      style={{
        backgroundColor: color,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="mb-2">
        <Text> 
          <Icon name={icon} size={24} color="#000" />
        </Text>
      </View>
      <Text className="text-black dark:text-white text-base font-semibold">{title}</Text>
    </TouchableOpacity>
  );
}
