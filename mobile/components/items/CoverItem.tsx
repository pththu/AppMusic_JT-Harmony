import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useNavigate } from "@/hooks/useNavigate";
import { useAudioPlayer } from "expo-audio";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { voteCover } from "../../services/coverService";

const { width: screenWidth } = Dimensions.get("window");
const MEDIA_WIDTH = screenWidth - 32;
const MEDIA_HEIGHT = MEDIA_WIDTH * 0.65;
const AUDIO_HEIGHT = 160;

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
    if (count >= 1) return `${count} ${interval.label} trước`;
  }
  return "vừa xong";
};

const formatDuration = (milliseconds: number) => {
  if (!milliseconds) return "0:00";
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
  onCommentPress,
  onSharePress,
  onVoteCountPress,
  commentCount,
  shareCount,
}) => {
  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const { error } = useCustomAlert();

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [heartCount, setHeartCount] = useState(initialHeartCount);
  
  // State quản lý playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const mediaSource = useMemo(() => {
    return Array.isArray(fileUrl) ? fileUrl[0] : fileUrl;
  }, [fileUrl]);

  const mediaType = useMemo(() => {
    if (!mediaSource) return null;
    const extension = mediaSource.split(".").pop()?.toLowerCase();
    const videoExtensions = ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"];
    return videoExtensions.includes(extension || "") ? "video" : "audio";
  }, [mediaSource]);

  // --- VIDEO PLAYER SETUP ---
  const videoPlayer = useVideoPlayer(mediaType === "video" ? mediaSource : null, (player) => {
    player.loop = false;
    // player.muted = false; // Mặc định thường là false, có thể bỏ
  });

  // Tối ưu hóa Listener cho Video
  useEffect(() => {
    if (mediaType === "video" && videoPlayer) {
      // 1. Lắng nghe trạng thái Playing thay đổi
      const playingSubscription = videoPlayer.addListener("playingChange", (payload) => {
        setIsPlaying(payload.isPlaying);
      });

      // 2. Lắng nghe Playback kết thúc
      const playToEndSubscription = videoPlayer.addListener("playToEnd", () => {
        setIsPlaying(false);
        videoPlayer.seekBy(-videoPlayer.duration); // Reset về đầu
        // videoPlayer.pause(); // expo-video thường tự pause khi hết, nhưng gọi thêm cho chắc
      });

      // 3. Cập nhật tiến trình (dùng setInterval nhẹ hơn là listener statusChange liên tục cho mỗi frame)
      const interval = setInterval(() => {
        if (videoPlayer.playing) { // Chỉ update khi đang chạy
           setPosition(videoPlayer.currentTime * 1000);
           // Duration video thường không đổi, set 1 lần hoặc check nếu cần
           if (videoPlayer.duration > 0 && duration === 0) {
              setDuration(videoPlayer.duration * 1000);
           }
        }
      }, 500); 

      return () => {
        playingSubscription.remove();
        playToEndSubscription.remove();
        clearInterval(interval);
      };
    }
  }, [videoPlayer, mediaType]); // Bỏ duration khỏi dep array để tránh loop

  // --- AUDIO PLAYER SETUP ---
  const audioPlayer = useAudioPlayer(mediaType === "audio" ? mediaSource : null);

  useEffect(() => {
    if (mediaType === "audio" && audioPlayer) {
      setIsPlaying(audioPlayer.playing);
      if (audioPlayer.duration) setDuration(audioPlayer.duration * 1000);

      const interval = setInterval(() => {
        // Chỉ update position khi đang play để tối ưu
        if (audioPlayer.playing) {
           setPosition(audioPlayer.currentTime * 1000);
        }
        // Đồng bộ lại trạng thái playing (fallback)
        if (audioPlayer.playing !== isPlaying) {
           setIsPlaying(audioPlayer.playing);
        }
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [audioPlayer, mediaType, isPlaying]); // Thêm isPlaying vào dep để check diff

  // --- ACTION HANDLER ---
  const handleMediaControl = () => {
    if (mediaType === "video" && videoPlayer) {
      if (videoPlayer.playing) {
        videoPlayer.pause();
        // UI sẽ tự cập nhật nhờ listener 'playingChange' ở trên
      } else {
        videoPlayer.play();
        // Nếu video đã kết thúc, replay lại
        if (videoPlayer.currentTime >= videoPlayer.duration) {
            videoPlayer.replay();
        }
      }
    } else if (mediaType === "audio" && audioPlayer) {
      if (audioPlayer.playing) {
        audioPlayer.pause();
        setIsPlaying(false); // Audio hook đôi khi cập nhật chậm, set tay cho nhanh
      } else {
        audioPlayer.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVote = async () => {
    const prevIsLiked = isLiked;
    const prevHeartCount = heartCount;
    setIsLiked(!isLiked);
    setHeartCount(heartCount + (isLiked ? -1 : 1));
    try {
      const result = await voteCover(id);
      if ("isLiked" in result) {
        setIsLiked(result.isLiked);
        setHeartCount(result.heartCount);
      }
    } catch (err) {
      error("Lỗi", "Không thể vote cover.");
      setIsLiked(prevIsLiked);
      setHeartCount(prevHeartCount);
    }
  };

  const heartColor = isLiked ? "rgb(239, 68, 68)" : colorScheme === "dark" ? "rgb(156, 163, 175)" : "rgb(107, 114, 128)";

  // --- RENDER ---
  return (
    <View className="bg-white dark:bg-[#171431] p-4 my-2 mx-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      
      {/* HEADER ... (Giữ nguyên) */}
      <View className="flex-row items-center mb-3">
        <TouchableOpacity onPress={() => onUserPress(userId)}>
          <Image
            source={{ uri: User?.avatarUrl || "https://via.placeholder.com/150" }}
            className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-600"
          />
        </TouchableOpacity>
        <View className="ml-3 flex-1">
          <Text className="font-bold text-lg text-black dark:text-white">{User?.fullName}</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-xs">{formatTimeAgo(uploadedAt)}</Text>
        </View>
        <View className={`px-2 py-1 rounded-md flex-row items-center ${mediaType === 'video' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
          <Icon name={mediaType === 'video' ? 'video' : 'mic'} size={12} color={mediaType === 'video' ? '#3B82F6' : '#A855F7'} />
          <Text className={`ml-1 text-[10px] font-bold uppercase ${mediaType === 'video' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
            {mediaType === 'video' ? 'Video' : 'Vocal'}
          </Text>
        </View>
      </View>

      {/* SONG INFO & CONTENT ... (Giữ nguyên) */}
      {OriginalSong && (
        <Pressable onPress={() => { }} className="mb-3">
          <Text className="text-sm text-gray-800 dark:text-gray-200">
            Cover bài: <Text className="font-bold text-emerald-600 dark:text-emerald-400">{OriginalSong.name}</Text>
          </Text>
        </Pressable>
      )}
      {content && (
        <Text className="text-base text-gray-800 dark:text-gray-300 mb-3 leading-6">{content}</Text>
      )}

      {/* MEDIA PLAYER */}
      {mediaSource && (
        <View className="mb-4 rounded-xl overflow-hidden bg-black bg-opacity-5 dark:bg-black/20">
          
          {/* ----- VIDEO ----- */}
          {mediaType === "video" ? (
            <View className="relative justify-center items-center bg-black">
              <VideoView
                player={videoPlayer}
                style={{ width: MEDIA_WIDTH, height: MEDIA_HEIGHT }}
                contentFit="contain"
                allowsPictureInPicture
                nativeControls={false} // QUAN TRỌNG: Tắt control gốc để dùng nút custom
              />
              
              {/* Vùng Clickable Toàn Màn Hình */}
              <TouchableOpacity
                className="absolute inset-0 w-full h-full justify-center items-center z-10"
                onPress={handleMediaControl}
                activeOpacity={1} // Không nháy sáng khi click
              >
                {/* Chỉ hiện nút Play khi đang Pause */}
                {!isPlaying && (
                  <View className="w-16 h-16 bg-black/40 rounded-full justify-center items-center border border-white/30 backdrop-blur-md">
                    <Icon name="play" size={32} color="white" style={{ marginLeft: 4 }} />
                  </View>
                )}
              </TouchableOpacity>

              {/* (Optional) Play Icon nhỏ ở góc khi đang chạy để biết là video */}
               {/* <View className="absolute top-2 right-2 z-0"> ... </View> */}
            </View>
          ) : (
            
          /* ----- AUDIO ----- */
            <View className="flex-row p-3 items-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 h-[160px]">
              <View className="relative justify-center items-center mr-4">
                <View className={`w-24 h-24 rounded-full border-4 border-gray-800 dark:border-gray-900 overflow-hidden shadow-lg ${isPlaying ? 'animate-spin-slow' : ''}`}>
                  <Image source={{ uri: User?.avatarUrl || "https://via.placeholder.com/150" }} className="w-full h-full opacity-90" />
                  <View className="absolute top-1/2 left-1/2 w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full -mt-2 -ml-2 z-10" />
                </View>
                <View className="absolute -bottom-2 bg-emerald-500 rounded-full p-1 border-2 border-white dark:border-gray-800">
                  <MaterialIcons name="audiotrack" size={14} color="white" />
                </View>
              </View>

              <View className="flex-1 justify-center space-y-2">
                <View>
                    <Text className="font-semibold text-gray-800 dark:text-gray-100 text-base" numberOfLines={1}>Audio Clip</Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">{User?.fullName}</Text>
                </View>
                
                <View>
                  <View className="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full w-full overflow-hidden">
                    <View className="h-full bg-emerald-500 rounded-full" style={{ width: duration > 0 ? `${(position / duration) * 100}%` : '0%' }} />
                  </View>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">{formatDuration(position)}</Text>
                    <Text className="text-[10px] text-gray-500">{formatDuration(duration)}</Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <TouchableOpacity onPress={handleMediaControl} className="bg-black dark:bg-white rounded-full p-2 mr-3">
                    <Icon name={isPlaying ? "pause" : "play"} size={20} color={colorScheme === 'dark' ? 'black' : 'white'} style={isPlaying ? {} : { marginLeft: 2 }} />
                  </TouchableOpacity>
                  <Text className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {isPlaying ? "Đang phát..." : "Nghe thử"}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* FOOTER ACTIONS ... (Giữ nguyên) */}
      <View className="flex-row justify-between items-center py-2 border-t border-gray-100 dark:border-gray-800">
        <View className="flex-1 flex-row space-x-6 justify-between">
          <TouchableOpacity onPress={handleVote} className="flex-row items-center space-x-1">
            <Icon name={isLiked ? "heart" : "heart"} size={20} color={heartColor} />
            <Text className={`text-sm ${isLiked ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
              {heartCount > 0 ? heartCount : 'Thích'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCommentPress} className="flex-row items-center space-x-1">
            <Icon name="message-circle" size={20} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {commentCount > 0 ? commentCount : 'Bình luận'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSharePress} className="flex-row items-center space-x-1">
            <Icon name="share-2" size={20} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CoverItem;