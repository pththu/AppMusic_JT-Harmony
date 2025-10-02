import { SettingsContext } from "@/context/SettingsContext";
import { useNavigate } from "@/hooks/useNavigate";
import React, { useContext } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";

// Import các component tùy chỉnh cần thiết
import LibraryItemButton from "@/components/button/LibraryItemButton";
import CustomButton from "@/components/custom/CustomButton";
import SettingItem from "@/components/items/SettingItem";
import useAuthStore from "@/store/authStore";
import { Logout } from "@/routes/ApiRouter";
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export default function ProfileScreen() {
  const settings = useContext(SettingsContext);
  const user = useAuthStore(state => state.user);
  const { navigate } = useNavigate();
  const { success } = useCustomAlert();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = async () => {
    try {
      const response = await Logout(); // logout khỏi server -> xóa cookie
      logout(); // logout khỏi client -> xóa store
      if (user?.accountType === 'google') {
        await GoogleSignin.signOut(); // logout khỏi google
      }
      console.log(response);
      if (response.statusCode == 200) {
        success('Đăng xuất thành công', '');
        navigate('Auth');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditAvatar = () => {
    console.log('Edit avatar pressed');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0E0C1F] p-6">
      {/* Tiêu đề và nút Edit */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-3xl font-bold">Hồ sơ</Text>
        <CustomButton
          title="Chỉnh sửa"
          onPress={() => navigate("EditProfile")}
          iconName="pencil"
        />
      </View>

      {/* Ảnh đại diện và tên */}
      <View className="items-center my-4">
        <Pressable className="items-center w-24 h-24 mb-4 border-4 rounded-full border-white shadow-xl"
          onPress={() => handleEditAvatar()}
        >
          <Image
            source={{
              uri: user?.avatarUrl || "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            }}
            className="w-24 h-24 rounded-full"
          />
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
        <Text className="text-white mb-3">{user?.email}</Text>

        <View className="flex-row items-center mb-1">
          <Icon
            name="calendar-outline"
            size={20}
            color="#9CA3AF"
            className="mr-2"
          />
          <Text className="text-gray-400">Ngày sinh</Text>
        </View>
        <Text className="text-white">{new Date(user?.dob).toLocaleDateString() || 'Chưa có thông tin'}</Text>

        <View className="flex-row items-center mb-1">
          <Icon
            name="information-circle-outline"
            size={20}
            color="#9CA3AF"
            className="mr-2"
          />
          <Text className="text-gray-400">Tiểu sử</Text>
        </View>
        <Text className="text-white">{user?.bio}</Text>
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
        <Text className="text-white font-semibold mb-2 text-2xl">Cài đặt</Text>
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
