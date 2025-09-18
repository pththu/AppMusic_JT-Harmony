import { View, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import TabBarButton from './TabBarButton';
import { useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {

  const tabPositionX = useSharedValue(0);
  const [dimemsions, setDimemsions] = useState({ height: 20, width: 100 });
  const buttonWidth = dimemsions.width / state.routes.length;

  const onTabBarLayout = (e: LayoutChangeEvent) => {
    setDimemsions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    });
  };

  const animatiedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionX.value }]
    }
  });

  return (
    <View
      onLayout={onTabBarLayout}
      className='absolute bottom-0 flex flex-row justify-between items-center bg-[#121212] shadow-md w-full p-2'
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

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? '#22c55e' : 'gray'}
            label={label.toString()}
          />
        );
      })}
    </View>
  );
}

export default TabBar;