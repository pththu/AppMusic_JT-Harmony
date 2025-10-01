import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface GenderSelectorProps {
  selectedGender: string;
  onSelectGender: (gender: string) => void;
}

export default function GenderSelector({ selectedGender, onSelectGender }: GenderSelectorProps) {
  const genders = [
    { key: 'Male', icon: 'person', label: 'Nam' },
    { key: 'Female', icon: 'person', label: 'Nữ' },
    // { key: 'Other', icon: 'person-outline', label: 'Khác' },
  ];

  return (
    <View className="mb-4">
      <Text className="text-gray-300 mb-2">Giới tính</Text>
      <View className="flex-row justify-around">
        {genders.map((gender) => (
          <TouchableOpacity
            key={gender.key}
            className={`flex-row items-center px-4 py-3 rounded-full ${
              selectedGender === gender.key ? 'bg-green-600' : 'bg-gray-700'
            }`}
            onPress={() => onSelectGender(gender.key)}
          >
            <Icon name={gender.icon} size={20} color="white" className="mr-2" />
            <Text className="text-white">{gender.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
