import React from 'react';
import { View, TouchableOpacity, Text, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface GenderSelectorProps {
  selectedGender: string;
  onSelectGender: (gender: string) => void;
}

export default function GenderSelector({ selectedGender, onSelectGender }: GenderSelectorProps) {

  const colorScheme = useColorScheme();

  const genders = [
    { key: 'Male', icon: 'person', label: 'Nam' },
    { key: 'Female', icon: 'person', label: 'Nữ' },
    // { key: 'Other', icon: 'person-outline', label: 'Khác' },
  ];

  return (
    <View className="mb-4">
      <Text className={`${colorScheme === "dark" ? "text-gray-300" : "text-gray-900"} mb-2`}>Giới tính</Text>
      <View className="flex-row justify-around">
        {genders.map((gender) => (
          <TouchableOpacity
            key={gender.key}
            className={`flex-row items-center px-4 py-3 rounded-full 
              ${selectedGender === gender.key ? 'bg-green-600' : `${colorScheme === "dark" ? "bg-gray-700" : "bg-gray-200"}`
              }`}
            onPress={() => onSelectGender(gender.key)}
          >
            <Icon name={gender.icon} size={20} color={`${colorScheme === "dark" ? "white" : "#0E0C1F"}`} className="mr-2" />
            <Text className={` ${colorScheme === "dark" ? "text-gray-300" : "text-gray-900"}`}>{gender.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
