import useAuthStore from "@/store/authStore";
import { Redirect, Stack } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScreenLayout() {

  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const isGuest = useAuthStore(state => state.isGuest);

  if (!isGuest) {
    if (!isLoggedIn) {
      return <Redirect href="/(auth)" />;
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}