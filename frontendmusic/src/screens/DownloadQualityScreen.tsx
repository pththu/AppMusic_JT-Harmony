import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SettingsContext } from '../context/SettingsContext';
import QualityOption from '../components/QualityOption';

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
    <View className="flex-1  bg-[#0E0C1F] p-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-xl font-bold">Select Download Quality</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-white text-lg">X</Text>
        </TouchableOpacity>
      </View>

      {qualities.map((quality) => (
        <QualityOption
          key={quality.label}
          label={quality.label}
          description={quality.description}
          isSelected={settings?.downloadQuality === quality.label}
          onPress={() => handleSelect(quality.label)}
        />
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
