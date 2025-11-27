import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";
import { UploadMultipleFile } from "@/routes/ApiRouter";
import { createNewCover } from "@/services/coverService";
import { fetchTracks } from "@/services/musicService";
import useAuthStore from "@/store/authStore";
import CustomButton from "@/components/custom/CustomButton";
import { useCustomAlert } from "@/hooks/useCustomAlert";

interface UploadCoverModalProps {
  visible: boolean;
  onClose: () => void;
  onCoverPosted?: () => void; // Callback sau khi post thành công
}

// Interface chi tiết hơn cho Track
interface Track {
  id: number;
  title: string;
  artist: string;
  // Thêm các trường khác nếu cần
}

const UploadCoverModal: React.FC<UploadCoverModalProps> = ({
  visible,
  onClose,
  onCoverPosted,
}) => {
  const colorScheme = useColorScheme();
  const { error, info, warning, confirm, success } = useCustomAlert();
  const [selectedSong, setSelectedSong] = useState<Track | null>(null);
  const [coverText, setCoverText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSongSelector, setShowSongSelector] = useState(false);
  const user = useAuthStore((state) => state.user);

  // Load tracks khi modal mở
  useEffect(() => {
    if (visible && !showSongSelector) {
      loadTracks();
    }
  }, [visible, showSongSelector]);

  const loadTracks = async () => {
    try {
      // Chỉ tải nếu danh sách bài hát chưa được tải hoặc đang tìm kiếm
      if (tracks.length === 0) {
        const fetchedTracks = await fetchTracks(); // API fetch tracks
        setTracks(Array.isArray(fetchedTracks) ? fetchedTracks : []);
      }
    } catch (error) {
      console.error("Error loading tracks:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách bài hát.");
      setTracks([]);
    }
  };

  const handleSelectMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Cần quyền truy cập thư viện.");
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedMedia(result.assets[0]);
      }
    } catch (error) {
      console.error("Error selecting media:", error);
      Alert.alert("Lỗi", "Không thể chọn media.");
    }
  };

  const handlePostCover = async () => {
    // Kiểm tra điều kiện đăng bài với thông báo rõ ràng
    if (!selectedSong) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn bài hát gốc.");
      return;
    }

    if (!selectedMedia) {
      Alert.alert("Thiếu file media", "Vui lòng chọn file audio/video để tải lên.");
      return;
    }

    try {
      setIsUploading(true);
      
      // Hiển thị thông báo đang tải lên
      Alert.alert(
        "Đang xử lý",
        "Đang tải lên file media của bạn, vui lòng đợi...",
        [],
        { cancelable: false }
      );

      // Thực hiện upload file
      const uploadResult = await UploadMultipleFile([selectedMedia]);
      
      if (!uploadResult.success) {
        Alert.alert(
          "Lỗi khi tải lên",
          `Không thể tải lên file media: ${uploadResult.message || 'Vui lòng thử lại sau'}`
        );
        return;
      }

      // Kiểm tra dữ liệu trả về từ API upload
      if (!uploadResult.data?.data?.length) {
        throw new Error("Không nhận được đường dẫn file sau khi tải lên");
      }

      const fileUrls = uploadResult.data.data.map((item: any) => item.url);
      if (!fileUrls.length) {
        throw new Error("Không có đường dẫn file hợp lệ");
      }

      // Tạo cover mới
      const coverResult = await createNewCover(
        coverText,
        fileUrls,
        selectedSong.id
      );

      // Kiểm tra kết quả tạo cover
      if (!coverResult || (coverResult as any).status === 'error') {
        throw new Error(coverResult?.message || 'Không thể tạo cover');
      }

      // Thông báo thành công và đóng modal
      Alert.alert(
        "Thành công",
        "Cover của bạn đã được đăng thành công!",
        [
          {
            text: "Đóng",
            onPress: () => {
              onCoverPosted?.();
              handleClose();
            }
          }
        ]
      );
      
    } catch (error) {
      console.error("Lỗi khi đăng cover:", error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = "Đã xảy ra lỗi khi đăng cover";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedSong(null);
    setCoverText("");
    setSelectedMedia(null);
    setSearchQuery("");
    setShowSongSelector(false);
    onClose();
  };

  const filteredTracks = tracks.filter(
    (track) =>
      track?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track?.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUploadForm = () => (
    <View className="flex-1">
      <TouchableOpacity
        onPress={() => setShowSongSelector(true)}
        className={`flex-row items-center border rounded-xl p-4 mb-4 ${selectedSong
          ? "border-green-500 bg-green-500/10"
          : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#171431]"
          }`}
      >
        <Icon
          name="music"
          size={24}
          color={selectedSong ? "rgb(34, 197, 94)" : "rgb(156, 163, 175)"}
        />
        <View className="ml-3 flex-1">
          <Text
            className={`font-semibold text-base ${selectedSong ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}
          >
            {selectedSong ? "Bài hát gốc đã chọn" : "Chọn bài hát gốc"}
          </Text>
          {selectedSong && (
            <Text className="text-sm text-black dark:text-white mt-1">
              {`${selectedSong.title} - ${selectedSong.artist || "Unknown Artist"}`}
            </Text>
          )}
        </View>
        <Icon name="chevron-right" size={20} color="rgb(156, 163, 175)" />
      </TouchableOpacity>

      {/* Chọn media - Thiết kế dạng thẻ nổi bật */}
      <TouchableOpacity
        onPress={handleSelectMedia}
        className={`flex-row items-center border rounded-xl p-4 mb-4 ${selectedMedia
          ? "border-indigo-500 bg-indigo-500/10"
          : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#171431]"
          }`}
      >
        <Icon
          name="video"
          size={24}
          color={selectedMedia ? "rgb(99, 102, 241)" : "rgb(156, 163, 175)"}
        />
        <View className="ml-3 flex-1">
          <Text
            className={`font-semibold text-base ${selectedMedia ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`}
          >
            {selectedMedia ? "Media đã chọn" : "Chọn Audio/Video"}
          </Text>
          {selectedMedia && (
            <Text className="text-sm text-black dark:text-white mt-1">
              File:{" "}
              {selectedMedia.fileName ||
                selectedMedia.uri.substring(
                  selectedMedia.uri.lastIndexOf("/") + 1
                )}
            </Text>
          )}
        </View>
        <Icon name="upload-cloud" size={20} color="rgb(156, 163, 175)" />
      </TouchableOpacity>

      {/* Nội dung cover */}
      <TextInput
        className="border border-gray-300 dark:border-gray-600 rounded-xl p-4 mb-6 text-black dark:text-white text-base h-32"
        placeholder="Chia sẻ cảm xúc, quá trình làm cover này..."
        placeholderTextColor="#9ca3af"
        value={coverText}
        onChangeText={setCoverText}
        multiline
        textAlignVertical="top" // Đảm bảo text bắt đầu từ trên cùng
      />

      {/* Button post */}
      <CustomButton
        title="Đăng Cover"
        onPress={handlePostCover}
        variant="primary"
        size="large"
        className={`${isUploading || !selectedSong || !selectedMedia
          ? "bg-green-300 dark:bg-green-700"
          : "bg-green-500 dark:bg-green-600"
          }`}
      />
    </View>
  );

  const renderSongSelector = () => (
    <View className="flex-1">
      {/* Header cho Song Selector */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity
          onPress={() => setShowSongSelector(false)}
          className="p-1"
        >
          <Icon
            name="chevron-left"
            size={28}
            color={colorScheme === "dark" ? "white" : "black"}
          />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black dark:text-white flex-1 text-center">
          Tìm Bài Hát Gốc
        </Text>
        <View className="w-8" />
      </View>

      {/* Thanh tìm kiếm */}
      <View className="flex-row items-center border border-gray-300 dark:border-gray-600 rounded-full p-3 mb-4 bg-white dark:bg-gray-700">
        <Icon name="search" size={20} color="#9ca3af" />
        <TextInput
          className="flex-1 text-black dark:text-white text-base"
          placeholder="Tên bài hát hoặc nghệ sĩ..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
      </View>

      {/* Danh sách bài hát */}
      <FlatList
        data={filteredTracks}
        keyExtractor={(item) => item.id.toString()}
        style={{ flex: 1 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedSong(item);
              setShowSongSelector(false);
            }}
            className="p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700"
          >
            <Text className="text-black dark:text-white font-semibold text-base">
              {item.title}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              {item.artist}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center mt-8">
            <Icon name="alert-circle" size={30} color="#9ca3af" />
            <Text className="text-center text-gray-500 dark:text-gray-400 mt-2">
              Không tìm thấy bài hát nào phù hợp.
            </Text>
          </View>
        }
      />
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={handleClose}>
        {/* KeyboardAvoidingView để tránh bàn phím che mất input */}
        <KeyboardAvoidingView
          className="flex-1 bg-black/50 justify-end"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback>
            {/* Main content container */}
            <View className="bg-white dark:bg-[#171431] rounded-t-3xl p-6 flex-1 max-h-[85%]">
              {/* Header cho Form chính */}
              {!showSongSelector && (
                <View className="flex-row justify-between items-center pb-4 mb-4 border-b border-gray-100 dark:border-gray-700">
                  <Text className="text-2xl font-extrabold text-black dark:text-white">
                    Tạo Cover Mới
                  </Text>
                  <TouchableOpacity onPress={handleClose} className="p-1">
                    <Icon name="x" size={28} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Render Form hoặc Song Selector */}
              {showSongSelector ? renderSongSelector() : renderUploadForm()}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default UploadCoverModal;
