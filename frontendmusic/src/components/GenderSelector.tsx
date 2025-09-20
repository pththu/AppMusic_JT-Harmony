import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface GenderSelectorProps {
  selectedGender: string;
  onSelectGender: (gender: string) => void;
}

export default function GenderSelector({
  selectedGender,
  onSelectGender,
}: GenderSelectorProps) {
  const genders = [
    { key: 'Male', icon: 'person', label: 'Male' },
    { key: 'Female', icon: 'person-outline', label: 'Female' }, // Đã đổi icon cho nữ
    { key: 'Other', icon: 'sync-alt', label: 'Other' }, // Đã đổi icon cho Other
  ];

  return (
    <View className="mb-4">
      <Text className="text-gray-300 mb-2">Gender</Text>
      <View className="flex-row justify-between">
        {genders.map(gender => (
          <TouchableOpacity
            key={gender.key}
            className={`flex-row items-center justify-center flex-1 px-2 py-3 mx-1 rounded-full border ${
              selectedGender === gender.key
                ? 'bg-[#089b0d] border-[#089b0d]'
                : 'bg-transparent border-gray-600'
            }`}
            onPress={() => onSelectGender(gender.key)}
          >
            <Icon
              name={gender.icon}
              size={20}
              color={selectedGender === gender.key ? 'white' : '#888888'}
              className="mr-2"
            />
            <Text
              className={`text-sm font-bold ${
                selectedGender === gender.key ? 'text-white' : 'text-gray-400'
              }`}
            >
              {gender.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
