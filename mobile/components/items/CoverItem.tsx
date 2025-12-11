// import React, { useEffect, useRef, useState } from "react";
// import {
//   Alert,
//   Dimensions,
//   Image,
//   Text,
//   TouchableOpacity,
//   View,
//   useColorScheme,
// } from "react-native";
// import Icon from "react-native-vector-icons/Feather";
// // import FontAwesome from "react-native-vector-icons/FontAwesome"; // Import thêm FontAwesome cho icon Share
// // import { Video, Audio } from "expo-av"; // Temporarily commented out
// import { useNavigate } from "@/hooks/useNavigate";
// import useAuthStore from "@/store/authStore";
// import { voteCover } from "../../services/coverService";


// // Lấy kích thước màn hình
// const { width: screenWidth } = Dimensions.get("window");
// const MEDIA_WIDTH = screenWidth - 32;
// const MEDIA_HEIGHT = MEDIA_WIDTH * 0.75;

// // Hàm format time (giữ nguyên)
// const formatTimeAgo = (dateString: string): string => {
//   const date = new Date(dateString);
//   const now = new Date();
//   const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

//   const intervals = [
//     { label: "năm", seconds: 31536000 },
//     { label: "tháng", seconds: 2592000 },
//     { label: "ngày", seconds: 86400 },
//     { label: "giờ", seconds: 3600 },
//     { label: "phút", seconds: 60 },
//   ];

//   for (const interval of intervals) {
//     const count = Math.floor(seconds / interval.seconds);
//     if (count >= 1) {
//       return `${count} ${interval.label} trước`;
//     }
//   }
//   return "vừa xong";
// };

// interface CoverItemProps {
//   id: string;
//   userId: number;
//   User: { username: string; avatarUrl: string; fullName: string };
//   uploadedAt: string;
//   content: string;
//   fileUrl: string[] | string;
//   heartCount: number;
//   isLiked: boolean;
//   originalSongId: number;
//   OriginalSong?: {
//     id: number;
//     name: string;
//     spotifyId: string;
//     artists?: { id: number; name: string }[];
//   };
//   onUserPress: (userId: number) => void;
//   onRefresh?: () => void;
//   // Thêm props cho các actions khác để có thể xử lý logic từ bên ngoài
//   onLikePress?: () => void;
//   onCommentPress?: () => void;
//   onSharePress?: () => void;
//   onVoteCountPress?: (coverId: string) => void;
//   likeCount?: number;
//   commentCount?: number;
//   shareCount?: number;
//   isLikedPost?: boolean;
// }

// const CoverItem: React.FC<CoverItemProps> = ({
//   id,
//   userId,
//   User,
//   uploadedAt,
//   content,
//   fileUrl,
//   heartCount: initialHeartCount,
//   isLiked: initialIsLiked,
//   originalSongId,
//   OriginalSong,
//   onUserPress,
//   onRefresh,
//   onCommentPress, // Sử dụng prop này
//   onSharePress, // Sử dụng prop này
//   onVoteCountPress,
//   commentCount,
//   shareCount,
// }) => {
//   const colorScheme = useColorScheme();
//   const { navigate } = useNavigate();
//   const user = useAuthStore((state) => state.user);

//   const [isLiked, setIsLiked] = useState(initialIsLiked);
//   const [heartCount, setHeartCount] = useState(initialHeartCount);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const videoRef = useRef(null);
//   const audioRef = useRef(null);

//   useEffect(() => {
//     setIsLiked(initialIsLiked);
//   }, [initialIsLiked]);

//   useEffect(() => {
//     setHeartCount(initialHeartCount);
//   }, [initialHeartCount]);

//   const handleVote = async () => {
//     const prevIsLiked = isLiked;
//     const prevHeartCount = heartCount;

//     // Cập nhật UI tạm thời
//     setIsLiked(!isLiked);
//     setHeartCount(heartCount + (isLiked ? -1 : 1));

//     try {
//       const result = await voteCover(id);
//       if ("isLiked" in result && "heartCount" in result) {
//         // Cập nhật UI với kết quả từ API
//         setIsLiked(result.isLiked);
//         setHeartCount(result.heartCount);
//       } else {
//         throw new Error("Invalid response");
//       }
//     } catch (error) {
//       console.error("Lỗi khi vote cover:", error);
//       Alert.alert("Lỗi", "Không thể vote cover.");
//       // Hoàn tác nếu có lỗi
//       setIsLiked(prevIsLiked);
//       setHeartCount(prevHeartCount);
//     }
//   };

