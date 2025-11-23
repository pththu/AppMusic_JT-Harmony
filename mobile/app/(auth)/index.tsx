import { useNavigate } from '@/hooks/useNavigate';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Image, ActivityIndicator } from 'react-native';
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
import { useBoardingStore } from '@/store/boardingStore';
import { useAuthData } from '@/hooks/useAuthData';

GoogleSignin.configure({
  webClientId: ENV.GOOGLE_OAUTH_WEB_CLIENT_ID_APP,
});
Settings.setAppID(ENV.FACEBOOK_APP_ID);
Settings.initializeSDK();

export default function AuthScreen() {

  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const { error, success } = useCustomAlert();
  const login = useAuthStore(state => state.login);
  const setIsGuest = useAuthStore(state => state.setIsGuest);
  const setWhenLogin = useBoardingStore(state => state.setWhenLogin);

  const [isLoading, setIsLoading] = useState(false);

  const {
    fetchHistory,
    fetchFavoritesItem,
    fetchArtistFollowed,
    fetchMyPlaylists,
    fetchFollowers,
    fetchFollowees
  } = useAuthData();

  const handleLoginWithGoogle = async () => {
    const loginType = 'google';
    await GoogleSignin.hasPlayServices();
    const userInfor = await GoogleSignin.signIn();
    const profileToSend = userInfor.data?.user;

    if (!profileToSend || !profileToSend.email || !profileToSend.id) {
      throw new Error('Dữ liệu Google Profile bị thiếu: Email hoặc ID.');
    }

    const response = await LoginWithGoogle(profileToSend);
    try {
      // console.log('response', response)
      if (!response.success) {
        error('Lỗi đăng nhập', `${response.message}`);
        await GoogleSignin.signOut();
        return;
      }

      if (response.success) {
        setIsLoading(true);
        setWhenLogin();
        const userId = response.user.id;
        await Promise.all([
          fetchHistory(userId),
          fetchFavoritesItem(userId),
          fetchArtistFollowed(userId),
          fetchMyPlaylists(userId),
          fetchFollowers(userId),
          fetchFollowees(userId)
        ]);
        setIsLoading(false);
        success('Đăng nhập thành công');
        login(response.user, loginType, response.user.accessToken);
        // navigate('Main');
      }

    } catch (err) {
      let errorMessage = 'Không thể đăng nhập với Google. Vui lòng thử lại.';
      if (err.message && err.message.includes('Google Profile')) {
        errorMessage = err.message;
      }

      if (typeof error === 'function') {
        error('Lỗi đăng nhập', errorMessage);
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
              setIsLoading(true);
              error('Lỗi đăng nhập', `${response.message}`);
              LoginManager.logOut();
              return;
            }
            const userId = response.user.id;
            setWhenLogin();
            await Promise.all([
              fetchHistory(userId),
              fetchFavoritesItem(userId),
              fetchArtistFollowed(userId),
              fetchMyPlaylists(userId),
              fetchFollowers(userId),
              fetchFollowees(userId)
            ])
            setIsLoading(false);
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

  if (isLoading) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center px-6 ${colorScheme === "dark" ? "bg-[#0E0C1F]" : "bg-white"}`}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className={`mt-4 text-lg ${colorScheme === "dark" ? "text-white" : "text-black"}`}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
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
