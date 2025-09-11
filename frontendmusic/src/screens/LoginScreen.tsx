import React, { useState } from 'react';
import { Text, TouchableOpacity, ScrollView, Alert, View } from 'react-native';
import CustomTextInput from '../components/CustomTextInput';

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('123456');

  const handleLogin = () => {
    if (username !== 'user' || password !== '123456') {
      Alert.alert('Error', 'Invalid username or password.');
      return;
    }
    // Successful login, navigate to Main screen
    navigation.navigate('Main');
  };

  return (
    <ScrollView className="flex-1 bg-black px-8 py-40">
      <Text className="text-white text-3xl font-extrabold mb-6 text-center">
        Log In
      </Text>

      <CustomTextInput
        placeholder="Enter username or email"
        value={username}
        onChangeText={setUsername}
        iconName="person"
        autoCapitalize="none"
      />

      <CustomTextInput
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        iconName="lock"
        secureTextEntry
      />

      <TouchableOpacity
        className="bg-white rounded-full py-4 items-center mb-4"
        onPress={handleLogin}
        activeOpacity={0.7}
      >
        <Text className="text-black font-semibold text-lg">Log In</Text>
      </TouchableOpacity>

      <View className="items-center">
        <Text className="text-gray-300">Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text className="text-white underline">Sign up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
