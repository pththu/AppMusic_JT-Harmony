import QualityOption from "@/components/QualityOption";
import { SettingsContext } from "@/context/SettingsContext";
import { router } from "expo-router";
import React, { useContext } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const qualities = [
  { label: "Auto", description: "Based on Network Speed" },
  { label: "HD", description: "320/256 kbps" },
  { label: "High", description: "128 kbps" },
  { label: "Medium", description: "64 kbps" },
];

export default function DownloadQualityScreen() {
  const settings = useContext(SettingsContext);

  const handleSelect = (quality: string) => {
    if (!settings) return;
    settings.setDownloadQuality(quality);
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0E0C1F] p-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-black dark:text-white text-xl font-bold">
          Select Download Quality
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-black dark:text-white text-lg">X</Text>
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
        className="bg-gray-300 dark:bg-gray-700 rounded-md py-3 mt-6 items-center"
        onPress={() => router.back()}
      >
        <Text className="text-black dark:text-white font-semibold text-lg">Done</Text>
      </TouchableOpacity>
    </View>
  );
}
