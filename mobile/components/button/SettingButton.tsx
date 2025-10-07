// import React from "react";
// import { View, Text, Pressable } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";

// export default function SettingButton({ title, icon, onPress, color = "#fff" }) {
//   return (
//     <Pressable
//       onPress={onPress}
//       className="flex-row items-center justify-between bg-[#1A1833] p-4 rounded-2xl mb-3"
//       android_ripple={{ color: "#333" }}
//     >
//       <View className="flex-row items-center">
//         <Icon name={icon} size={22} color={color} />
//         <Text className="text-white text-base ml-3">{title}</Text>
//       </View>
//       <Icon name="chevron-forward" size={20} color="#9CA3AF" />
//     </Pressable>
//   );
// }

import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, Animated, LayoutAnimation, Platform, UIManager } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function SettingButton({
  title,
  icon,
  color = "#fff",
  children,
  onPress,
}: {
  title: string;
  icon: string;
  color?: string;
  children?: React.ReactNode;
  onPress?: () => void;
}) {
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

  return (
    <View className="mb-3">
      <Pressable
        onPress={onPress ? onPress : toggleExpand}
        className="flex-row items-center justify-between bg-[#1A1833] p-4 rounded-2xl"
        android_ripple={{ color: "#333" }}
      >
        <View className="flex-row items-center">
          <Icon name={icon} size={22} color={color} />
          <Text className="text-white text-base ml-3">{title}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotateZ: rotation }] }}>
          <Icon name="chevron-forward" size={20} color="#9CA3AF" />
        </Animated.View>
      </Pressable>

      {expanded && children && <View className="mt-3 ml-2">{children}</View>}
    </View>
  );
}
