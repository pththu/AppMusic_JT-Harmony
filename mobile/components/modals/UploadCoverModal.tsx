import React, { useState, useEffect } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  useColorScheme,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { UploadMultipleFile } from "@/routes/ApiRouter";
import { createNewCover } from "@/services/coverService";
import { GetTracksForCover } from "@/services/musicService";
import useAuthStore from "@/store/authStore";
import CustomButton from "@/components/custom/CustomButton";
import { useCustomAlert } from "@/hooks/useCustomAlert";

interface UploadCoverModalProps {
  visible: boolean;
  onClose: () => void;
  onCoverPosted?: () => void; // Callback sau khi post thành công
}

const UploadCoverModal: React.FC<UploadCoverModalProps> = ({
  visible,
  onClose,
  onCoverPosted,
}) => {
  const colorScheme = useColorScheme();
  const { error: showError, info, warning, confirm, success } = useCustomAlert();
  const [selectedSong, setSelectedSong] = useState(null);
  const [coverText, setCoverText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [tracks, setTracks] = useState([]);
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
      if (tracks.length === 0) {
        console.log("=== DEBUG: Loading tracks for cover ===");
        const response = await GetTracksForCover();
        console.log("API Response:", response);
        console.log("Tracks data:", response.data);
        console.log("Number of tracks:", response.data?.length);
        
        if (response.success) {
          setTracks(response.data);
          console.log("First 3 tracks:", response.data?.slice(0, 3));
        }
      }
    } catch (err) {
      console.error("Error loading tracks:", err);
      showError("Không thể tải danh sách bài hát.");
      setTracks([]);
    }
  };

  const handleSelectMedia = () => {
    // Chọn thẳng file media (audio hoặc video)
    selectMediaFile();
  };

  const selectMediaFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          // Audio types
          'audio/*',
          'audio/mp3',
          'audio/wav',
          'audio/m4a',
          'audio/aac',
          // Video types
          'video/*',
          'video/mp4',
          'video/mov',
          'video/avi',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Kiểm tra kích thước file
        if (asset.size && asset.size > 50 * 1024 * 1024) {
          showError("File quá lớn", "Kích thước file không được vượt quá 50MB");
          return;
        }

        // Format asset để match với ImagePicker format
        const formattedAsset = {
          uri: asset.uri,
          fileName: asset.name,
          mimeType: asset.mimeType,
          fileSize: asset.size,
        };

        setSelectedMedia(formattedAsset);
      }
    } catch (error) {
      console.error("Error selecting media:", error);
      showError("Lỗi", "Không thể chọn file media.");
    }
  };

  const handlePostCover = async () => {
    // Kiểm tra điều kiện đăng bài với thông báo rõ ràng
    if (!selectedSong) {
      showError("Thiếu thông tin", "Vui lòng chọn bài hát gốc.");
      return;
    }

    if (!selectedMedia) {
      showError("Thiếu file media", "Vui lòng chọn file audio hoặc video để tải lên.");
      return;
    }

    const fileType = selectedMedia.mimeType || selectedMedia.type;
    if (!fileType || (!fileType.startsWith('audio/') && !fileType.startsWith('video/'))) {
      showError("Định dạng không hỗ trợ", "Vui lòng chọn file audio hoặc video");
      return;
    }

    try {
      setIsUploading(true);
      
      // Hiển thị thông báo đang tải lên
      info("Đang xử lý", "Đang tải lên file media của bạn, vui lòng đợi...");

      // Thực hiện upload file
      const uploadResult = await UploadMultipleFile([selectedMedia]);
      
      if (!uploadResult.success) {
        showError("Lỗi khi tải lên", `Không thể tải lên file media: ${uploadResult.message || 'Vui lòng thử lại sau'}`);
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
      console.log("=== DEBUG: Before creating cover ===");
      console.log("Selected song:", selectedSong);
      console.log("Selected song ID:", selectedSong.id);
      console.log("Selected song tempId:", selectedSong.tempId);
      console.log("Selected song ID type:", typeof selectedSong.id);
      
      // Sử dụng tempId nếu có, ngược lại dùng id
      const songIdToSend = selectedSong.tempId || selectedSong.id;
      console.log("Song ID to send:", songIdToSend);
      
      const coverResult = await createNewCover(
        coverText,
        fileUrls,
        songIdToSend
      );

      // Kiểm tra kết quả tạo cover
      if (!coverResult || (coverResult as any).success === false) {
        const errorMessage = (coverResult as any)?.message || 'Không thể tạo cover';
        throw new Error(errorMessage);
      }

      // Thông báo thành công và đóng modal
      success("Thành công", "Cover của bạn đã được đăng thành công!", () => {
        onCoverPosted?.();
        handleClose();
      });
      
    } catch (error) {
      console.error("Lỗi khi đăng cover:", error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = "Đã xảy ra lỗi khi đăng cover";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError("Lỗi", errorMessage);
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
      track?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track?.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
              {`${selectedSong.name} - ${selectedSong.artists?.map(artist => artist.name).join(", ") || "Unknown Artist"}`}
            </Text>
          )}
        </View>
        <Icon name="chevron-right" size={20} color="rgb(156, 163, 175)" />
      </TouchableOpacity>

      {/* Chọn media */}
      <TouchableOpacity
        onPress={isUploading ? undefined : handleSelectMedia}
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
            {selectedMedia ? "Upload khi nhấn đăng" : "Chọn Audio/Video"}
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
        textAlignVertical="top"
      />

      {/* Button post */}
      <CustomButton
        title={isUploading ? "Đang đăng cover..." : "Đăng"}
        onPress={() => {
          if (isUploading || !selectedSong || !selectedMedia) return;
          handlePostCover();
        }}
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
              console.log("Selected song from list:", item);
              console.log("Selected song ID:", item.id);
              console.log("Selected song name:", item.name);
              setSelectedSong(item);
              setShowSongSelector(false);
            }}
            className="p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700"
          >
            <Text className="text-black dark:text-white font-semibold text-base">
              {item.name}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              {item?.artists?.map((artist) => artist.name).join(", ") || "Unknown Artist"}
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
        <KeyboardAvoidingView
          className="flex-1 bg-black/50 justify-end"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback>
            <View className="bg-white dark:bg-[#171431] rounded-t-3xl p-6 flex-1 max-h-[60%]">
              {isUploading && (
                <View className="absolute inset-0 bg-black/40 z-10 justify-center items-center rounded-t-3xl">
                  <ActivityIndicator size="large" color="#22c55e" />
                  <Text className="mt-2 text-white font-semibold">
                    Đang tải lên cover...
                  </Text>
                </View>
              )}
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
