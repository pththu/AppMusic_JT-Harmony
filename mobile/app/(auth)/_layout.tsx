import React from 'react';
import { Stack } from 'expo-router';

export default function TabLayout() {

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Auth Landing',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="LoginScreen"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="SignUpScreen"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
}
