import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "@/components/ThemeContext";


// Cập nhật để hiển thị trên hai cột
const InfoRow = ({ label, value }) => (
  <View className="flex-row mb-4">
    <Text className="text-gray-600 dark:text-gray-400 text-lg w-28">{label}</Text>
    <Text className="text-black dark:text-white text-base flex-1">
      {value || "Không có thông tin"}
    </Text>
  </View>
);

// Cập nhật để hiển thị trên hai cột
const LinkRow = ({ label, url }) => {
  if (!url) {
    return <InfoRow label={label} value="Không có thông tin" />;
  }
  return (
    <View className="flex-row mb-4">
      <Text className="text-gray-600 dark:text-gray-400 text-x1 w-28">{label}</Text>
      <TouchableOpacity onPress={() => Linking.openURL(url)} className="flex-1">
        <Text className="text-blue-600 dark:text-blue-400 text-base" numberOfLines={1}>
          {url}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function SongInfoScreen() {
  const params = useLocalSearchParams();
  const song = JSON.parse(params.song as string);

  // Ép kiểu (type assertion) để đảm bảo song có đầy đủ thuộc tính

  const { theme } = useTheme();
  const primaryIconColor = theme === 'dark' ? 'white' : 'black';

  return (
    <View className="flex-1 bg-white dark:bg-[#0E0C1F] px-4 pt-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity onPress={() => router.back()}>
          {/* Thay đổi icon quay lại */}
          <Ionicons name="chevron-down" size={28} color={primaryIconColor} />
        </TouchableOpacity>
        {/* Cập nhật tiêu đề */}
        <Text className="text-black dark:text-white text-2xl font-bold flex-1 text-center">
          Information
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title */}
        <InfoRow label="Title" value={song.name} />

        {/* General Info */}
        <InfoRow
          label="Artists"
          value={song.artists?.map((a) => a).join(", ")}
        />
        <InfoRow label="Album" value={song.album} />
        {/* <InfoRow label="Itag" value={song.itag} />
        <InfoRow label="Mime Type" value={song.mimeType} />
        <InfoRow label="Bitrate" value={song.bitrate} /> */}

        {/* Links */}
        <LinkRow label="YouTube URL" url={song.externalUrl} />
        {/* <LinkRow label="Download URL" url={song.downloadUrl} /> */}

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
