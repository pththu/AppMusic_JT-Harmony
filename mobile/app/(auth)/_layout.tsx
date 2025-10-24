import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '@/store/authStore';

export default function AuthLayout() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  if (isLoggedIn) {
    return <Redirect href="/(tabs)/HomeScreen" />;
  }

  return (
    <SafeAreaView className='flex-1'>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