//   const handlePlayPause = async () => {
//     Alert.alert(
//       "Thông báo",
//       "Media playback tạm thời bị tắt để tránh lỗi expo-av."
//     );
//   };

//   const handleSongPress = () => {
//     if (originalSongId) {
//       navigate("SongScreen", { songId: originalSongId });
//     }
//   };

//   const displayTime = formatTimeAgo(uploadedAt);

//   // Màu sắc cho Icon Like (để nổi bật hơn)
//   const heartColor = isLiked
//     ? "rgb(239, 68, 68)"
//     : colorScheme === "dark"
//       ? "rgb(156, 163, 175)"
//       : "rgb(107, 114, 128)"; // Màu đỏ hoặc xám

//   return (
//     // Điều chỉnh đổ bóng và màu nền
//     <View className="bg-white dark:bg-[#171431] p-4 mb-4 rounded-xl shadow-lg shadow-gray-400 dark:shadow-black/70 border border-gray-100 dark:border-gray-800">
//       {/* Header */}
//       <View className="flex-row items-center mb-3">
//         <TouchableOpacity
//           onPress={() => onUserPress(userId)}
//           className="flex-row items-center"
//         >
//           <Image
//             source={{
//               uri: User?.avatarUrl || "https://via.placeholder.com/150",
//             }}
//             // Tăng kích thước avatar
//             className="w-12 h-12 rounded-full border-2 border-emerald-400"
//           />
//         </TouchableOpacity>

//         <View className="ml-3 flex-col flex-1">
//           <Text className="font-extrabold text-lg text-black dark:text-white">
//             {User?.fullName}
//           </Text>
//           <Text className="text-gray-500 dark:text-gray-400 text-sm">
//             {displayTime}
//           </Text>
//         </View>

//         {/* Cover tag */}
//         <View className="ml-2 bg-emerald-500 px-3 py-1 rounded-full">
//           <Text className="text-white text-xs font-bold uppercase">Cover</Text>
//         </View>
//       </View>

//       {/* Original Song Link */}
//       {OriginalSong && (
//         <TouchableOpacity
//           onPress={handleSongPress}
//           className="mb-3 p-2 border-l-4 border-emerald-500 bg-gray-100 dark:bg-gray-700 rounded-md" // Hiệu ứng nổi bật
//         >
//           <Text className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
//             {OriginalSong.name} -{" "}
//             {OriginalSong?.artists?.map((artist) => artist.name).join(", ")}
//           </Text>
//         </TouchableOpacity>
//       )}

//       {/* Content */}
//       {content && (
//         <Text className="text-base text-black dark:text-gray-300 mb-3 leading-relaxed">
//           {content}
//         </Text>
//       )}

//       {/* Media Player */}
//       {fileUrl && (
//         <View className="mb-3 shadow-xl dark:shadow-black/70">
//           <TouchableOpacity onPress={handlePlayPause} className="relative">
//             {/* Temporarily show image only */}
//             <Image
//               source={{ uri: Array.isArray(fileUrl) ? fileUrl[0] : fileUrl }}
//               style={{ width: MEDIA_WIDTH, height: MEDIA_HEIGHT }}
//               className="rounded-xl" // Bo góc cho media
//             />
//             {!isPlaying && (
//               <View className="absolute inset-0 justify-center items-center bg-black/30 rounded-xl">
//                 {/* Thiết kế nút play hiện đại hơn */}
//                 <View className="p-4 bg-white/30 rounded-full border-2 border-white">
//                   <Icon
//                     name="play"
//                     size={30}
//                     color="white"
//                     style={{ marginLeft: 5 }}
//                   />
//                 </View>
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Interaction Stats Bar */}
//       <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
//         {/* KHỐI TRÁI: Thích  */}
//         <View className="flex-row items-center">
//           {/* Thích */}
//           <TouchableOpacity
//             onPress={() => onVoteCountPress?.(id)}
//             disabled={heartCount === 0} // Chỉ cho phép nhấn nếu có lượt thích
//             className="p-1 -ml-1"
//           >
//             <Text className="text-xs text-gray-500 dark:text-gray-400 font-bold">
//               {heartCount} Thích
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* KHỐI PHẢI: Chia sẻ */}
//         <View className="flex-row items-center ">
//           {/* Bình luận */}
//           <Text className="text-xs text-gray-500 dark:text-gray-400 px-2">
//             {commentCount || 0} Bình luận
//           </Text>
//           {/* Chia sẻ */}
//           <Text className="text-xs text-gray-500 dark:text-gray-400">
//             {shareCount || 0} Chia sẻ
//           </Text>
//         </View>
//       </View>

