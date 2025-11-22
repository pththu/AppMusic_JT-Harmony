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

import { ThemeProvider, useTheme } from "@/components/ThemeContext";
import { AlertProvider } from "@/context/AlertContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import MiniPlayer from "@/components/player/MiniPlayer";
import GlobalPlayer from "@/components/player/GlobalPlayer";
import { usePlayerStore } from "@/store/playerStore";
import { useFollowStore } from "@/store/followStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useHistoriesStore } from "@/store/historiesStore";

import { useGuestTriggers } from "@/hooks/useGuestTriggers";
import LoginWall from "@/components/guest/LoginWall";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const setCurrentPlaylist = usePlayerStore((state) => state.setCurrentPlaylist);
  const setCurrentAlbum = usePlayerStore((state) => state.setCurrentAlbum);
  const setCurrentArtist = useFollowStore((state) => state.setCurrentArtist);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setListTrack = usePlayerStore((state) => state.setListTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const setMyPlaylists = usePlayerStore((state) => state.setMyPlaylists);
  const setFavoriteItems = useFavoritesStore((state) => state.setFavoriteItems);
  const setArtistFollowed = useFollowStore((state) => state.setArtistFollowed);
  const setListenHistory = useHistoriesStore((state) => state.setListenHistory);
  const setSearchHistory = useHistoriesStore((state) => state.setSearchHistory);
  const setIsShuffled = usePlayerStore((state) => state.setIsShuffled);
  const setRepeatMode = usePlayerStore((state) => state.setRepeatMode);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setMiniPlayerVisible = usePlayerStore((state) => state.setMiniPlayerVisible);

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

  // useEffect(() => {
  //   setCurrentPlaylist(null);
  //   setCurrentAlbum(null);
  //   setCurrentArtist(null);
  //   setCurrentTrack(null);
  //   setIsShuffled(false);
  //   setRepeatMode("none");
  //   setDuration(0);
  //   setMiniPlayerVisible(false);
  //   setListTrack([]);
  //   setQueue([]);
  //   setMyPlaylists([]);
  //   setFavoriteItems([]);
  //   setArtistFollowed([]);
  //   setListenHistory([]);
  //   setSearchHistory([]);
  //   const logout = async () => {
  //     await GoogleSignin.signOut();
  //   }
  //   logout();
  // }, []);

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