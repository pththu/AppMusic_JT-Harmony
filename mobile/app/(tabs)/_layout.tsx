// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import React from "react";
// import { Text, TouchableOpacity, View } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";

// import HomeScreen from "@/app/(tabs)/HomeScreen";
// import ProfileStackNavigator from "@/app/(tabs)/ProfileStackNavigator";
// import SearchScreen from "@/app/(tabs)/SearchScreen";
// import YourLibraryStackNavigator from "@/app/(tabs)/YourLibraryStackNavigator";
// import { SafeAreaView } from "react-native-safe-area-context";

// const Tab = createBottomTabNavigator();

// function CustomTabBar({ state, descriptors, navigation }: any) {
//   return (
//     <SafeAreaView
//       edges={["bottom"]}
//       className="absolute bottom-5 left-5 right-5 bg-transparent items-center justify-center"
//     >
//       <View className="flex-row bg-[#333333] rounded-3xl py-2.5 px-4 shadow-2xl border-2 border-gray-300">
//         {state.routes.map((route: any, index: number) => {
//           const { options } = descriptors[route.key];
//           const label =
//             options.tabBarLabel !== undefined
//               ? options.tabBarLabel
//               : options.title !== undefined
//                 ? options.title
//                 : route.name;

//           const isFocused = state.index === index;

//           const onPress = () => {
//             const event = navigation.emit({
//               type: "tabPress",
//               target: route.key,
//               canPreventDefault: true,
//             });

//             if (!isFocused && !event.defaultPrevented) {
//               navigation.navigate(route.name);
//             }
//           };

//           let iconName = "ellipse";
//           if (label === "Home") {
//             iconName = isFocused ? "home" : "home-outline";
//           } else if (label === "Search") {
//             iconName = isFocused ? "search" : "search-outline";
//           } else if (label === "Library") {
//             iconName = isFocused ? "library" : "library-outline";
//           } else if (label === "Profile") {
//             iconName = isFocused ? "person" : "person-outline";
//           }

//           return (
//             <TouchableOpacity
//               accessibilityRole="button"
//               accessibilityState={isFocused ? { selected: true } : {}}
//               accessibilityLabel={options.tabBarAccessibilityLabel}
//               onPress={onPress}
//               key={label}
//               className="flex-1 items-center justify-center p-1.5 mx-1.5 relative h-12"
//               activeOpacity={0.7}
//             >
//               <View className="w-12 h-12 items-center justify-center">
//                 {isFocused && (
//                   <View className="absolute w-12 h-12 rounded-full bg-green-500 -top-2 z-0" />
//                 )}
//                 <Icon
//                   name={iconName}
//                   size={24}
//                   color={isFocused ? "white" : "white"}
//                 />
//               </View>
//               {isFocused && (
//                 <Text className="text-xs mt-1 text-white font-bold">
//                   {label}
//                 </Text>
//               )}
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     </SafeAreaView>
//   );
// }

// export default function TabNavigator() {
//   return (
//     <Tab.Navigator
//       id={undefined}
//       tabBar={(props) => <CustomTabBar {...props} />}
//       screenOptions={{
//         headerShown: false,
//       }}
//     >
//       <Tab.Screen name="Home" component={HomeScreen} />
//       <Tab.Screen name="Search" component={SearchScreen} />
//       <Tab.Screen name="Library" component={YourLibraryStackNavigator} />
//       <Tab.Screen name="Profile" component={ProfileStackNavigator} />
//     </Tab.Navigator>
//   );
// }

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
        name="SocialScreen"
        options={{
          title: 'Social'
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