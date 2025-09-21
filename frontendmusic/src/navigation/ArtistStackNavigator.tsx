import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ArtistScreen from '../screens/ArtistScreen';
import AllSongsScreen from '../screens/AllSongsScreen';

const Stack = createNativeStackNavigator();

export default function ArtistStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ArtistScreen" component={ArtistScreen} />
      <Stack.Screen name="AllSongsScreen" component={AllSongsScreen} />
    </Stack.Navigator>
  );
}
