import React from "react";
import { Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

interface SettingItemProps {
  title: string;
  onPress: () => void;
  color?: string; // Thêm prop color tùy chọn
}

export default function SettingItem({
  title,
  onPress,
  color = "white",
}: SettingItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-4"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text className="text-base font-medium" style={{ color: color }}>
        {title}
      </Text>
      <Icon name="chevron-forward" size={24} color={color} />
    </TouchableOpacity>
  );
}
