import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import ArtistStackNavigator from './ArtistStackNavigator';
import LikedSongsScreen from '../screens/LikedSongsScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import ArtistsFollowingScreen from '../screens/ArtistsFollowingScreen';

const Stack = createNativeStackNavigator();

export default function BottomTabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="ArtistStack" component={ArtistStackNavigator} />
      <Stack.Screen
        name="LikedSongsScreen"
        component={LikedSongsScreen}
        options={{
          animation: 'none',
        }}
      />
      <Stack.Screen
        name="PlaylistsScreen"
        component={PlaylistsScreen}
        options={{
          animation: 'none',
        }}
      />
      <Stack.Screen
        name="ArtistsFollowingScreen"
        component={ArtistsFollowingScreen}
        options={{
          animation: 'none',
        }}
      />
    </Stack.Navigator>
  );
}
