import CustomTextInput from "@/components/custom/CustomTextInput";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useNavigate } from "@/hooks/useNavigate";
import { Login } from "@/routes/ApiRouter";
import useAuthStore from "@/store/authStore";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const { success, error } = useCustomAlert();
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Email không hợp lệ.";
    }
    return null;
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự.";
    }
    return null;
  };

  const validateForm = () => {
    if (!email || !password) {
      return "Vui lòng điền đầy đủ thông tin.";
    }
    const emailError = validateEmail(email);
    if (emailError) {
      return emailError;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      return passwordError;
    }
    return null;
  };

  const handleLogin = async () => {
    const validationMessage = validateForm();
    if (validationMessage) {
      error("Lỗi Đăng Nhập", validationMessage);
      return;
    }
    try {
      const payload = { email, password };
      const response = await Login(payload);
      if (!response.success) {
        error("Lỗi Đăng Nhập", response.message || "Đăng nhập thất bại.");
        return;
      }
      login(response.user, 'local', response.user?.accessToken);
      success("Thành Công", "Đăng nhập thành công!");
      navigate("Main");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Đã xảy ra lỗi trong quá trình đăng nhập.";
      error("Lỗi Đăng Nhập", errorMessage);
    }
  };

  return (
    <SafeAreaView className={`flex-1 items-center justify-center ${colorScheme === "dark" ? "bg-[#0E0C1F]" : "bg-white"}`}>
      <View
        className="w-11/12 p-8 rounded-2xl"
        style={{
          backgroundColor: colorScheme === "dark" ? "#222222" : "white",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <Text className={`text-4xl font-extrabold mb-6 text-center ${colorScheme === "dark" ? "text-white" : "text-[#0E0C1F]"}`}>
          Đăng nhập
        </Text>

        {/* Input cho Email */}
        <View className="mb-4">
          <Text className={`text-gray-300 mb-2 ${colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Email</Text>
          <CustomTextInput
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
            iconName="mail"
            autoCapitalize="none"
          />
        </View>

        {/* Input cho Password */}
        <View className="mb-4">
          <Text className={`text-gray-300 mb-2 ${colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Mật khẩu</Text>
          <CustomTextInput
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            iconName="lock"
            secureTextEntry
          />
        </View>

        {/* Tùy chọn Remember me và Forgot password? */}
        <View className="flex-row items-center justify-center mb-8">
          <TouchableOpacity onPress={() => navigate("ForgotPassword")}>
            <Text className="text-[#34D399] underline">Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>

        {/* Nút Login */}
        <View className="rounded-full p-0.5 mb-6">
          <TouchableOpacity
            className="bg-[#089b0d] rounded-full py-4 items-center"
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-lg">Đăng nhập</Text>
          </TouchableOpacity>
        </View>

        {/* Liên kết Chưa có tài khoản? Đăng ký */}
        <View className="flex-row justify-center">
          <Text className="text-gray-400">Chưa có tài khoản?</Text>
          <TouchableOpacity onPress={() => navigate("SignUp")}>
            <Text className="text-[#34D399] font-bold ml-1">Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
