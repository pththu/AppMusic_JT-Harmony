import { Stack } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScreenLayout() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
