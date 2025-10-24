import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, Animated, LayoutAnimation, Platform, UIManager } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@/components/ThemeContext"; // Import useTheme để lấy theme

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function SettingButton({
  title,
  icon,
  color, // Bỏ giá trị mặc định #fff ở đây
  children,
  onPress,
}: {
  title: string;
  icon: string;
  color?: string;
  children?: React.ReactNode;
  onPress?: () => void;
}) {
  const { theme } = useTheme(); // Lấy theme
  
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [expanded]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };
  
  // LOGIC MÀU ICON CHÍNH: Nếu không có prop `color` được truyền, sử dụng màu động.
  const defaultIconColor = theme === 'dark' ? '#fff' : '#000';
  const finalIconColor = color || defaultIconColor;

  // Logic màu cho Light/Dark Mode
  const buttonBg = 'bg-gray-100 dark:bg-[#1A1833]';
  const titleTextColor = 'text-black dark:text-white';
  const chevronColor = '#6B7280'; // gray-500/600

  // Màu Ripple
  const rippleColor = Platform.OS === 'android' ? { color: '#CCC' } : undefined;

  return (
    <View className="mb-3">
      <Pressable
        onPress={onPress ? onPress : toggleExpand}
        className={`flex-row items-center justify-between p-4 rounded-2xl ${buttonBg}`}
        android_ripple={rippleColor}
      >
        <View className="flex-row items-center">
          <Icon name={icon} size={22} color={finalIconColor} /> 
          <Text className={`${titleTextColor} text-base ml-3`}>{title}</Text>
        </View>
        {children && (
          <Animated.View style={{ transform: [{ rotateZ: rotation }] }}>
            <Icon name="chevron-forward" size={20} color={chevronColor} />
          </Animated.View>
        )}
      </Pressable>
      {expanded && children && <View className="mt-3 ml-2">{children}</View>}
    </View>
  );
}