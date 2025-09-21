import React, { useState } from 'react';
import { Text, TouchableOpacity, ScrollView, Alert, View, Pressable } from 'react-native';
import CustomTextInput from '@/components/custom/CustomTextInput';
import { useNavigate } from '@/hooks/useNavigate';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { Login } from '@/routes/ApiRouter';

export default function LoginScreen() {
  const { navigate } = useNavigate();
  const { success, error } = useCustomAlert();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Email không hợp lệ.');
      return false;
    }
    return true;
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      setMessage('Mật khẩu phải có ít nhất 8 ký tự.');
      return false;
    }
    return true;
  }

  const validateForm = () => {
    if (!email || !password) {
      setMessage('Vui lòng điền đầy đủ thông tin.');
      return false;
    }
    if (!validateEmail(email)) {
      return false;
    }
    if (!validatePassword(password)) {
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      console.log('Validation failed 1:', message);
      error('Lỗi Đăng Nhập', message);
      return;
    }
    try {
      const payload = { email, password };
      const response = await Login(payload);
      console.log(response);
      if (response.statusCode === 200) {
        success('Thành Công', 'Đăng nhập thành công!', () => navigate('Main'));
      }
    } catch (error) {
      console.error('Login error:', error);
      error('Lỗi Đăng Nhập', 'Đã xảy ra lỗi trong quá trình đăng nhập.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-black px-8 py-40">
      <Text className="text-white text-3xl font-extrabold mb-6 text-center">
        Đăng nhập
      </Text>

      <CustomTextInput
        placeholder="Nhập email"
        value={email}
        onChangeText={setEmail}
        iconName="person"
        autoCapitalize="none"
      />

      <CustomTextInput
        placeholder="Nhập mật khẩu"
        value={password}
        onChangeText={setPassword}
        iconName="lock"
        secureTextEntry
      />

      <TouchableOpacity
        className="bg-white rounded-full py-4 items-center mb-4"
        onPress={handleLogin}
        activeOpacity={0.8}
      >
        <Text className="text-black font-semibold text-lg">Đăng nhập</Text>
      </TouchableOpacity>

      <View className="items-center">
        <Text className="text-gray-300">Bạn chưa có tài khoản? </Text>
        <Pressable onPress={() => navigate('SignUp')}>
          <Text className="text-white underline">Đăng ký</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
