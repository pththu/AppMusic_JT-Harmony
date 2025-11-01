import React, { useState } from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomTextInput from "@/components/custom/CustomTextInput";
import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
import useAuthStore from "@/store/authStore";
import { isEmailExist, SendOtpEmail, VerifyEmail } from "@/routes/ApiRouter";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useNavigate } from "@/hooks/useNavigate";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";

export default function UpdateEmailScreen() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { error, success } = useCustomAlert();
  const { navigate } = useNavigate();
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const checkEmailExist = async (email) => {
    try {
      const response = await isEmailExist({ email });
      if (response.success) {
        setShowMessage(true);
        setMessage(response.message || "Email đã được sử dụng");
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const handleSendOtp = async () => {
    if (user?.facebookId && !user?.email) {
      const emailExists = await checkEmailExist(email);
      if (!emailExists) {
        return;
      }
    }
    try {
      setLoading(true);
      const response = await SendOtpEmail({ email, facebookId: user?.facebookId }); // API gửi lại OTP
      if (!response.success) {
        error("Lỗi", response.message || "Không thể gửi mã OTP");
        return;
      }
      success("Thành công", "OTP đã được gửi đến email của bạn!");
      setShowOtpInput(true); // hiển thị giao diện nhập OTP
    } catch (error) {
      error("Lỗi", "Không thể gửi mã OTP, vui lòng thử sau.");
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      const response = await SendOtpEmail({ email }); // API gửi lại OTP
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

  const handleVerify = async () => {
    if (otp.length !== 6) {
      error("Lỗi xác thực", "Vui lòng nhập đủ 6 số OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await VerifyEmail({ email, otp, facebookId: user?.facebookId }); // gọi API verify
      if (!response.success) {
        error("Lỗi", response.message || "Mã OTP không hợp lệ");
        return;
      }
      success("Thành công", "Xác thực email thành công! Mật khẩu khởi tạo là: 12345678");
      updateUser(response.user);
      router.back();
    } catch (err) {
      error("Lỗi", "Không thể xác thực, vui lòng thử lại.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${colorScheme === "dark" ? "bg-[#0E0C1F]" : "bg-white"} px-6`}>
      {/* Back Button */}
      <View className="flex-row mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Icon name="arrow-back" size={24} color={`${colorScheme === "dark" ? "white" : "#0E0C1F"}`} />
        </TouchableOpacity>
        <Text className={`text-2xl font-bold ${colorScheme === "dark" ? "text-white" : "text-[#0E0C1F]"}`}>
          {showOtpInput ? "Nhập mã xác thực" : "Đã xác thực email"}
        </Text>
      </View>

      <View
        className="w-full p-8 rounded-2xl"
        style={{
          backgroundColor: colorScheme === "dark" ? "#0E0C1F" : "white",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 10,
        }}
      >

        {!showOtpInput ? (
          <>
            <CustomTextInput
              placeholder="Nhập email"
              value={email}
              onChangeText={(text) => { setEmail(text); setShowMessage(false); }}
              iconName="mail"
              editable={!user?.email}
            />

            <TouchableOpacity
              className="rounded-full mt-2"
              activeOpacity={0.7}
              onPress={() => handleSendOtp()}
              disabled={user?.emailVerified}
            >
              {showMessage && (
                <Text className="text-red-500 mb-2 text-sm">*{message}</Text>
              )}
              <Text
                className={`${user?.emailVerified ? "text-gray-500" : "text-[#089b0d]"} font-bold text-xl`}
              >
                {user?.emailVerified
                  ? "Email đã được xác thực"
                  : "Gửi mã xác thực"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <CustomTextInput
              placeholder="Nhập mã OTP"
              value={otp}
              onChangeText={setOtp}
              iconName="key"
              keyboardType="numeric"
            />

            <TouchableOpacity
              className="border border-[#089b0d] items-center rounded-full my-4"
              activeOpacity={0.7}
              onPress={() => handleVerify()}
            >
              <Text className="text-[#089b0d] font-bold text-lg py-4">
                Xác nhận mã
              </Text>
            </TouchableOpacity>
            <Text className="text-gray-400">Không nhận được mã? </Text>
            <View className="flex-row justify-between mt-2">
              <TouchableOpacity onPress={handleResend} disabled={loading}>
                <Text className="text-[#34D399] font-bold ml-1">
                  Gửi lại OTP
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
