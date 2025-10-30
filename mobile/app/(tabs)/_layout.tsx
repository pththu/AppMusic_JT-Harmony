import { Redirect, Tabs } from "expo-router";
import React from "react";

import TabBar from "@/components/tabBar/TabBar";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/colors";
import useAuthStore from "@/store/authStore";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="SearchScreen"
        options={{
          title: "Search",
        }}
      />
      <Tabs.Screen
        name="SocialScreen"
        options={{
          title: "Social",
        }}
      />
      <Tabs.Screen
        name="YourLibraryScreen"
        options={{
          title: "Your Library",
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profile",
        }}
      />

      <Tabs.Screen
        name="AddTrackScreen"
        options={{
          href: null,

        }}
      />
      <Tabs.Screen
        name="AlbumScreen"
        options={{
          href: null,
          title: "Album",
        }}
      />
      <Tabs.Screen
        name="AllPlaylistScreen"
        options={{
          href: null,
          title: "All Playlists",
        }}
      />
      <Tabs.Screen
        name="AllSongsScreen"
        options={{
          href: null,
          title: "All Songs",
        }}
      />
      <Tabs.Screen
        name="ArtistScreen"
        options={{
          href: null,
          title: "Artist",
        }}
      />
      <Tabs.Screen
        name="ArtistsFollowingScreen"
        options={{
          href: null,
          title: "Artists Following",
        }}
      />
      <Tabs.Screen
        name="ChangePasswordScreen"
        options={{
          href: null,
          title: "Change Password",
        }}
      />
      <Tabs.Screen
        name="ChatScreen"
        options={{
          href: null,
          title: "Chat",
        }}
      />
      <Tabs.Screen
        name="DownloadQualityScreen"
        options={{
          href: null,
          title: "Download Quality",
        }}
      />
      <Tabs.Screen
        name="DownloadsScreen"
        options={{
          href: null,
          title: "Downloads",
        }}
      />
      <Tabs.Screen
        name="EditProfileScreen"
        options={{
          href: null,
          title: "Edit Profile",
        }}
      />
      <Tabs.Screen
        name="LikedSongsScreen"
        options={{
          href: null,
          title: "Liked Songs",
        }}
      />
      <Tabs.Screen
        name="MusicLanguageScreen"
        options={{
          href: null,
          title: "Music Language",
        }}
      />
      <Tabs.Screen
        name="PlaylistScreen"
        options={{
          href: null,
          title: "Playlist",
        }}
      />
      <Tabs.Screen
        name="ProfileSocialScreen"
        options={{
          href: null,
          title: "Profile Social",
        }}
      />
      <Tabs.Screen
        name="QueueScreen"
        options={{
          href: null,
          title: "Queue",
        }}
      />
      <Tabs.Screen
        name="SettingScreen"
        options={{
          href: null,
          title: "Settings",
        }}
      />
      <Tabs.Screen
        name="SongInfoScreen"
        options={{
          href: null,
          title: "Song Info",
        }}
      />
      <Tabs.Screen
        name="StreamingQualityScreen"
        options={{
          href: null,
          title: "Streaming Quality",
        }}
      />
      <Tabs.Screen
        name="UpdateEmailScreen"
        options={{
          href: null,
          title: "Update Email",
        }}
      />
      <Tabs.Screen
        name="SongScreen"
        options={{
          href: null,
          title: "Song",
        }}
      />
    </Tabs>
  );
}
