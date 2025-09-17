import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import YourLibraryScreen from '../screens/YourLibraryScreen';
import DownloadsScreen from '../screens/DownloadsScreen';
import SongScreen from '../screens/SongScreen';
import QueueScreen from '../screens/QueueScreen';

export type YourLibraryStackParamList = {
  YourLibraryScreen: undefined;
  DownloadsScreen: undefined;
  SongScreen: { song: { id: string; title: string; artist: string; image: string } };
  QueueScreen: undefined;
};

const Stack = createNativeStackNavigator<YourLibraryStackParamList>();

export default function YourLibraryStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="YourLibraryScreen" component={YourLibraryScreen} />
      <Stack.Screen name="DownloadsScreen" component={DownloadsScreen} />
      <Stack.Screen name="SongScreen" component={SongScreen} />
      <Stack.Screen name="QueueScreen" component={QueueScreen} />
    </Stack.Navigator>
  );
}
