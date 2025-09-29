import CustomTextInput from "@/components/custom/CustomTextInput";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useNavigate } from "@/hooks/useNavigate";
import { Login } from "@/routes/ApiRouter";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const { navigate } = useNavigate();
  const { success, error } = useCustomAlert();

  const [email, setEmail] = useState("tuan@gmail.com");
  const [password, setPassword] = useState("123456");

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
    if (email === "tuan@gmail.com" && password === "123456") {
      console.log("Đăng nhập thành công (tạm thời)!");
      Alert.alert("Thành công", "Đăng nhập thành công (tạm thời)!");
      navigate("Main"); // Điều hướng đến màn hình chính
      return; // Dừng hàm tại đây, không gọi API
    }
    const validationMessage = validateForm();
    if (validationMessage) {
      error("Lỗi Đăng Nhập", validationMessage);
      return;
    }
    try {
      const payload = { email, password };
      const response = await Login(payload);
      console.log(response);
      if (response.statusCode === 200) {
        success("Thành Công", "Đăng nhập thành công!", () => navigate("Main"));
      }
    } catch (err) {
      console.error("Login error:", err);
      // Giả sử lỗi từ server có cấu trúc { message: "..." }
      const errorMessage =
        err.response?.data?.message ||
        "Đã xảy ra lỗi trong quá trình đăng nhập.";
      error("Lỗi Đăng Nhập", errorMessage);
    }
  };

  return (
    <View className="flex-1 bg-[#0E0C1F] items-center justify-center">
      <View
        className="w-11/12 p-8 rounded-2xl"
        style={{
          backgroundColor: "#222222",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <Text className="text-white text-3xl font-bold mb-8 text-center">
          Login
        </Text>

        {/* Input cho Email */}
        <View className="mb-4">
          <Text className="text-gray-300 mb-2">Email</Text>
          <CustomTextInput
            placeholder="Your Email"
            value={email}
            onChangeText={setEmail}
            iconName="mail"
            autoCapitalize="none"
          />
        </View>

        {/* Input cho Password */}
        <View className="mb-4">
          <Text className="text-gray-300 mb-2">Password</Text>
          <CustomTextInput
            placeholder="Your Password"
            value={password}
            onChangeText={setPassword}
            iconName="lock"
            secureTextEntry
          />
        </View>

        {/* Tùy chọn Remember me và Forgot password? */}
        <View className="flex-row items-center justify-between mb-8">
          <View className="flex-row items-center">
            <TouchableOpacity className="w-5 h-5 border border-gray-400 rounded mr-2"></TouchableOpacity>
            <Text className="text-[#34D399]">Remember me</Text>
          </View>
          <TouchableOpacity>
            <Text className="text-[#34D399]">Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Nút Login */}
        <View className="rounded-full p-0.5 mb-6">
          <TouchableOpacity
            className="bg-[#089b0d] rounded-full py-4 items-center"
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-lg">Login</Text>
          </TouchableOpacity>
        </View>

        {/* Liên kết Don't have an account? Register */}
        <View className="flex-row justify-center">
          <Text className="text-gray-400">Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigate("SignUp")}>
            <Text className="text-[#34D399] font-bold ml-1">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
