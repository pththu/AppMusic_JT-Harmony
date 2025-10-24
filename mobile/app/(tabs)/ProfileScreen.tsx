import { SettingsContext } from "@/context/SettingsContext";
import { useNavigate } from "@/hooks/useNavigate";
import React, { useContext, useState } from "react";
import { Image, Pressable, Text, View, ScrollView, ActivityIndicator, useColorScheme, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { ThemeToggle } from "@/components/ThemeToggle";
import LibraryItemButton from "@/components/button/LibraryItemButton";
import CustomButton from "@/components/custom/CustomButton";
import SettingItem from "@/components/items/SettingItem";
import useAuthStore from "@/store/authStore";
import { ChangeAvatar, Logout, UploadMultipleFile } from "@/routes/ApiRouter";
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { LoginManager } from "react-native-fbsdk-next";
import * as ImagePicker from 'expo-image-picker';
// import * as DocumentPicker from 'expo-document-picker';

export default function ProfileScreen() {
  const settings = useContext(SettingsContext);
  const user = useAuthStore(state => state.user);
  const loginType = useAuthStore(state => state.loginType);
  const updateUser = useAuthStore(state => state.updateUser);
  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const { success, error, warning } = useCustomAlert();
  const logout = useAuthStore(state => state.logout);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isChoosedImage, setIsChoosedImage] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      warning('Ứng dụng cần quyền truy cập thư viện ảnh!');
      return false;
    }
    return true;
  };

  const handlePickSingleImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      error('Quyền truy cập bị từ chối!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setIsChoosedImage(true);
    }
  };

  const handleUploadSingle = async () => {
    if (!selectedImage) {
      warning('Vui lòng chọn hình ảnh trước!');
      return;
    }

    setLoading(true);
    try {
      const response = await ChangeAvatar(selectedImage);

      if (response.success) {
        setSelectedImage(null);
        setIsChoosedImage(false);
        updateUser({ ...user, avatarUrl: response.data?.url });
        success('Upload hình ảnh thành công!');
      }
    } catch (error) {
      error('Không thể upload hình ảnh. Vui lòng thử lại!', error.message);
    } finally {
      setLoading(false);
    }
  };

  // up nhiều file lên cloudinary và server
  // const handlePickMultipleFile = async () => {
  //   try {
  //     const result = await DocumentPicker.getDocumentAsync({
  //       type: [
  //         'audio/*',
  //         'video/*',
  //         'image/*',
  //       ],
  //       multiple: true,
  //       copyToCacheDirectory: true,
  //     });

  //     if (!result.canceled) {
  //       // Truyền trực tiếp mảng result.assets vào hàm upload
  //       console.log('Files selected:', result.assets);
  //       const uploadResult = await UploadMultipleFile(result.assets);

  //       if (uploadResult.success) {
  //         success('Upload thành công nhiều file!', '');
  //         console.log('Server response:', uploadResult);
  //       } else {
  //         error('Upload thất bại', uploadResult.message);
  //       }
  //     } else {
  //       warning('Bạn chưa chọn file nào để upload!');
  //     }
  //   } catch (error) {
  //     error('Không thể chọn file. Vui lòng thử lại!', error.message);
  //   }
  // };

  const handleLogout = async () => {
    try {
      const response = await Logout();
      if (loginType === 'google') {
        await GoogleSignin.signOut();
      }
      if (loginType === 'facebook') {
        LoginManager.logOut();
      }
      if (response.success) {
        success('Đăng xuất thành công', '');
      }
      logout();
    } catch (error) {
      console.log(error);
    }
  };

  const ModalConfirm = () => {
    return (
      <View className={`absolute top-[40%] left-[10%] right-[10%] items-center justify-center mb-4 p-8 m-4 rounded-lg border ${colorScheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"}`}
        style={{
          shadowColor: colorScheme === "dark" ? "#000" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          zIndex: 9999,
        }}
      >
        <Text className={`text-center text-lg mb-4 ${colorScheme === "dark" ? "text-white" : "text-gray-800"}`}>
          Xác nhận đổi ảnh đại diện?
        </Text>
        <View className={`flex-row items-center justify-center gap-5`}>
          <Pressable
            className={`px-6 py-4 rounded ${colorScheme === "dark" ? "bg-gray-700" : "bg-red-600"}`}
            onPress={() => {
              setIsChoosedImage(false);
              setSelectedImage(null);
            }}
          >
            <Text className={`${colorScheme === "dark" ? "text-white" : "text-white"}`}>Hủy bỏ</Text>
          </Pressable>
          <Pressable
            className={`px-6 py-4 rounded bg-green-600`}
            onPress={() => handleUploadSingle()}
          >
            <Text className={`text-white`}>{loading ? "Đang tải..." : "Cập nhật"}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0E0C1F]">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-black dark:text-white text-3xl font-bold">Hồ sơ</Text>
          <CustomButton
            title="Cài đặt"
            onPress={() => navigate("Setting")}
            iconName="settings-sharp"
          />
        </View>

        <View className="items-center my-4">
          <Pressable className={`items-center w-24 h-24 mb-4 border-2 rounded-full border-green-500 shadow-xl`}
            onPress={() => handlePickSingleImage()}
          >
            <Image
              source={{
                uri: user?.avatarUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg',
              }}
              className="w-[80px] h-[80px] rounded-full items-center"
            />
            <View className="absolute bottom-0 right-0 p-1 bg-green-500/50 rounded-full">
              <Icon name="camera" size={16} color="white" />
            </View>
          </Pressable>
          <Text className={`text-lg font-bold ${colorScheme === "dark" ? "text-white" : "text-[#1C1A2F]"}`}>{user?.fullName || user?.username}</Text>
        </View>

        {isChoosedImage && <ModalConfirm />}

        {/* Thông tin liên hệ */}
        <View className="my-4 border-b border-gray-300 pb-4">
          <View className="flex-row items-center mb-2 gap-2">
            <Icon
              name="mail-outline"
              size={20}
              color={`${colorScheme === "dark" ? "#9CA3AF" : "#6B7280"}`}
            />
            <Text className={`${colorScheme === "dark" ? "text-gray-400" : "text-gray-900"}`}>Email:</Text>
            <Text className={`ml-3 ${colorScheme === "dark" ? "text-white" : "text-gray-800"}`}>{user?.email || 'Chưa có thông tin'}</Text>
          </View>

          <View className="flex-row items-center mb-2 gap-2">
            <Icon
              name="calendar-outline"
              size={20}
              color={`${colorScheme === "dark" ? "#9CA3AF" : "#6B7280"}`}
            />
            <Text className={`${colorScheme === "dark" ? "text-gray-400" : "text-gray-900"}`}>Ngày sinh:</Text>
            <Text className={`ml-3 ${colorScheme === "dark" ? "text-white" : "text-gray-800"}`}>{new Date(user?.dob).toLocaleDateString() || 'Chưa có thông tin'}</Text>
          </View>

          <View className="flex-row items-center mb-1 gap-2">
            <Icon
              name="information-circle-outline"
              size={20}
              color={`${colorScheme === "dark" ? "#9CA3AF" : "#6B7280"}`}
            />
            <Text className={`${colorScheme === "dark" ? "text-gray-400" : "text-gray-900"}`}>Tiểu sử:</Text>
          </View>
          <Text className={`${colorScheme === "dark" ? "text-white" : "text-gray-800 bg-green-100 py-2 px-4 rounded-md"}`}>{user?.bio || '...'}</Text>
        </View>

        {/* <Pressable className="p-5 border border-slate-300"
          onPress={() => handlePickMultipleFile()}
        >
          <Text>Chọn nhiều file</Text>
        </Pressable> */}

        {/* Các nút Thư viện (Library) */}
        <View className="flex-row justify-between mb-4">
          <LibraryItemButton
            title="... Bài hát"
            icon="favorite"
            onPress={() => navigate("LikedSongsScreen")}
            color="#ffb5b5"
          />
          <LibraryItemButton
            title="... Playlists"
            icon="list"
            onPress={() => navigate("PlaylistsScreen")}
            color="#82d8ff"
          />
          <LibraryItemButton
            title="... Nghệ sĩ"
            icon="person"
            onPress={() => navigate("ArtistsFollowingScreen")}
            color="#FFA500"
          />
        </View>

        <View>
          <Text className="text-black dark:text-white font-semibold mb-2 text-2xl">Cấu hình</Text>
          <SettingItem
            title="Chế độ Tối/Sáng"
            rightComponent={
              <View className={"mr-2"}>
                <ThemeToggle />
              </View>
            }
            onPress={() => { }}
          />
          <SettingItem
            title={`Ngôn ngữ: ${settings?.musicLanguages.join(", ")}`}
            onPress={() => navigate("MusicLanguage")}
          />
          <SettingItem
            title={`Chất lượng phát trực tuyến: ${settings?.streamingQuality}`}
            onPress={() => navigate("StreamingQuality")}
          />
          <SettingItem
            title={`Chất lượng tải xuống: ${settings?.downloadQuality}`}
            onPress={() => navigate("DownloadQuality")}
          />
          <TouchableOpacity
            className={`py-4`}
            onPress={() => handleLogout()}
            activeOpacity={0.7}
          >
            <Text className={`text-red-500 font-bold text-lg`}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}