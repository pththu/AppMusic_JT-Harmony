import CustomButton from "@/components/custom/CustomButton";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { UploadMultipleFile } from "@/routes/ApiRouter";
import { createNewCover } from "@/services/coverService";
import { GetTracksForCover } from "@/services/musicService";
import useAuthStore from "@/store/authStore";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

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
  const { error, info, warning, confirm, success } = useCustomAlert();
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
        const response = await GetTracksForCover();
        if (response.success) {
          setTracks(response.data);
        }
      }
    } catch (err) {
      console.error("Error loading tracks:", err);
      error("Không thể tải danh sách bài hát.");
      setTracks([]);
    }
  };

  const handleSelectMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      error("Lỗi", "Cần quyền truy cập thư viện.");
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        // Check file size using asset.fileSize or approximate from uri
        const fileSize = asset.fileSize || 0;
        if (fileSize > 50 * 1024 * 1024) {
          error("File quá lớn", "Kích thước file không được vượt quá 50MB");
          return;
        }
        setSelectedMedia(asset);
      }
    } catch (error) {
      console.error("Error selecting media:", error);
      error("Lỗi", "Không thể chọn media.");
    }
  };

  const handlePostCover = async () => {
    // Kiểm tra điều kiện đăng bài với thông báo rõ ràng
    if (!selectedSong) {
      error("Thiếu thông tin", "Vui lòng chọn bài hát gốc.");
      return;
    }

    if (!selectedMedia) {
      error("Thiếu file media", "Vui lòng chọn file audio/video để tải lên.");
      return;
    }

    const fileType = selectedMedia.mimeType || selectedMedia.type;
    if (!fileType || (!fileType.startsWith('audio/') && !fileType.startsWith('video/'))) {
      error("Định dạng không hỗ trợ", "Vui lòng chọn file audio hoặc video");
      return;
    }

    try {
      setIsUploading(true);
      
      // Hiển thị thông báo đang tải lên
      info("Đang xử lý", "Đang tải lên file media của bạn, vui lòng đợi...");

      // Thực hiện upload file
      const uploadResult = await UploadMultipleFile([selectedMedia]);
      
      if (!uploadResult.success) {
        error("Lỗi khi tải lên", `Không thể tải lên file media: ${uploadResult.message || 'Vui lòng thử lại sau'}`);
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
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      error("Lỗi", errorMessage);
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
        {/* KeyboardAvoidingView để tránh bàn phím che mất input */}
        <KeyboardAvoidingView
          className="flex-1 bg-black/50 justify-end"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback>
            {/* Main content container */}
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
