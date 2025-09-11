import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SettingsContext } from '../context/SettingsContext';

const qualities = [
  { label: 'Auto', description: 'Based on Network Speed' },
  { label: 'HD', description: '320/256 kbps' },
  { label: 'High', description: '128 kbps' },
  { label: 'Medium', description: '64 kbps' },
];

export default function DownloadQualityScreen({ navigation }: { navigation: any }) {
  const settings = useContext(SettingsContext);

  const handleSelect = (quality: string) => {
    if (!settings) return;
    settings.setDownloadQuality(quality);
  };

  return (
    <View className="flex-1 bg-black p-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-xl font-bold">Select Download Quality</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-white text-lg">X</Text>
        </TouchableOpacity>
      </View>

      {qualities.map((quality) => (
        <TouchableOpacity
          key={quality.label}
          className="flex-row justify-between items-center py-4 border-b border-gray-700"
          onPress={() => handleSelect(quality.label)}
        >
          <View>
            <Text className="text-white text-lg">{quality.label}</Text>
            <Text className="text-gray-400">{quality.description}</Text>
          </View>
          <View>
            {settings?.downloadQuality === quality.label ? (
              <View className="w-5 h-5 rounded-full border-2 border-white bg-white" />
            ) : (
              <View className="w-5 h-5 rounded-full border-2 border-white" />
            )}
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        className="bg-gray-700 rounded-md py-3 mt-6 items-center"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-white font-semibold text-lg">Done</Text>
      </TouchableOpacity>
    </View>
  );
}
