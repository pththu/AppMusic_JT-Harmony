import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface HeaderBackButtonProps {
  onPress: () => void;
}

export default function HeaderBackButton({ onPress }: HeaderBackButtonProps) {
  return (
    <TouchableOpacity className="p-3" onPress={onPress}>
      <Icon name="arrow-back" size={24} color="white" />
    </TouchableOpacity>
  );
}
