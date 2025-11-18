import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '@/store/authStore';
import { create } from 'zustand';

export default function AuthLayout() {
  const user = useAuthStore(state => state.user);
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const isGuest = useAuthStore(state => state.isGuest);

  if (isGuest && !isLoggedIn) {
    return <Redirect href="/(tabs)/HomeScreen" />;
  }

  if (!isGuest && isLoggedIn) {
    if (user && !user.completedOnboarding) {
      return <Redirect href="/(onboarding)" />;
    } else {
      return <Redirect href="/(tabs)/HomeScreen" />;
    }
  }

  return (
    <SafeAreaView className='flex-1'>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