//       {/* Interaction Buttons */}
//       <View className="flex-row justify-around">
//         {/* NÚT LIKE (TIM) */}
//         <TouchableOpacity
//           onPress={handleVote}
//           className="flex-row items-center p-2 rounded-full"
//         >
//           <Icon
//             name={isLiked ? "heart" : "heart"}
//             size={22}
//             color={heartColor}
//           />
//           <Text
//             className={`ml-2 text-sm ${isLiked ? "text-red-400 font-bold" : colorScheme === "dark" ? "text-gray-400" : "text-black"}`}
//           >
//             Thích
//           </Text>
//         </TouchableOpacity>

//         {/* NÚT BÌNH LUẬN */}
//         <TouchableOpacity
//           onPress={onCommentPress}
//           className="flex-row items-center p-2 rounded-full"
//         >
//           <Icon
//             name="message-circle"
//             size={22}
//             color={colorScheme === "dark" ? "#6B7280" : "#4B5563"}
//           />
//           <Text
//             className={`ml-2 text-sm ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}
//           >
//             Bình luận
//           </Text>
//         </TouchableOpacity>

//         {/* NÚT CHIA SẺ */}
//         <TouchableOpacity
//           onPress={onSharePress}
//           className="flex-row items-center p-2 rounded-full"
//         >
//           <Icon
//             name="share-2"
//             size={22}
//             color={colorScheme === "dark" ? "#6B7280" : "#4B5563"}
//           />
//           <Text
//             className={`ml-2 text-sm ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}
//           >
//             Chia sẻ
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default CoverItem;
import { useNavigate } from "@/hooks/useNavigate";
import useAuthStore from "@/store/authStore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome"; // Import thêm FontAwesome cho icon Share
import { VideoView, useVideoPlayer } from "expo-video";
import * as FileSystem from 'expo-file-system';
import { useAudioPlayer } from "expo-audio";
import { voteCover } from "../../services/coverService";
import { useNavigate } from "@/hooks/useNavigate";
import useAuthStore from "@/store/authStore";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { voteCover } from "../../services/coverService";

// --- IMPORTS CHO MEDIA MỚI ---
import { useAudioPlayer } from "expo-audio";
import { useVideoPlayer, VideoView } from "expo-video";

// Lấy kích thước màn hình
const { width: screenWidth } = Dimensions.get("window");
const MEDIA_WIDTH = screenWidth - 32; // trừ padding
const MEDIA_HEIGHT = MEDIA_WIDTH * 0.75; // Tỉ lệ 4:3

// --- HELPER: FORMAT TIME ---
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

// --- HELPER: CHECK MEDIA TYPE ---
const getMediaType = (url: string): "video" | "audio" | "image" => {
  if (!url) return "image";
  const ext = url.split(".").pop()?.toLowerCase();
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext || "")) return "video";
  if (["mp3", "wav", "m4a", "aac", "flac"].includes(ext || "")) return "audio";
  return "image"; // Fallback
};

// --- COMPONENT CON: VIDEO PLAYER ---
const VideoContent = ({ url }: { url: string }) => {
  const player = useVideoPlayer(url, (player) => {
    player.loop = true;
    // player.play(); // Bỏ comment nếu muốn autoplay (không khuyến khích cho Feed)
  });

  return (
    <View
      style={{ width: MEDIA_WIDTH, height: MEDIA_HEIGHT }}
      className="rounded-xl overflow-hidden bg-black shadow-lg"
    >
      <VideoView
        style={{ width: "100%", height: "100%" }}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain"
      />
    </View>
  );
};

