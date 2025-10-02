import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import CustomTextInput from "@/components/custom/CustomTextInput";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useNavigate } from "@/hooks/useNavigate";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { VerifyEmail, ResendOtp } from "@/routes/ApiRouter";

export default function VerifyEmailScreen() {
  const { navigate } = useNavigate();
  const { error, success } = useCustomAlert();
  const params = useLocalSearchParams();
  const email = params.email ? JSON.parse(params.email as string) : "";
  console.log("email verify", email);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    console.log(otp)
    if (otp.length !== 6) {
      error("Lỗi xác thực", "Vui lòng nhập đủ 6 số OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await VerifyEmail({ email, otp }); // gọi API verify
      if (!response.success) {
        error("Lỗi", response.message || "Mã OTP không hợp lệ");
        return;
      }
      success("Thành công", "Xác thực email thành công!");
      navigate("Login"); // Sau khi xác thực thì điều hướng về Login
    } catch (err) {
      error("Lỗi", "Không thể xác thực, vui lòng thử lại.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      const response = await ResendOtp({ email }); // API gửi lại OTP
      if (!response.success) {
        error("Lỗi", response.message || "Không thể gửi lại mã OTP");
        return;
      }
      success("Thành công", "OTP mới đã được gửi đến email của bạn!");
    } catch (err) {
      error("Lỗi", "Không thể gửi lại OTP, vui lòng thử sau.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0E0C1F] p-8">
      <View
        className="w-full p-8 rounded-2xl"
        style={{
          backgroundColor: "#222222",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <Text className="text-white text-3xl font-bold mb-6 text-center">
          Xác thực Email
        </Text>
        <Text className="text-gray-300 mb-6 text-center">
          Vui lòng nhập mã OTP 6 số đã được gửi đến:{"\n"}
          <Text className="text-[#34D399] font-semibold">{email}</Text>
        </Text>

        <CustomTextInput
          placeholder="Nhập OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          iconName="lock"
        />

        <View className="rounded-full p-0.5 mb-4 mt-6">
          <TouchableOpacity
            className="bg-[#089b0d] rounded-full py-4 items-center"
            onPress={handleVerify}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text className="text-white font-bold text-lg">
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-2">
          <Text className="text-gray-400">Không nhận được mã? </Text>
          <TouchableOpacity onPress={handleResend} disabled={loading}>
            <Text className="text-[#34D399] font-bold ml-1">
              Gửi lại OTP
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
