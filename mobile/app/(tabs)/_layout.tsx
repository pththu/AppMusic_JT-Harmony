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
    </Tabs>
  );
}
