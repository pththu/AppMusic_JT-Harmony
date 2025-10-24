import React, { useState } from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import CustomTextInput from "@/components/custom/CustomTextInput";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useNavigate } from "@/hooks/useNavigate";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SendOtpEmail, VerifyEmail } from "@/routes/ApiRouter";

export default function VerifyEmailScreen() {
  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const { error, success } = useCustomAlert();
  const params = useLocalSearchParams();
  const email = params.email ? JSON.parse(params.email as string) : "";
  const next = params.next ? params.next as string : "Auth";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      error("Lỗi xác thực", "Vui lòng nhập đủ 6 số OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await VerifyEmail({ email, otp, facebookId: null }); // gọi API verify
      if (!response.success) {
        error("Lỗi", response.message || "Mã OTP không hợp lệ");
        return;
      }
      success("Thành công", "Xác thực email thành công!");
      navigate(next, {
        email: JSON.stringify(email)
      }); // Sau khi xác thực thì điều hướng đến trang tiếp theo
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
      const response = await SendOtpEmail({ email, facebookId: null }); // API gửi lại OTP
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
    <SafeAreaView className={`flex-1 items-center justify-center p-8 ${colorScheme === "dark" ? "bg-[#0E0C1F]" : "bg-white"}`}>
      <View
        className="w-full p-8 rounded-2xl"
        style={{
          backgroundColor: colorScheme === "dark" ? "#222222" : "white",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <Text className={` text-3xl font-bold mb-6 text-center ${colorScheme === "dark" ? "text-white" : "text-[#0E0C1F]"}`}>
          Xác thực OTP
        </Text>
        <Text className={`text-center mb-6 ${colorScheme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
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

        <Text className="text-gray-400">Không nhận được mã? </Text>
        <View className="flex-row justify-between mt-2">
          <TouchableOpacity onPress={handleResend} disabled={loading}>
            <Text className="text-[#34D399] font-bold ml-1">
              Gửi lại OTP
            </Text>
          </TouchableOpacity>
          {next !== 'ResetPassword' && (
            <TouchableOpacity onPress={() => navigate('ResetPassword')} disabled={loading}>
              <Text className="text-[#34D399] font-bold ml-1">
                Xác thực sau
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
