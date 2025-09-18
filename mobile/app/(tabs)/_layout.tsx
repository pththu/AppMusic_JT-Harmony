import React from 'react';
import { Tabs } from 'expo-router';

import Colors from '@/constants/colors';
import { useColorScheme } from '@/components/useColorScheme';
import TabBar from '@/components/tabBar/TabBar';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: 'Home'
        }}
      />
      <Tabs.Screen
        name="SearchScreen"
        options={{
          title: 'Search'
        }}
      />
      <Tabs.Screen
        name="YourLibraryScreen"
        options={{
          title: 'Your Library'
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: 'Profile'
        }}
      />
    </Tabs>
  );
}
