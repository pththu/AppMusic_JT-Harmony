import { useTheme } from "@/components/ThemeContext"; 
import React from "react";
// 💡 CẦN IMPORT CustomButton
import CustomButton from "@/components/custom/CustomButton";
import { Ionicons as Icon } from '@expo/vector-icons';


export const ThemeToggle = () => {
  // Lấy theme hiện tại và hàm chuyển đổi từ context
  const { theme, toggleTheme } = useTheme();

  // 1. Xác định nội dung và biểu tượng dựa trên theme hiện tại
  const buttonTitle = theme === "light" ? "" : "";
  const iconName = theme === "light" ? "moon" : "sunny";

  // 2. Sử dụng CustomButton thay cho Pressable/Text thủ công
  return (
    <CustomButton
      title={buttonTitle}
      onPress={toggleTheme}
      iconName={iconName}
      variant="primary" 
    className="px-3 py-1"
    />
  );
};