// --- COMPONENT CON: AUDIO PLAYER (CUSTOM UI) ---
const AudioContent = ({ url }: { url: string }) => {
  const player = useAudioPlayer(url);
  const [isPlaying, setIsPlaying] = useState(false);
  const colorScheme = useColorScheme();

  // Đồng bộ trạng thái player với state UI
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlaying(player.playing);
    }, 200);
    return () => clearInterval(interval);
  }, [player]);

  const togglePlay = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!player.playing);
  };

  return (
    <View
      style={{ width: MEDIA_WIDTH }}
      className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl flex-row items-center border border-gray-200 dark:border-gray-700"
    >
      <TouchableOpacity
        onPress={togglePlay}
        className="w-12 h-12 bg-emerald-500 rounded-full justify-center items-center shadow-md"
      >
        <Icon
          name={isPlaying ? "pause" : "play"}
          size={24}
          color="white"
          style={{ marginLeft: isPlaying ? 0 : 2 }}
        />
      </TouchableOpacity>

      <View className="ml-4 flex-1">
        <Text className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
          Audio Clip
        </Text>
        {/* Thanh progress giả lập (Expo Audio chưa cung cấp progress UI native) */}
        <View className="h-1 bg-gray-300 dark:bg-gray-600 rounded-full w-full overflow-hidden">
          <View
            className={`h-full bg-emerald-500 ${isPlaying ? 'w-1/2' : 'w-0'}`}
            style={{ width: isPlaying ? '50%' : '0%' }} // Animation logic cần phức tạp hơn nếu muốn chính xác
          />
        </View>
        <Text className="text-xs text-gray-500 mt-1">
          {isPlaying ? "Đang phát..." : "Nhấn để nghe"}
        </Text>
      </View>

      <Icon name="music" size={20} color={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'} />
    </View>
  );
};

// --- COMPONENT CON: MEDIA SWITCHER ---
// Dùng component này để chọn render Video hoặc Audio dựa trên URL
const MediaContent = ({ fileUrl }: { fileUrl: string | string[] }) => {
  const url = Array.isArray(fileUrl) ? fileUrl[0] : fileUrl;
  const type = getMediaType(url);

  if (type === "video") {
    return <VideoContent url={url} />;
  }
  if (type === "audio") {
    return <AudioContent url={url} />;
  }

  // Fallback Image
  return (
    <Image
      source={{ uri: url }}
      style={{ width: MEDIA_WIDTH, height: MEDIA_HEIGHT }}
      className="rounded-xl bg-gray-200"
      resizeMode="cover"
    />
  );
};

