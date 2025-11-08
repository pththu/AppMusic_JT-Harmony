import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome"; // Import thêm FontAwesome cho icon Share
// import { Video, Audio } from "expo-av"; // Temporarily commented out
import { voteCover } from "../../services/coverApi";
import { useNavigate } from "@/hooks/useNavigate";
import useAuthStore from "@/store/authStore";

// Lấy kích thước màn hình
const { width: screenWidth } = Dimensions.get("window");
const MEDIA_WIDTH = screenWidth - 32;
const MEDIA_HEIGHT = MEDIA_WIDTH * 0.75;

// Hàm format time (giữ nguyên)
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = [
    { label: "năm", seconds: 31536000 },
    { label: "tháng", seconds: 2592000 },
    { label: "ngày", seconds: 86400 },
    { label: "giờ", seconds: 3600 },
    { label: "phút", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label} trước`;
    }
  }
  return "vừa xong";
};

interface CoverItemProps {
  id: string;
  userId: number;
  User: { username: string; avatarUrl: string; fullName: string };
  uploadedAt: string;
  content: string;
  fileUrl: string[] | string;
  heartCount: number;
  isLiked: boolean;
  originalSongId: number;
  OriginalSong?: {
    id: number;
    name: string;
    spotifyId: string;
    artists?: { id: number; name: string }[];
  };
  onUserPress: (userId: number) => void;
  onRefresh?: () => void;
  // Thêm props cho các actions khác để có thể xử lý logic từ bên ngoài
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  onVoteCountPress?: (coverId: string) => void;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  isLikedPost?: boolean;
}

const CoverItem: React.FC<CoverItemProps> = ({
  id,
  userId,
  User,
  uploadedAt,
  content,
  fileUrl,
  heartCount: initialHeartCount,
  isLiked: initialIsLiked,
  originalSongId,
  OriginalSong,
  onUserPress,
  onRefresh,
  onCommentPress, // Sử dụng prop này
  onSharePress, // Sử dụng prop này
  onVoteCountPress,
  commentCount,
  shareCount,
}) => {
  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [heartCount, setHeartCount] = useState(initialHeartCount);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  useEffect(() => {
    setHeartCount(initialHeartCount);
  }, [initialHeartCount]);

  const handleVote = async () => {
    const prevIsLiked = isLiked;
    const prevHeartCount = heartCount;

    // Cập nhật UI tạm thời
    setIsLiked(!isLiked);
    setHeartCount(heartCount + (isLiked ? -1 : 1));

    try {
      const result = await voteCover(id);
      if ("isLiked" in result && "heartCount" in result) {
        // Cập nhật UI với kết quả từ API
        setIsLiked(result.isLiked);
        setHeartCount(result.heartCount);
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      console.error("Lỗi khi vote cover:", error);
      Alert.alert("Lỗi", "Không thể vote cover.");
      // Hoàn tác nếu có lỗi
      setIsLiked(prevIsLiked);
      setHeartCount(prevHeartCount);
    }
  };

  const handlePlayPause = async () => {
    Alert.alert(
      "Thông báo",
      "Media playback tạm thời bị tắt để tránh lỗi expo-av."
    );
  };

  const handleSongPress = () => {
    if (originalSongId) {
      navigate("SongScreen", { songId: originalSongId });
    }
  };

  const displayTime = formatTimeAgo(uploadedAt);

  // Màu sắc cho Icon Like (để nổi bật hơn)
  const heartColor = isLiked
    ? "rgb(239, 68, 68)"
    : colorScheme === "dark"
      ? "rgb(156, 163, 175)"
      : "rgb(107, 114, 128)"; // Màu đỏ hoặc xám

  return (
    // Điều chỉnh đổ bóng và màu nền
    <View className="bg-white dark:bg-[#171431] p-4 mb-4 rounded-xl shadow-lg shadow-gray-400 dark:shadow-black/70 border border-gray-100 dark:border-gray-800">
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <TouchableOpacity
          onPress={() => onUserPress(userId)}
          className="flex-row items-center"
        >
          <Image
            source={{
              uri: User?.avatarUrl || "https://via.placeholder.com/150",
            }}
            // Tăng kích thước avatar
            className="w-12 h-12 rounded-full border-2 border-indigo-500"
          />
        </TouchableOpacity>

        <View className="ml-3 flex-col flex-1">
          <Text className="font-extrabold text-lg text-black dark:text-white">
            {User?.fullName}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {displayTime}
          </Text>
        </View>

        {/* Cover tag */}
        <View className="ml-2 bg-indigo-500 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-bold uppercase">Cover</Text>
        </View>
      </View>

      {/* Original Song Link */}
      {OriginalSong && (
        <TouchableOpacity
          onPress={handleSongPress}
          className="mb-3 p-2 border-l-4 border-indigo-500 bg-gray-100 dark:bg-gray-700 rounded-md" // Hiệu ứng nổi bật
        >
          <Text className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">
            {OriginalSong.name} -{" "}
            {OriginalSong.artists?.map((artist) => artist.name).join(", ")}
          </Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      {content && (
        <Text className="text-base text-black dark:text-gray-300 mb-3 leading-relaxed">
          {content}
        </Text>
      )}

      {/* Media Player */}
      {fileUrl && (
        <View className="mb-3 shadow-xl dark:shadow-black/70">
          <TouchableOpacity onPress={handlePlayPause} className="relative">
            {/* Temporarily show image only */}
            <Image
              source={{ uri: Array.isArray(fileUrl) ? fileUrl[0] : fileUrl }}
              style={{ width: MEDIA_WIDTH, height: MEDIA_HEIGHT }}
              className="rounded-xl" // Bo góc cho media
            />
            {!isPlaying && (
              <View className="absolute inset-0 justify-center items-center bg-black/30 rounded-xl">
                {/* Thiết kế nút play hiện đại hơn */}
                <View className="p-4 bg-white/30 rounded-full border-2 border-white">
                  <Icon
                    name="play"
                    size={30}
                    color="white"
                    style={{ marginLeft: 5 }}
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Interaction Stats Bar */}
      <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        {/* KHỐI TRÁI: Thích  */}
        <View className="flex-row items-center">
          {/* Thích */}
          <TouchableOpacity
            onPress={() => onVoteCountPress?.(id)}
            disabled={heartCount === 0} // Chỉ cho phép nhấn nếu có lượt thích
            className="p-1 -ml-1"
          >
            <Text className="text-xs text-gray-500 dark:text-gray-400 font-bold">
              {heartCount} Thích
            </Text>
          </TouchableOpacity>
        </View>

        {/* KHỐI PHẢI: Chia sẻ */}
        <View className="flex-row items-center ">
          {/* Bình luận */}
          <Text className="text-xs text-gray-500 dark:text-gray-400 px-2">
            {commentCount || 0} Bình luận
          </Text>
          {/* Chia sẻ */}
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {shareCount || 0} Chia sẻ
          </Text>
        </View>
      </View>

      {/* Interaction Buttons */}
      <View className="flex-row justify-around">
        {/* NÚT LIKE (TIM) */}
        <TouchableOpacity
          onPress={handleVote}
          className="flex-row items-center p-2 rounded-full"
        >
          <Icon
            name={isLiked ? "heart" : "heart"}
            size={22}
            color={heartColor}
          />
          <Text
            className={`ml-2 text-sm ${isLiked ? "text-red-400 font-bold" : colorScheme === "dark" ? "text-gray-400" : "text-black"}`}
          >
            Thích
          </Text>
        </TouchableOpacity>

        {/* NÚT BÌNH LUẬN */}
        <TouchableOpacity
          onPress={onCommentPress}
          className="flex-row items-center p-2 rounded-full"
        >
          <Icon
            name="message-circle"
            size={22}
            color={colorScheme === "dark" ? "#6B7280" : "#4B5563"}
          />
          <Text
            className={`ml-2 text-sm ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}
          >
            Bình luận
          </Text>
        </TouchableOpacity>

        {/* NÚT CHIA SẺ */}
        <TouchableOpacity
          onPress={onSharePress}
          className="flex-row items-center p-2 rounded-full"
        >
          <Icon
            name="share-2"
            size={22}
            color={colorScheme === "dark" ? "#6B7280" : "#4B5563"}
          />
          <Text
            className={`ml-2 text-sm ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}
          >
            Chia sẻ
          </Text>
        </TouchableOpacity>
      </View>

      {/* Có thể thêm hiển thị số lượng bình luận nếu có prop commentCount */}
      {/* <Text className="text-gray-500 dark:text-gray-400 text-xs mt-2 ml-4">
        {commentCount || 0} bình luận
      </Text> */}
    </View>
  );
};

export default CoverItem;
