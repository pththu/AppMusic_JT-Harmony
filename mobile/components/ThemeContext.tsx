import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import React, { createContext, useContext, useEffect, useState } from "react";
import { View } from "react-native";

// Khởi tạo Context
export const ThemeContext = createContext({
  theme: "light", // Giá trị mặc định
  setTheme: (mode) => {},
  toggleTheme: () => {},
  isThemeLoaded: false,
});

// Khóa dùng để lưu trữ trong AsyncStorage
const STORAGE_KEY = "theme_mode";

export const ThemeProvider = ({ children }) => {
  // 1. Sử dụng useColorScheme của NativeWind
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Hàm để lưu chế độ hiện tại vào AsyncStorage và cập nhật NativeWind
  // HÀM ĐỂ LƯU CHẾ ĐỘ HIỆN TẠI
  const saveTheme = async (mode) => {
    // 'mode' là string: 'light' hoặc 'dark'
    try {
      // 1. AsyncStorage: Đảm bảo cú pháp và đối số là string
      await AsyncStorage.setItem(STORAGE_KEY, mode);

      // 2. NativeWind Setter: Cập nhật chế độ
      setColorScheme(mode);
    } catch (e) {
      // 3. Khắc phục lỗi Linter cho console.warn
      console.log("Lỗi khi lưu chế độ:", e); // Thay console.warn bằng console.log
    }
  };

  // HÀM ĐỂ TẢI CHẾ ĐỘ ĐÃ LƯU KHI ỨNG DỤNG KHỞI ĐỘNG
  const loadTheme = async () => {
    try {
      // 4. AsyncStorage.getItem: Trả về string hoặc null
      const storedTheme = await AsyncStorage.getItem(STORAGE_KEY);

      if (storedTheme) {
        // 5. Cập nhật NativeWind Setter
        setColorScheme(storedTheme);
      }
    } catch (e) {
      // 6. Khắc phục lỗi Linter
      console.log("Lỗi khi tải chế độ:", e); // Thay console.warn bằng console.log
    } finally {
      // 7. React State Setter: Đảm bảo cú pháp đúng
      setIsThemeLoaded(true);
    }
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const contextValue = {
    theme: colorScheme,
    setTheme: saveTheme,
    isThemeLoaded,
    toggleTheme: () => {
      const newMode = colorScheme === "light" ? "dark" : "light";
      saveTheme(newMode);
    },
  };

  if (!isThemeLoaded) {
    return <View />;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);