import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import YourLibraryScreen from '../screens/YourLibraryScreen';
import LikedSongsScreen from '../screens/LikedSongsScreen';
import DownloadsScreen from '../screens/DownloadsScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import ArtistsFollowingScreen from '../screens/ArtistsFollowingScreen';

const Stack = createNativeStackNavigator();

export default function YourLibraryStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="YourLibraryScreen" component={YourLibraryScreen} />
      <Stack.Screen name="LikedSongsScreen" component={LikedSongsScreen} />
      <Stack.Screen name="DownloadsScreen" component={DownloadsScreen} />
      <Stack.Screen name="PlaylistsScreen" component={PlaylistsScreen} />
      <Stack.Screen name="ArtistsFollowingScreen" component={ArtistsFollowingScreen} />
    </Stack.Navigator>
  );
}
