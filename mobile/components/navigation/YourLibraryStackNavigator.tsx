import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import DownloadsScreen from "../../app/(screens)/DownloadsScreen";
import QueueScreen from "../../app/(screens)/QueueScreen";
import SongInfoScreen from "../../app/(screens)/SongInfoScreen";
import SongScreen from "../../app/(screens)/SongScreen";
import YourLibraryScreen from "../../app/(tabs)/YourLibraryScreen";

// Định nghĩa kiểu dữ liệu cho một nghệ sĩ
interface Artist {
  name: string;
  image: string;
}

// Định nghĩa kiểu dữ liệu cho một bài hát
interface Song {
  id: string;
  title: string;
  artists: Artist[]; // Sửa từ `artist: string;` thành `artists: Artist[];`
  image: string;
  // Bạn có thể thêm các thuộc tính khác của bài hát vào đây nếu cần
  album?: string;
  itag?: string;
  mimeType?: string;
  bitrate?: string;
  youtubeUrl?: string;
  downloadUrl?: string;
}

// Định nghĩa các tham số cho các màn hình trong stack
export type YourLibraryStackParamList = {
  YourLibraryScreen: undefined;
  DownloadsScreen: undefined;
  SongScreen: { song: Song }; // Sửa kiểu dữ liệu của tham số `song`
  QueueScreen: { nowPlaying: Song; queue: Song[] }; // Bổ sung tham số cho QueueScreen
  SongInfoScreen: { song: Song }; // Thêm màn hình thông tin bài hát
};

const Stack = createNativeStackNavigator<YourLibraryStackParamList>();

export default function YourLibraryStackNavigator() {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="YourLibraryScreen" component={YourLibraryScreen} />
      <Stack.Screen name="DownloadsScreen" component={DownloadsScreen} />
      <Stack.Screen name="SongScreen" component={SongScreen} />
      <Stack.Screen name="QueueScreen" component={QueueScreen} />
      <Stack.Screen name="SongInfoScreen" component={SongInfoScreen} />
    </Stack.Navigator>
  );
}
