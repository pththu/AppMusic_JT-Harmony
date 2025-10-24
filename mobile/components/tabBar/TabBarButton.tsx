import { View, Text, Pressable } from 'react-native'
import React, { useEffect } from 'react'
import { icons } from '@/constants/icons';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const TabBarButton = ({
  onPress, onLongPress, isFocused, routeName, color, label
}: {
  onPress: Function; onLongPress: Function; isFocused: boolean; routeName: string; color: string; label: string;
}) => {

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
      <Animated.View style={animatedIconStyle}>
        {icons[routeName]?.({
          color: isFocused ? '#22c55e' : 'gray'
        })}
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