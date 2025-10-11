// components/items/SettingItem.tsx

import { useTheme } from "@/components/ThemeContext";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

interface SettingItemProps {
  title: string;
  onPress: () => void;
  color?: string; // Dùng cho trường hợp đặc biệt (ví dụ: "red" cho Đăng xuất)
  rightComponent?: React.ReactNode;
}

export default function SettingItem({
  title,
  onPress,
  color,
  rightComponent,
}: SettingItemProps) {
  // Lấy theme hiện tại
  const { theme } = useTheme(); 

  let textColor = "black";
  if (color) {
    textColor = color; // Ưu tiên prop 'color' nếu có (ví dụ: 'red')
  } else if (theme === "dark") {
    textColor = "white"; // Nếu Dark Mode, dùng màu trắng
  } 
  // Logic tính toán màu cho Icon mũi tên (đã đúng)
  let iconColor = textColor; // Tận dụng màu chữ đã tính toán cho icon

  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-2"
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!!rightComponent}
    >
      <Text 
        style={{ color: textColor }}
        className={"text-base font-medium"}
      >
        {title}
      </Text>
      <View>
        {rightComponent ? (
          rightComponent
        ) : (
          // Áp dụng iconColor đã tính toán
          <Icon name="chevron-forward" size={24} color={iconColor} />
        )}
      </View>
    </TouchableOpacity>
  );
}