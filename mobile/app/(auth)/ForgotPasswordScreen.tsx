import React, { useState } from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import CustomTextInput from "@/components/custom/CustomTextInput";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useNavigate } from "@/hooks/useNavigate";
import { SafeAreaView } from "react-native-safe-area-context";
import { SendOtpEmail } from "@/routes/ApiRouter";

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const { error, success } = useCustomAlert();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    return true;
  };

  const handleForgot = async () => {
    if (!email) {
      error("Lỗi", "Vui lòng nhập email của bạn");
      return;
    }

    if (!validateEmail(email)) {
      error("Lỗi", "Email không hợp lệ");
      return;
    }

    try {
      const response = await SendOtpEmail({ email, facebookId: null });
      if (!response.success) {
        error("Lỗi", response.message || "Không thể gửi yêu cầu, vui lòng thử lại.");
        return;
      }

      setLoading(true);
      success("Thành công", "Một mã OTP đã được gửi đến email của bạn!");
      // Chuyển hướng sang màn VerifyEmail để nhập OTP
      navigate("VerifyEmail", {
        email: JSON.stringify(email),
        next: "ResetPassword"
      });
    } catch (err) {
      error("Lỗi", "Không thể gửi yêu cầu, vui lòng thử lại.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 items-center justify-center ${colorScheme === "dark" ? "bg-[#0E0C1F]" : "bg-white"} p-8`}>
      <View
        className="w-full p-8 rounded-2xl"
        style={{
          backgroundColor: colorScheme === "dark" ? "#222222" : "white",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: 10,
          elevation: 10,
        }}
        >
          <Text className={` text-3xl font-bold mb-6 text-center ${colorScheme === "dark" ? "text-white" : "text-[#222222]"}`}>
          Quên mật khẩu
        </Text>
        <Text className={`text-center mb-6 ${colorScheme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          Vui lòng nhập email đã đăng ký để nhận mã OTP đặt lại mật khẩu
        </Text>

        <CustomTextInput
          placeholder="Nhập email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          iconName="mail"
        />

        <View className="rounded-full p-0.5 mb-4 mt-6">
          <TouchableOpacity
            className="bg-[#089b0d] rounded-full py-4 items-center"
            onPress={handleForgot}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text className="text-white font-bold text-lg">
              {loading ? "Đang xử lý..." : "Gửi yêu cầu"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-2">
          <Text className="text-gray-400">Bạn đã nhớ mật khẩu? </Text>
          <TouchableOpacity onPress={() => navigate("Login")} disabled={loading}>
            <Text className="text-[#34D399] font-bold ml-1">
              Đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
