import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import EditProfileScreen from "../../app/(screens)/EditProfileScreen";
import ProfileScreen from "../../app/(tabs)/ProfileScreen";

const Stack = createNativeStackNavigator();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator id={undefined}>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
