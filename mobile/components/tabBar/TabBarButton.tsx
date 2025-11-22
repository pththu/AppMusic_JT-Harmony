import { View, Text, Pressable } from 'react-native'
import React, { useEffect } from 'react'
import { icons } from '@/constants/icons';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface TabBarButtonProps {
  onPress: Function;
  onLongPress: Function;
  isFocused: boolean;
  routeName: string;
  color: string;
  label: string;
  badgeCount?: number;
}

const TabBarButton = ({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  color,
  label,
  badgeCount = 0,
}: TabBarButtonProps) => {

  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withSpring(
      typeof isFocused === 'boolean' ? (isFocused ? 1 : 0) : isFocused,
      { duration: 350 }
    );
  }, [scale, isFocused]);

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [0, 1])
    return {
      opacity
    }
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);
    const top = interpolate(scale.value, [0, 1], [9, 0]);
    return {
      transform: [{ 
        scale: scaleValue
      }],
      top
    }
  });

  return (
    <Pressable
      onPress={() => onPress()}
      onLongPress={() => onLongPress()}
      className='flex-1 flex items-center justify-center p-2'
    >
      <Animated.View style={animatedIconStyle} className="relative">
        {icons[routeName]?.({
          color: isFocused ? '#22c55e' : 'gray'
        })}
        {badgeCount > 0 && (
          <View className="absolute -top-1 -right-2 min-w-[16px] px-1 h-4 rounded-full bg-red-500 items-center justify-center">
            <Text className="text-[10px] text-white font-semibold">
              {badgeCount > 9 ? '9+' : badgeCount}
            </Text>
          </View>
        )}
      </Animated.View>
      <Animated.Text 
        className={`text-xs ${isFocused ? 'text-[#22c55e] font-bold text-base' : 'text-gray-400'}`} 
        style={animatedTextStyle}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

export default TabBarButton;