import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect, Stack } from 'expo-router'
import useAuthStore from '@/store/authStore';

export default function BoardingLayout() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  )
}