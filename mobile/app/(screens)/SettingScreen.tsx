import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, TextInput, useColorScheme } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import SettingButton from "@/components/button/SettingButton";
import CustomButton from "@/components/custom/CustomButton";
import { useNavigate } from "@/hooks/useNavigate";
import { router } from "expo-router";
import useAuthStore from "@/store/authStore";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { ENV } from "@/config/env";
import { LoginManager, Profile, Settings } from "react-native-fbsdk-next";
import { LinkSocialAccount, Logout, MergeAccount, SelfLockAccount } from "@/routes/ApiRouter";
import { useTheme } from "@/components/ThemeContext"; // Import useTheme

GoogleSignin.configure({
  webClientId: ENV.GOOGLE_OAUTH_WEB_CLIENT_ID_APP,
});

Settings.setAppID(ENV.FACEBOOK_APP_ID);
Settings.initializeSDK();

export default function SettingScreen() {

  const { theme } = useTheme(); // Lấy theme hiện tại
  const user = useAuthStore(state => state.user);
  const loginType = useAuthStore(state => state.loginType);
  const updateUser = useAuthStore(state => state.updateUser);
  const logout = useAuthStore(state => state.logout);
  const { navigate } = useNavigate();
  const { error, success, confirm } = useCustomAlert();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const colorScheme = useColorScheme();

  const handleMergeAccount = async (userId) => {
    try {
      const response = await MergeAccount({ userId });
      if (!response.success) {
        error("Gộp tài khoản thất bại", response.message);
        return;
      }
      updateUser(response.user);
      success("Gộp tài khoản thành công");
    } catch (error) {
      error("Gộp tài khoản thất bại", error.message);
    }
  };

  const handleLinkAccountFacebook = async () => {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile']);
      if (result.isCancelled) {
        error('Lỗi liên kết', 'Liên kết bị hủy');
        return;
      } else {
        setTimeout(async () => {
          const profile = await Profile.getCurrentProfile();
          if (profile) {
            const response = await LinkSocialAccount({ userInfor: profile, provider: 'facebook' });
            console.log('response link facebook', response);
            if (!response.success) {
              if (!response.userId) {
                error("Liên kết thất bại", response.message);
                return;
              } else {
                confirm(
                  "Xác nhận",
                  response.message,
                  () => handleMergeAccount(response.userId),
                  () => { }
                );
                return;
              }
            }
            updateUser(response.user);
            success("Liên kết thành công tài khoản Facebook");
          }
        }, 2000);
      }
    } catch (error) {
      console.log('Login fb fail with error: ' + error);
    } finally {
      LoginManager.logOut();
    }
  };

  const handleLinkAccountGoogle = async () => {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true
    });

    try {
      await GoogleSignin.hasPlayServices();
      const userInfor = await GoogleSignin.signIn();
      const response = await LinkSocialAccount({ userInfor: userInfor.data.user, provider: 'google' });
      if (!response.success) {
        console.log(1)
        if (!response.userId) {
          error("Liên kết thất bại", response.message);
          return;
        } else {
          confirm(
            "Xác nhận",
            response.message,
            () => handleMergeAccount(response.userId),
            () => { }
          );
          return;
        }
      }
      updateUser(response.user);
      success("Liên kết thành công tài khoản Google");
    } catch (error) {
      console.log(error);
    } finally {
      await GoogleSignin.signOut();
    }
  };

  const handleLockAccount = async () => {
    async function lock() {
      setLoading(true);
      setTimeout(async () => {
        console.log('lock account');
        try {
          const response = await SelfLockAccount(password);
          if (!response.success) {
            error("Lỗi khi khóa tài khoản", response.message);
            return;
          }
          await handleLogout(); // gọi sau khi khóa tài khoản thành công
        } catch (error) {
          error("Lỗi khi khóa tài khoản", error.message);
        }
        setLoading(false);
      }, 1000);
    }

    function cancel() {
      console.log('cancel lock account');
      setLoading(false);
    }

    if (!password) {
      setMessage("Vui lòng nhập mật khẩu");
      setShowMessage(true);
      return;
    }

    setLoading(true);
    confirm(
      "Xác nhận",
      "Bạn có chắc chắn muốn khóa tài khoản không?",
      lock,
      cancel
    );
  };

  /**
   * gọi sau khi khóa tài khoản thành công
   */
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
        success('Khóa tài khoản thành công', '', () => navigate('Auth'));
      }
      logout();
    } catch (error) {
      console.log(error);
    }
  };

  // Logic màu cho Light/Dark Mode
  const textColor = 'text-black dark:text-white';
  const iconColor = theme === 'dark' ? 'white' : 'black';
  const inputBg = 'bg-gray-200 dark:bg-[#1A1833]';
  const inputTextColor = 'text-black dark:text-white';
  const placeholderTextColor = theme === 'dark' ? '#999' : '#666';
  const labelTextColor = 'text-gray-600 dark:text-gray-300';


  return (

    <SafeAreaView className="flex-1 bg-white dark:bg-[#0E0C1F] p-6">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        {/* Cập nhật màu icon */}
        <Icon name="settings-sharp" size={28} color={iconColor} />
        {/* Cập nhật màu chữ tiêu đề */}
        <Text className={`${textColor} text-3xl font-bold ml-2`}>Cài đặt</Text>
      </View>

      {/* Danh sách cài đặt */}
      <View>
        <SettingButton title="Xác thực email" icon="mail-outline" onPress={() => navigate("UpdateEmail")} />
        <SettingButton title="Chỉnh sửa hồ sơ" icon="person-circle-outline" onPress={() => navigate("EditProfile")} />
        <SettingButton title="Đổi mật khẩu" icon="key-outline" onPress={() => navigate("ChangePassword")} />

        {/* Liên kết tài khoản */}
        <SettingButton title="Liên kết tài khoản" icon="link-outline">
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center bg-[#1877F2] py-3 px-4 rounded-2xl mb-3"
            disabled={!!user?.facebookId}
            onPress={() => handleLinkAccountFacebook()}
          >
            <Icon name="logo-facebook" size={20} color="#fff" />
            <Text className="text-white text-base ml-3">{user?.facebookId ? "Đã liên kết với Facebook" : "Liên kết với Facebook"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center bg-white py-3 px-4 rounded-2xl"
            disabled={!!user?.googleId}
            onPress={() => handleLinkAccountGoogle()}
          >
            <Icon name="logo-google" size={20} color="#000" />
            {/* Màu chữ: Đen cố định (vì nền là trắng) */}
            <Text className="text-black text-base ml-3">{user?.googleId ? "Đã liên kết với Google" : "Liên kết với Google"}</Text>
          </TouchableOpacity>
        </SettingButton>

        {/* Khóa tài khoản */}
        <SettingButton title="Khóa tài khoản" icon="lock-closed-outline" color="#ff6666">
          {/* Cập nhật màu chữ label */}
          <Text className={`${labelTextColor} text-sm mb-2`}>
            Nhập mật khẩu để xác nhận khóa tài khoản:
          </Text>
          <TextInput
            placeholder="Mật khẩu"
            placeholderTextColor={placeholderTextColor}
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setShowMessage(false);
            }}
            className={`${inputBg} ${inputTextColor} px-4 py-3 rounded-xl mb-3`}
          />
          {showMessage && <Text className="text-red-500 mb-2">*{message}</Text>}
          <TouchableOpacity
            activeOpacity={0.8}
            className="bg-[#ff4d4d] py-3 rounded-xl items-center"
            onPress={() => handleLockAccount()}
          >
            {/* Chữ trên nút khóa tài khoản giữ màu trắng (vì nền luôn là màu đỏ) */}
            <Text className="text-white font-semibold text-base">{loading ? 'Đang xử lý...' : 'Khóa tài khoản'}</Text>
          </TouchableOpacity>
        </SettingButton>
      </View>

      {/* Nút quay lại */}
      <View className="mt-8">
        <CustomButton title="Quay lại" onPress={() => router.back()} iconName="arrow-back" />
      </View>
    </SafeAreaView >
  );
}