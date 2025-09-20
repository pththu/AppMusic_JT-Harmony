import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import YourLibraryStackNavigator from './YourLibraryStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View className="absolute bottom-5 left-5 right-5 bg-transparent items-center justify-center">
      {/* Nền xám đậm, độ mờ tăng và thêm viền */}
      <View className="flex-row bg-[#222222] rounded-3xl py-2.5 px-4 shadow-xl border border-gray-600">
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName = 'ellipse';
          if (label === 'Home') {
            iconName = isFocused ? 'home' : 'home-outline';
          } else if (label === 'Search') {
            iconName = isFocused ? 'search' : 'search-outline';
          } else if (label === 'Library') {
            iconName = isFocused ? 'library' : 'library-outline';
          } else if (label === 'Profile') {
            iconName = isFocused ? 'person' : 'person-outline';
          }

          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              key={label}
              className="flex-1 items-center justify-center p-1.5 mx-1.5 relative h-12"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 items-center justify-center">
                {isFocused && (
                  <View className="absolute w-12 h-12 rounded-full bg-green-500 -top-2 z-0" />
                )}
                <Icon
                  name={iconName}
                  size={24}
                  color={isFocused ? 'white' : 'white'}
                />
              </View>
              {isFocused && (
                <Text className="text-xs mt-1 text-white font-bold">
                  {label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Library" component={YourLibraryStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}
