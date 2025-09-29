import { SettingsContext } from "@/context/SettingsContext";
import { router } from "expo-router"; // Thêm import này
import React, { useContext } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const languages = [
  "International",
  "Telugu",
  "Hindi",
  "Punjabi",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Bengali",
];

export default function MusicLanguageScreen() {
  const settings = useContext(SettingsContext);

  const toggleLanguage = (language: string) => {
    if (!settings) return;
    if (settings.musicLanguages.includes(language)) {
      settings.setMusicLanguages(
        settings.musicLanguages.filter((l) => l !== language)
      );
    } else {
      settings.setMusicLanguages([...settings.musicLanguages, language]);
    }
  };

  return (
    <View className="flex-1 	bg-[#0E0C1F] p-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-xl font-bold">Select Language(s)</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-white text-lg">X</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View className="flex-row flex-wrap justify-between">
          {languages.map((language) => (
            <TouchableOpacity
              key={language}
              className={`w-1/2 p-3 mb-4 rounded-md ${
                settings?.musicLanguages.includes(language)
                  ? "bg-gray-700"
                  : "bg-gray-900"
              }`}
              onPress={() => toggleLanguage(language)}
            >
              <Text className="text-white text-center">{language}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity
        className="bg-gray-700 rounded-md py-3 mt-6 items-center"
        onPress={() => router.back()}
      >
        <Text className="text-white font-semibold text-lg">Done</Text>
      </TouchableOpacity>
    </View>
  );
}
