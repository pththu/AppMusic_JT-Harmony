import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface QualityOptionProps {
  label: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function QualityOption({ label, description, isSelected, onPress }: QualityOptionProps) {
  return (
    <TouchableOpacity
      className="flex-row justify-between items-center py-4 border-b border-gray-700"
      onPress={onPress}
    >
      <View>
        <Text className="text-white text-lg">{label}</Text>
        <Text className="text-gray-400">{description}</Text>
      </View>
      <View>
        {isSelected ? (
          <View className="w-5 h-5 rounded-full border-2 border-white bg-white" />
        ) : (
          <View className="w-5 h-5 rounded-full border-2 border-white" />
        )}
      </View>
    </TouchableOpacity>
  );
}
