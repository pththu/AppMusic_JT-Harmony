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

// Bổ sung: Định nghĩa lại type Song để sử dụng nội bộ trong file này
interface Song {
  id: string;
  title: string;
  artists: { name: string; image: string }[];
  image: string;
  album?: string;
  itag?: string;
  mimeType?: string;
  bitrate?: string;
  youtubeUrl?: string;
  downloadUrl?: string;
}

// Cập nhật để hiển thị trên hai cột
const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <View className="flex-row mb-4">
    <Text className="text-gray-600 dark:text-gray-400 text-lg w-28">{label}</Text>
    <Text className="text-black dark:text-white text-base flex-1">
      {value || "Không có thông tin"}
    </Text>
  </View>
);

// Cập nhật để hiển thị trên hai cột
const LinkRow = ({ label, url }: { label: string; url?: string }) => {
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
  console.log(params.song);
  const song = JSON.parse(params.song as string);
  console.log(song);

  // Ép kiểu (type assertion) để đảm bảo song có đầy đủ thuộc tính
  const typedSong = song as Song;

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
        <InfoRow label="Title" value={typedSong.title} />

        {/* General Info */}
        <InfoRow
          label="Artists"
          value={typedSong.artists?.map((a) => a.name).join(", ")}
        />
        <InfoRow label="Album" value={typedSong.album} />
        <InfoRow label="Itag" value={typedSong.itag} />
        <InfoRow label="Mime Type" value={typedSong.mimeType} />
        <InfoRow label="Bitrate" value={typedSong.bitrate} />

        {/* Links */}
        <LinkRow label="YouTube URL" url={typedSong.youtubeUrl} />
        <LinkRow label="Download URL" url={typedSong.downloadUrl} />

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