// --- MAIN INTERFACE ---
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
  onRefresh,
  onCommentPress,
  onSharePress,
  onVoteCountPress,
  commentCount,
  shareCount,
}) => {
  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { error } = useCustomAlert();

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [heartCount, setHeartCount] = useState(initialHeartCount);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  
  // Audio player hook
  const audioPlayer = useAudioPlayer(Array.isArray(fileUrl) ? fileUrl[0] : fileUrl);

  // Sync audio player state
  useEffect(() => {
    if (audioPlayer) {
      // Update initial state
      setIsPlaying(audioPlayer.playing);
      
      if (audioPlayer.duration) {
        setDuration(audioPlayer.duration * 1000);
      }
    }
  }, [audioPlayer]);

  // Update position periodically
  useEffect(() => {
    if (audioPlayer && isPlaying) {
      const interval = setInterval(() => {
        if (audioPlayer.currentTime) {
          setPosition(audioPlayer.currentTime * 1000);
        }
      }, 100); // Update every 100ms
      
      return () => clearInterval(interval);
    }
  }, [audioPlayer, isPlaying]);

  // Video player hook
  const videoPlayer = useVideoPlayer(Array.isArray(fileUrl) ? fileUrl[0] : fileUrl, (player) => {
    player.loop = false;
    player.muted = false;
  });

  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  useEffect(() => {
    setHeartCount(initialHeartCount);
  }, [initialHeartCount]);

  const handleVote = async () => {
    const prevIsLiked = isLiked;
    const prevHeartCount = heartCount;

    setIsLiked(!isLiked);
    setHeartCount(heartCount + (isLiked ? -1 : 1));

    try {
      const result = await voteCover(id);
      if ("isLiked" in result && "heartCount" in result) {
        setIsLiked(result.isLiked);
        setHeartCount(result.heartCount);
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      console.error("Lỗi khi vote cover:", error);
      error("Lỗi", "Không thể vote cover.");
      // Hoàn tác nếu có lỗi
      setIsLiked(prevIsLiked);
      setHeartCount(prevHeartCount);
    }
  };

  // Kiểm tra loại file dựa trên extension
  const getMediaType = (url: string): 'video' | 'audio' => {
    const extension = url.split('.').pop()?.toLowerCase();
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    const audioExtensions = ['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a', 'wma'];
    
    if (videoExtensions.includes(extension || '')) {
      return 'video';
    }
    return 'audio';
  };

  // Khởi tạo media player
  const initializeMedia = async () => {
    const mediaUrl = Array.isArray(fileUrl) ? fileUrl[0] : fileUrl;
    if (!mediaUrl) return;
    
    const mediaType = getMediaType(mediaUrl);
    setIsVideo(mediaType === 'video');
    
    if (mediaType === 'audio') {
      try {
        console.log('Audio file detected:', mediaUrl);
        console.log('File URL type:', typeof mediaUrl);
        console.log('File URL length:', mediaUrl.length);
        console.log('File extension:', mediaUrl.split('.').pop());
        console.log('Full URL:', mediaUrl);
        
        // Kiểm tra URL có hợp lệ không
        if (!mediaUrl.startsWith('http')) {
          console.error('Invalid URL format:', mediaUrl);
          return;
        }
        
        // useAudioPlayer hook sẽ tự động xử lý loading
        // console.log('Audio player initialized with useAudioPlayer hook');
        
      } catch (error) {
        console.error('Lỗi khi khởi tạo audio:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
      }
    }
  };

  useEffect(() => {
    initializeMedia();
    
    // Cleanup khi unmount
    return () => {
      // useAudioPlayer hook tự động cleanup
    };
  }, [fileUrl]);

  const handlePlayPause = async () => {
    if (isVideo) {
      // Xử lý video play/pause với expo-video
      if (videoPlayer) {
        try {
          if (isPlaying) {
            videoPlayer.pause();
          } else {
            videoPlayer.play();
          }
          setIsPlaying(!isPlaying);
        } catch (error) {
          console.error('Lỗi khi phát/dừng video:', error);
        }
      }
    } else {
      // Xử lý audio play/pause với expo-audio hook
      if (audioPlayer) {
        try {
          if (isPlaying) {
            audioPlayer.pause();
            setIsPlaying(false);
          } else {
            audioPlayer.play();
            setIsPlaying(true);
          }
        } catch (error) {
          console.error('Lỗi khi phát/dừng audio:', error);
        }
      }
    }
  };

  // Format thởi gian
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Xử lý khi video update status
  useEffect(() => {
    if (videoPlayer) {
      const subscription = videoPlayer.addListener('statusChange', (event) => {
        const { status } = event;
        // Với expo-video API mới, status có thể là object hoặc string
        if (typeof status === 'object' && status !== null) {
          setPosition(status?.currentTime || 0);
          setDuration(status?.duration || 0);
          if (status?.isEnded) {
            setIsPlaying(false);
            setPosition(0);
          }
        }
      });
      
      return () => subscription?.remove();
    }
  }, [videoPlayer]);

  const handleSongPress = () => {
    if (originalSongId) {
      navigate("SongScreen", { songId: originalSongId });
    }
  };

  const displayTime = formatTimeAgo(uploadedAt);

  // Màu sắc cho Icon Like
  const heartColor = isLiked
    ? "rgb(239, 68, 68)"
    : colorScheme === "dark"
      ? "rgb(156, 163, 175)"
      : "rgb(107, 114, 128)";

  return (
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
            className="w-12 h-12 rounded-full border-2 border-emerald-400"
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

        <View className="ml-2 bg-emerald-500 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-bold uppercase">Cover</Text>
        </View>
      </View>

      {/* Original Song Link */}
      {OriginalSong && (
        <TouchableOpacity
          onPress={handleSongPress}
          className="mb-3 p-2 border-l-4 border-emerald-500 bg-gray-100 dark:bg-gray-700 rounded-md"
        >
          <Text className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {OriginalSong.name} -{" "}
            {OriginalSong?.artists?.map((artist) => artist.name).join(", ")}
          </Text>
        </TouchableOpacity>
      )}

      {/* Content Text */}
      {content && (
        <Text className="text-base text-black dark:text-gray-300 mb-3 leading-relaxed">
          {content}
        </Text>
      )}

      {/* MEDIA PLAYER SECTION (ĐÃ CẬP NHẬT) */}
      {fileUrl && (
        <View className="mb-3 shadow-xl dark:shadow-black/70">
          {isVideo ? (
            // Video Player
            <View className="relative">
              <VideoView
                player={videoPlayer}
                style={{ width: MEDIA_WIDTH, height: MEDIA_HEIGHT }}
                className="rounded-xl"
                contentFit="contain"
                allowsFullscreen={true}
                allowsPictureInPicture={true}
              />
              
              {/* Video Controls Overlay */}
              <TouchableOpacity 
                onPress={handlePlayPause} 
                className="absolute inset-0 justify-center items-center rounded-xl"
                activeOpacity={0.8}
              >
                <View className="absolute inset-0 bg-black/30 rounded-xl" />
                {!isPlaying && (
                  <View className="p-4 bg-white/30 rounded-full border-2 border-white">
                    <Icon
                      name="play"
                      size={30}
                      color="white"
                      style={{ marginLeft: 5 }}
                    />
                  </View>
                )}
                {isPlaying && (
                  <View className="p-4 bg-white/30 rounded-full border-2 border-white">
                    <Icon
                      name="pause"
                      size={30}
                      color="white"
                    />
                  </View>
                )}
              </TouchableOpacity>
              
              {/* Video Progress Bar */}
              {duration > 0 && (
                <View className="absolute bottom-2 left-2 right-2">
                  <View className="bg-black/50 rounded-full px-2 py-1">
                    <Text className="text-white text-xs">
                      {formatTime(position)} / {formatTime(duration)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            // Audio Player
            <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
              {/* Audio Visual/Thumbnail */}
              <View className="relative mb-4">
                <Image
                  source={{ uri: 'https://via.placeholder.com/400x300?text=Audio+Cover' }}
                  style={{ width: '100%', height: 200 }}
                  className="rounded-xl"
                  blurRadius={2}
                />
                <View className="absolute inset-0 justify-center items-center bg-black/40 rounded-xl">
                  <TouchableOpacity
                    onPress={handlePlayPause}
                    className="p-4 bg-white/30 rounded-full border-2 border-white"
                    activeOpacity={0.8}
                  >
                    <Icon
                      name={isPlaying ? "pause" : "play"}
                      size={40}
                      color="white"
                      style={isPlaying ? {} : { marginLeft: 5 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Audio Controls */}
              <View className="space-y-3">
                {/* Progress Bar */}
                <View className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                  <View 
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ 
                      width: duration > 0 ? `${(position / duration) * 100}%` : '0%' 
                    }}
                  />
                </View>
                
                {/* Time Display */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    {formatTime(position)}
                  </Text>
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    {formatTime(duration)}
                  </Text>
                </View>
                
                {/* Control Buttons */}
                <View className="flex-row justify-center items-center space-x-6">
                  <TouchableOpacity className="p-2">
                    <Icon
                      name="skip-back"
                      size={24}
                      color={colorScheme === "dark" ? "#9CA3AF" : "#6B7280"}
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handlePlayPause}
                    className="p-3 bg-emerald-500 rounded-full"
                    activeOpacity={0.8}
                  >
                    <Icon
                      name={isPlaying ? "pause" : "play"}
                      size={24}
                      color="white"
                      style={isPlaying ? {} : { marginLeft: 3 }}
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity className="p-2">
                    <Icon
                      name="skip-forward"
                      size={24}
                      color={colorScheme === "dark" ? "#9CA3AF" : "#6B7280"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Interaction Stats Bar */}
      <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-200 dark:border-gray-700 mt-2">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => onVoteCountPress?.(id)}
            disabled={heartCount === 0}
            className="p-1 -ml-1"
          >
            <Text className="text-xs text-gray-500 dark:text-gray-400 font-bold">
              {heartCount} Thích
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center ">
          <Text className="text-xs text-gray-500 dark:text-gray-400 px-2">
            {commentCount || 0} Bình luận
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {shareCount || 0} Chia sẻ
          </Text>
        </View>
      </View>

      {/* Interaction Buttons */}
      <View className="flex-row justify-around">
        <TouchableOpacity
          onPress={handleVote}
          className="flex-row items-center p-2 rounded-full"
        >
          <Icon name="heart" size={22} color={heartColor} />
          <Text
            className={`ml-2 text-sm ${isLiked
              ? "text-red-400 font-bold"
              : colorScheme === "dark"
                ? "text-gray-400"
                : "text-black"
              }`}
          >
            Thích
          </Text>
        </TouchableOpacity>

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
            className={`ml-2 text-sm ${colorScheme === "dark" ? "text-gray-400" : "text-black"
              }`}
          >
            Bình luận
          </Text>
        </TouchableOpacity>

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
            className={`ml-2 text-sm ${colorScheme === "dark" ? "text-gray-400" : "text-black"
              }`}
          >
            Chia sẻ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CoverItem;