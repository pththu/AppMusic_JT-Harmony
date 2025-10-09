import { useNavigate } from '@/hooks/useNavigate';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { GoogleSignin, } from '@react-native-google-signin/google-signin';
import { ENV } from '@/config/env';
import { LoginWithFacebook, LoginWithGoogle } from '@/routes/ApiRouter';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import useAuthStore from '@/store/authStore';
import { Settings, LoginManager, Profile, AccessToken } from 'react-native-fbsdk-next';

GoogleSignin.configure({
  webClientId: ENV.GOOGLE_OAUTH_WEB_CLIENT_ID_APP,
});
Settings.setAppID(ENV.FACEBOOK_APP_ID);
Settings.initializeSDK();

export default function AuthScreen() {

  const { navigate } = useNavigate();
  const { error, success } = useCustomAlert();
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);

  const handleLoginWithGoogle = async () => {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true
    });

    const loginType = 'google';
    try {
      await GoogleSignin.hasPlayServices();
      const userInfor = await GoogleSignin.signIn();
      const response = await LoginWithGoogle(userInfor.data.user);
      if (!response.success) {
        error('Lỗi đăng nhập', `${response.message}`);
        await GoogleSignin.signOut();
        return;
      }
      if (response.success) {
        login(response.user, loginType, response.user.accessToken);
        success('Đăng nhập thành công', `${response.message}`);
        navigate('Main');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLoginWithFacebook = async () => {
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
            success('Đăng nhập thành công', `${response.message}`);
            login(response.user, loginType, response.user.accessToken);
            navigate('Main');
          }
        }, 1000);
      } 
    } catch (error) {
      console.log('Login fb fail with error: ' + error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black items-center justify-center px-6">
      <View className="flex-row items-center mb-6">
        <Text className="text-4xl font-extrabold text-white mr-4">JT Harmony</Text>
        <View className="flex-row space-x-2">
          <View className="w-4 h-4 rounded-full bg-green-600" />
          <View className="w-4 h-4 rounded-full bg-green-700" />
          <View className="w-4 h-4 rounded-full bg-green-800" />
        </View>
      </View>
      <Text className="text-gray-400 mb-60">Just keep on vibin'</Text>
      <View className="w-full mt-10">
        <TouchableOpacity
          className="bg-green-600 rounded-full w-full py-4 mb-8 items-center flex-row justify-center"
          onPress={() => navigate('Login')}
          activeOpacity={0.7}
        >
          <Text className="text-black font-semibold text-lg">Đăng nhập</Text>
        </TouchableOpacity>
        <View className='self-center flex-row items-center mb-8'>
          <View className='self-center w-[15%] h-[1px] bg-slate-500' />
          <Text className='text-center text-gray-400 mx-4'>Hoặc</Text>
          <View className='self-center w-[15%] h-[1px] bg-slate-500' />
        </View>
        <TouchableOpacity
          className="border border-gray-300 rounded-full w-full py-4 mb-8 flex-row items-center justify-center"
          onPress={() => handleLoginWithGoogle()}
          activeOpacity={0.7}
        >
          <AntDesign name="google" size={20} color="white" className="mr-2" />
          <Text className="text-white text-base font-semibold">
            Đăng nhập với Google
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="border border-gray-300 rounded-full w-full py-4 mb-8 flex-row items-center justify-center"
          onPress={() => handleLoginWithFacebook()}
          activeOpacity={0.7}
        >
          <Icon name="facebook" size={20} color="white" className="mr-2" />
          <Text className="text-white text-base font-semibold">
            Đăng nhập với Facebook
          </Text>
        </TouchableOpacity>
        <Text className="text-gray-400 text-center mb-4 underline">
          Bạn chưa có tài khoản?
        </Text>
        <TouchableOpacity
          className="items-center bg-white rounded-full w-full py-4 flex-row justify-center"
          onPress={() => navigate('SignUp')}
          activeOpacity={0.7}
        >
          <Icon name="person-add" size={20} color="black" className="mr-2" />
          <Text className="text-black font-semibold text-lg">Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
