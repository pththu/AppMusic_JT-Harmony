import {
  View,
  Text,
  useColorScheme,
  Modal,
  TextInput,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";
import React, { useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import * as ImagePicker from 'expo-image-picker';
import { CreatePlaylist } from "@/services/musicService";

const AddPlaylistModal = ({ isModalVisible, setIsModalVisible }) => {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#888" : "#666";
  const { success, error, warning } = useCustomAlert();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      warning('Ứng dụng cần quyền truy cập thư viện ảnh!');
      return false;
    }
    return true;
  };

  const handlePickerImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      error('Quyền truy cập bị từ chối!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddPlaylist = async () => {
    setLoading(true);
    try {
      const payload = {
        image: image || null,
        name: name,
        description: description,
        isPublic: isPublic
      };
      const response = await CreatePlaylist(payload);
      console.log('response from ui', response);
      if (response.success) {
        setImage(null);
        success('Tạo playlist thành công!');
      }
    } catch (error) {
      error('Không thể tạo playlist. Vui lòng thử lại!', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isModalVisible}
      onRequestClose={() => {
        setIsModalVisible(false);
      }}
    >
      <SafeAreaView
        className={`${colorScheme === "dark" ? "bg-[#232023]" : "bg-white"
          } flex-1 px-4 justify-center`}
      >
        <View
          className={`${colorScheme === "dark" ? "bg-[#0E0C1F]" : "bg-white"
            } rounded-lg p-6 mx-4 shadow-lg`}
        >
          {/* Tiêu đề Modal */}
          <Text className="text-black self-center dark:text-white text-2xl font-bold mb-6">
            Tạo danh sách phát mới
          </Text>

          {/* (MỚI) Chọn ảnh đại diện */}
          <View className="items-center mb-6">
            <TouchableOpacity className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-lg items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-600"
              onPress={() => {
                handlePickerImage();
              }}
            >
              <Icon name="camera-outline" size={40} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Input Tên danh sách phát */}
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Tên danh sách phát"
            placeholderTextColor="#888"
            className="bg-gray-200 dark:bg-gray-800 rounded-md p-4 text-lg text-black dark:text-white mb-4" // <-- Sửa mb-8 thành mb-4
            autoFocus={true}
          />

          {/* (MỚI) Input Mô tả */}
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Thêm mô tả (không bắt buộc)"
            placeholderTextColor="#888"
            className="bg-gray-200 dark:bg-gray-800 rounded-md p-4 text-base text-black dark:text-white mb-8"
            multiline={true}
            numberOfLines={3}
            // Cần style inline cho chiều cao và text-align
            style={{ height: 100, textAlignVertical: "top" }}
          />

          {/* (MỚI) Toggle Công khai */}
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-black dark:text-white text-base">
              Công khai
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: "#22c55e" }} // Màu xanh lá khi bật
              thumbColor={
                isPublic
                  ? Platform.OS === "ios"
                    ? "white"
                    : "#f4f3f4"
                  : "#f4f3f4"
              }
              ios_backgroundColor="#3e3e3e"
              onValueChange={setIsPublic}
              value={isPublic}
            />
          </View>

          {/* Khu vực Nút bấm */}
          <View className="flex-row justify-end space-x-4">
            <TouchableOpacity
              className="py-3 px-6 rounded-md"
              onPress={() => setIsModalVisible(false)}
            >
              <Text className="text-gray-500 dark:text-gray-400 text-base font-semibold">
                Hủy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-green-500 py-3 px-6 rounded-md shadow"
              onPress={() => {
                setIsModalVisible(false);
                handleAddPlaylist();
              }}
            >
              <Text className="text-white text-base font-semibold">Tạo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default AddPlaylistModal;