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
// Đảm bảo đã import View
import { View } from "react-native"; 
import "react-native-reanimated";

import { ThemeProvider, useTheme } from "@/components/ThemeContext";
import { AlertProvider } from "@/context/AlertContext";
// Đã import SafeAreaProvider, đây là cấu trúc đúng
import { SafeAreaProvider } from "react-native-safe-area-context";

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

  if (!loaded) {
    // ✅ SỬA LỖI: Thay return null; bằng return <View />;
    return <View />; 
  }

  // Cấu trúc Providers ở cấp độ cao nhất
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { theme: colorScheme, isThemeLoaded } = useTheme();
  
  if (!isThemeLoaded) {
    // ✅ SỬA LỖI: Thay return null; bằng return <View />;
    return <View />;
  }

  return (
    <NavigationThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      {/* Nền Light Mode là trắng, Dark Mode là đen/xám đậm */}
      <View className="flex-1 bg-white dark:bg-black"> 
        <SafeAreaProvider>
          {/* AlertProvider bọc toàn bộ định tuyến */}
          <AlertProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(screens)" options={{ headerShown: false }} />
            </Stack>
          </AlertProvider>
        </SafeAreaProvider>
      </View>
    </NavigationThemeProvider>
  );
}