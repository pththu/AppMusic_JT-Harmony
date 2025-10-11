import { SettingsContext } from "@/context/SettingsContext";
import { useNavigate } from "@/hooks/useNavigate";
import React, { useContext, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";

// Import các component tùy chỉnh cần thiết
import LibraryItemButton from "@/components/button/LibraryItemButton";
import CustomButton from "@/components/custom/CustomButton";
import SettingItem from "@/components/items/SettingItem";
import useAuthStore from "@/store/authStore";
import { ChangeAvatar, Logout } from "@/routes/ApiRouter";
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { LoginManager } from "react-native-fbsdk-next";
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const settings = useContext(SettingsContext);
  const user = useAuthStore(state => state.user);
  const loginType = useAuthStore(state => state.loginType);
  const updateUser = useAuthStore(state => state.updateUser);
  const { navigate } = useNavigate();
  const { success, error, warning } = useCustomAlert();
  const logout = useAuthStore(state => state.logout);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      warning('Ứng dụng cần quyền truy cập thư viện ảnh!');
      return false;
    }
    return true;
  };

  const pickSingleImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }

    setTimeout(() => {
      handleUploadSingle();
    }, 1500);
  };

  const handleUploadSingle = async () => {
    if (!selectedImage) {
      warning('Vui lòng chọn hình ảnh trước!');
      return;
    }

    setLoading(true);
    try {
      const response = await ChangeAvatar(selectedImage);
      console.log('response', response);

      if (response.success) {
        setUploadedImages([...uploadedImages, response.data]);
        setSelectedImage(null);
        updateUser({ ...user, avatarUrl: response.data });
        success('Upload hình ảnh thành công!');
      }
    } catch (error) {
      error('Không thể upload hình ảnh. Vui lòng thử lại!', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await Logout(); // logout khỏi server -> xóa cookie
      // logout khỏi client -> xóa store
      if (loginType === 'google') {
        await GoogleSignin.signOut(); // logout khỏi google
      }
      if (loginType === 'facebook') {
        LoginManager.logOut(); // logout khỏi facebook
      }
      if (response.success) {
        success('Đăng xuất thành công', '');
      }
      logout();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditAvatar = async () => {
    console.log('Edit avatar pressed');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0E0C1F] p-6">
      {/* Tiêu đề và nút Edit */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-3xl font-bold">Hồ sơ</Text>
        <CustomButton
          title="Cài đặt"
          onPress={() => navigate("Setting")}
          iconName="settings-sharp"
        />
      </View>

      {/* Ảnh đại diện và tên */}
      <View className="items-center my-4">
        <Pressable className="items-center w-24 h-24 mb-4 border-2 rounded-full border-white shadow-xl"
          onPress={() => pickSingleImage()}
        >
          <Image
            source={{
              uri: user?.avatarUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg',
            }}
            className="w-[80px] h-[80px] rounded-full items-center"
          />
          <View className="absolute bottom-0 right-0  p-1 rounded-full bg-black/50">
            <Icon name="camera" size={16} color="white" />
          </View>
        </Pressable>
        <Text className="text-white text-2xl font-bold">{user?.fullName || user?.username}</Text>
      </View>

      {/* Thông tin liên hệ */}
      <View className="my-4">
        <View className="flex-row items-center mb-1">
          <Icon
            name="mail-outline"
            size={20}
            color="#9CA3AF"
            className="mr-2"
          />
          <Text className="text-gray-400">Email</Text>
        </View>
        <Text className="text-white mb-3">{user?.email || 'Chưa có thông tin'}</Text>

        <View className="flex-row items-center mb-1">
          <Icon
            name="calendar-outline"
            size={20}
            color="#9CA3AF"
            className="mr-2"
          />
          <Text className="text-gray-400">Ngày sinh</Text>
        </View>
        <Text className="text-white my-2">{new Date(user?.dob).toLocaleDateString() || 'Chưa có thông tin'}</Text>

        <View className="flex-row items-center mb-1">
          <Icon
            name="information-circle-outline"
            size={20}
            color="#9CA3AF"
            className="mr-2"
          />
          <Text className="text-gray-400">Tiểu sử</Text>
        </View>
        <Text className="text-white">{user?.bio || '...'}</Text>
      </View>

      {/* Các nút Thư viện (Library) */}
      <View className="flex-row justify-between my-4">
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
          color="#fff999"
        />
      </View>

      {/* Cài đặt (Settings) */}
      <View>
        <Text className="text-white font-semibold mb-2 text-2xl">Cấu hình</Text>
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
        <SettingItem
          color="red"
          title="Đăng xuất"
          onPress={() => handleLogout()}
        />
      </View>
    </SafeAreaView>
  );
}
