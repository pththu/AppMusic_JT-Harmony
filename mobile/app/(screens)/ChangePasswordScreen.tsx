import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomTextInput from "@/components/custom/CustomTextInput";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { ChangePassword } from "@/routes/ApiRouter";
import { router } from "expo-router";
// import { useTheme } from "@/components/ThemeContext"; // Cần import nếu bạn sử dụng hook này

export default function ChangePasswordScreen() {
  // const { theme } = useTheme(); // Uncomment nếu bạn sử dụng useTheme
  const { error, success } = useCustomAlert();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return false;
    }
    return true;
  }

  const handleChangePassword = async () => {
    if (!validatePassword(newPassword)) {
      setMessage("Mật khẩu phải có ít nhất 8 ký tự");
      setShowMessage(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Xác nhận mật khẩu không khớp");
      setShowMessage(true);
      return;
    }

    try {
      setLoading(true);
      const response = await ChangePassword({ currentPassword, newPassword });
      if (!response.success) {
        error("Lỗi", response.message || "Không thể đổi mật khẩu");
        return;
      }
      success("Thành công", "Đổi mật khẩu thành công!");
      router.back();
    } catch (error) {
      error("Lỗi", "Không thể đổi mật khẩu, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0E0C1F] p-8">
      <View
        className="w-full p-8 rounded-2xl bg-white dark:bg-[#222222]" // Cập nhật nền form
        style={{
          // Giữ hiệu ứng shadow, có thể thay đổi màu shadow nếu cần,
          // nhưng hiện tại để style inline (không hỗ trợ dark:)
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        {/* Cập nhật màu chữ tiêu đề: Đen ở Light Mode, Trắng ở Dark Mode */}
        <Text className="text-black dark:text-white text-3xl font-bold mb-6 text-center">
          Đổi mật khẩu
        </Text>

        <CustomTextInput
          placeholder="Mật khẩu hiện tại"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          iconName="lock"
        />

        <CustomTextInput
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            setShowMessage(false);
          }}
          secureTextEntry
          iconName="key"
        />

        <CustomTextInput
          placeholder="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setShowMessage(false);
          }}
          secureTextEntry
          iconName="key"
        />

        {showMessage && (

          <Text className="text-red-500 text-sm mb-2">*{message}</Text>
        )}

        {/* Nút Xác nhận: Giữ nguyên màu nền xanh lá và chữ trắng */}
        <TouchableOpacity
          className="bg-[#089b0d] rounded-full py-4 items-center mt-6"
          activeOpacity={0.7}
          onPress={() => handleChangePassword()}
          disabled={loading}
        >
          <Text className="text-white font-bold text-lg">{loading ? "Đang xử lý..." : "Xác nhận"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}