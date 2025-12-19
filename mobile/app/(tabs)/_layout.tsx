// app/(tabs)/_layout.tsx
import { Redirect, Tabs } from "expo-router";
import React, { useEffect } from "react";

import TabBar from "@/components/tabBar/TabBar";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/colors";
import { useSocket } from "@/hooks/useSocket";
import { fetchUnreadNotificationCount } from "@/services/notificationService";
import * as SocketService from "@/services/UnifiedSocketService";
import useAuthStore from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isGuest = useAuthStore((state) => state.isGuest);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const incrementUnreadCount = useNotificationStore((state) => state.incrementUnreadCount);
  const prependNotification = useNotificationStore((state) => state.prependNotification);
  const clearNotifications = useNotificationStore((state) => state.clearNotifications);

  // ✅ Khởi tạo socket connection (chỉ một lần ở đây)
  const { isConnected } = useSocket();

  useEffect(() => {
    if (!isLoggedIn) {
      clearNotifications();
      return;
    }

    let isMounted = true;

    // Fetch unread notification count
    (async () => {
      try {
        const count = await fetchUnreadNotificationCount();
        if (isMounted) {
          setUnreadCount(count);
        }
      } catch (error) {
        console.warn("Failed to fetch unread notifications", error);
      }
    })();

    // Listen to new notifications
    const unsubscribe = SocketService.on('notification:new', (notification) => {
      if (isMounted) {
        prependNotification(notification);
        incrementUnreadCount();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [
    isLoggedIn,
    setUnreadCount,
    incrementUnreadCount,
    prependNotification,
    clearNotifications,
  ]);

  if (!isGuest) {
    if (!isLoggedIn) {
      return <Redirect href="/(auth)" />;
    }
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