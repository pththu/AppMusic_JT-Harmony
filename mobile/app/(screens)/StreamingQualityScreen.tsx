import { SettingsContext } from "@/context/SettingsContext";
import { router } from "expo-router"; // Import router
import React, { useContext } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const qualities = [
  { label: "Auto", description: "Based on Network Speed" },
  { label: "HD", description: "320/256 kbps" },
  { label: "High", description: "128 kbps" },
  { label: "Medium", description: "64 kbps" },
];

export default function StreamingQualityScreen() {
  const settings = useContext(SettingsContext);

  const handleSelect = (quality: string) => {
    if (!settings) return;
    settings.setStreamingQuality(quality);
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0E0C1F] p-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-black dark:text-white text-xl font-bold">
          Select Streaming Quality
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-black dark:text-white text-lg">X</Text>
        </TouchableOpacity>
      </View>

      {qualities.map((quality) => (
        <TouchableOpacity
          key={quality.label}
          className="flex-row justify-between items-center py-4 border-b border-gray-300 dark:border-gray-700"
          onPress={() => handleSelect(quality.label)}
        >
          <View>
            <Text className="text-black dark:text-white text-lg">{quality.label}</Text>
            <Text className="text-gray-600 dark:text-gray-400">{quality.description}</Text>
          </View>
          <View>
            {settings?.streamingQuality === quality.label ? (
              <View className="w-5 h-5 rounded-full border-2 border-black dark:border-white bg-black dark:bg-white" />
            ) : (
              <View className="w-5 h-5 rounded-full border-2 border-black dark:border-white" />
            )}
          </View>
        </TouchableOpacity>
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
