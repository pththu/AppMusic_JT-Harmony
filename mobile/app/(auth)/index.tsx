import { useNavigate } from '@/hooks/useNavigate';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { GoogleSignin, } from '@react-native-google-signin/google-signin';
import { ENV } from '@/config/env';
import { LoginWithFacebook, LoginWithGoogle } from '@/routes/ApiRouter';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import useAuthStore from '@/store/authStore';
import { Settings, LoginManager, Profile, AccessToken } from 'react-native-fbsdk-next';
import { Pressable } from 'react-native';

GoogleSignin.configure({
  webClientId: ENV.GOOGLE_OAUTH_WEB_CLIENT_ID_APP,
});
Settings.setAppID(ENV.FACEBOOK_APP_ID);
Settings.initializeSDK();

export default function AuthScreen() {

  const { navigate } = useNavigate();
  const { error, success } = useCustomAlert();
  const colorScheme = useColorScheme();
  const login = useAuthStore(state => state.login);
  const setIsGuest = useAuthStore(state => state.setIsGuest);
  const { error: showAlertError, success: showAlertSuccess } = useCustomAlert();

  const handleLoginWithGoogle = async () => {
    //  Đổi tên alert để tránh xung đột với biến 'error' trong khối catch

    const loginType = 'google';

    try {
      await GoogleSignin.hasPlayServices();
      const userInfor = await GoogleSignin.signIn();

      const profileToSend = userInfor.data?.user;

      // Kiểm tra dữ liệu
      if (!profileToSend || !profileToSend.email || !profileToSend.id) {
        throw new Error('Dữ liệu Google Profile bị thiếu: Email hoặc ID.');
      }

      // 1. Gửi dữ liệu user profile đã trích xuất lên server
      const response = await LoginWithGoogle(profileToSend);

      if (!response.success) {
        showAlertError('Lỗi đăng nhập', `${response.message}`);
        await GoogleSignin.signOut();
        return;
      }

      if (response.success) {
        login(response.user, loginType, response.user.accessToken);
        showAlertSuccess('Đăng nhập thành công');
        navigate('Main');
      }

    } catch (error) {
      let errorMessage = 'Không thể đăng nhập với Google. Vui lòng thử lại.';
      if (error.message && error.message.includes('Google Profile')) {
        errorMessage = error.message;
      }

      if (typeof showAlertError === 'function') {
        showAlertError('Lỗi đăng nhập', errorMessage);
      } else {
        console.error('LỖI CẤU HÌNH: Hàm showAlertError không phải là hàm.');
      }

      await GoogleSignin.signOut();
    }
  };

  const handleLoginWithFacebook = async () => {
    console.log('first')
    const loginType = 'facebook';
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile']);
      if (result.isCancelled) {
        error('Lỗi đăng nhập', 'Đăng nhập bị hủy');
        return;
      } else {
        const data = await AccessToken.getCurrentAccessToken();
        if (!data) {
          return;
        }

        setTimeout(async () => {
          const profile = await Profile.getCurrentProfile();
          if (profile) {
            const response = await LoginWithFacebook(profile);
            if (!response.success) {
              error('Lỗi đăng nhập', `${response.message}`);
              LoginManager.logOut();
              return;
            }
            success('Đăng nhập thành công');
            login(response.user, loginType, response.user.accessToken);
            navigate('Main');
          }
        }, 1000);
      }
    } catch (error) {
      console.log('Login fb fail with error: ' + error);
    }
  };

  const goHome = () => {
    setIsGuest(true);
  }

  return (
    <SafeAreaView className={`flex-1 items-center justify-center px-6 ${colorScheme === "dark" ? "bg-[#0E0C1F]" : "bg-white"}`}>
      <Pressable className="flex-row items-center mb-6"
        onPress={() => goHome()}
      >
        <Image
          source={require('@/assets/images/logo_final.png')}
          className='w-40 h-40'
        />
      </Pressable>
      <Text className={`text-4xl font-extrabold ${colorScheme === "dark" ? "text-white" : "text-[#0E0C1F]"} mr-4`}>JT Harmony</Text>
      <View className='flex-row mb-40 mt-4'>
        <View className="w-4 h-4 rounded-full bg-green-600" />
        <View className="w-4 h-4 rounded-full bg-green-700" />
        <View className="w-4 h-4 rounded-full bg-green-800" />
      </View>
      <View className="w-full">
        <TouchableOpacity
          className={`${colorScheme === 'dark' ? 'bg-green-600' : 'bg-green-500'} rounded-full w-full py-4 mb-8 items-center flex-row justify-center`}
          onPress={() => navigate('Login')}
          activeOpacity={0.7}
        >
          <Text className="text-black font-semibold text-lg">Đăng nhập</Text>
        </TouchableOpacity>
        <View className='self-center flex-row items-center mb-8'>
          <View className={`self-center w-[15%] h-[1px] ${colorScheme === "dark" ? "bg-slate-500" : "bg-slate-300"}`} />
          <Text className='text-center text-gray-400 mx-4'>Hoặc</Text>
          <View className={`self-center w-[15%] h-[1px] ${colorScheme === "dark" ? "bg-slate-500" : "bg-slate-300"}`} />
        </View>
        <TouchableOpacity
          className={`border ${colorScheme === "dark" ? "border-gray-500" : "border-green-300"} rounded-full w-full py-4 mb-8 flex-row items-center justify-center `}
          onPress={() => handleLoginWithGoogle()}
          activeOpacity={0.7}
        >
          <AntDesign name="google" size={20} color={colorScheme === "dark" ? "white" : "black"} />
          <Text className={`text-base font-semibold ml-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
            Đăng nhập với Google
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`border ${colorScheme === "dark" ? "border-gray-500" : "border-green-300"} rounded-full w-full py-4 mb-8 flex-row items-center justify-center`}
          onPress={() => handleLoginWithFacebook()}
          activeOpacity={0.7}
        >
          <Icon name="facebook" size={20} color={colorScheme === "dark" ? "white" : "black"} />
          <Text className={`text-base font-semibold ml-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
            Đăng nhập với Facebook
          </Text>
        </TouchableOpacity>
        <Text className="text-gray-400 text-center mb-4 underline">
          Bạn chưa có tài khoản?
        </Text>
        <TouchableOpacity
          className={`items-center ${colorScheme === "dark" ? "bg-white" : "bg-green-300"} rounded-full w-full py-4 flex-row justify-center`}
          onPress={() => navigate('SignUp')}
          activeOpacity={0.7}
        >
          <Icon name="person-add" size={20} color="black" />
          <Text className="text-black font-semibold text-lg ml-2">Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
