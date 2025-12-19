import "@/global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";

import GlobalPlayer from "@/components/player/GlobalPlayer";
import MiniPlayer from "@/components/player/MiniPlayer";
import { ThemeProvider, useTheme } from "@/components/ThemeContext";
import { AlertProvider } from "@/context/AlertContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

import LoginWall from "@/components/guest/LoginWall";
import { useGuestTriggers } from "@/hooks/useGuestTriggers";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {


  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useGuestTriggers();

  if (!loaded) {
    return <View />;
  }

  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { theme: colorScheme, isThemeLoaded } = useTheme();

  if (!isThemeLoaded) {
    return <View />;
  }

  return (
    <NavigationThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <View className="flex-1 bg-white dark:bg-black">
        <SafeAreaProvider>
          <AlertProvider>
            <Stack initialRouteName="(tabs)">
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(screens)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            </Stack>
            <MiniPlayer />
            <GlobalPlayer />
            <LoginWall />
          </AlertProvider>
        </SafeAreaProvider>
      </View>
    </NavigationThemeProvider>
  );
}