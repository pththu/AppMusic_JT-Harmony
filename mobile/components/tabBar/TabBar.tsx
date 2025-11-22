import { View, LayoutChangeEvent, useColorScheme } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import TabBarButton from './TabBarButton';
import { useEffect, useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { usePlayerStore } from '@/store/playerStore';
import { useNotificationStore } from '@/store/notificationStore';

function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {

  const setTabBarHeight = usePlayerStore((state) => state.setTabBarHeight);
  const tabBarHeight = usePlayerStore((state) => state.tabBarHeight);
  const tabPositionX = useSharedValue(0);
  const colorScheme = useColorScheme();
  const [dimemsions, setDimemsions] = useState({ height: 20, width: 100 });
  const buttonWidth = dimemsions.width / state.routes.length;
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const onTabBarLayout = (e: LayoutChangeEvent) => {
    const { height, width } = e.nativeEvent.layout;
    setDimemsions({
      height,
      width,
    });
    // if (height > 0 && height !== tabBarHeight) {
    setTabBarHeight(height);
    // }
  };

  const animatiedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionX.value }]
    }
  });

  return (
    <View
      onLayout={onTabBarLayout}
      className={`flex flex-row justify-between items-center shadow-md w-full p-2
        ${colorScheme === "dark" ? "bg-[#121212] " : "bg-white"}`}
    >
      <Animated.View
        className="absolute rounded-full mr-12 ml-12 pl-2 flex items-center justify-center"
        style={[{
          height: dimemsions.height - 15,
          width: buttonWidth / 2,
        },
          animatiedStyle]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        const label = options?.tabBarLabel !== undefined
          ? options.tabBarLabel : options?.title !== undefined
            ? options.title : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          tabPositionX.value = withSpring(buttonWidth * index, { duration: 1500 });
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };
        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const badgeCount = route.name === 'HomeScreen' ? unreadCount : 0;

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? '#22c55e' : 'gray'}
            label={label.toString()}
            badgeCount={badgeCount}
          />
        );
      })}
    </View>
  );
}

export default TabBar;