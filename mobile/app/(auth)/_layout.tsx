import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthLayout() {

  return (
    <SafeAreaView className='flex-1'>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
