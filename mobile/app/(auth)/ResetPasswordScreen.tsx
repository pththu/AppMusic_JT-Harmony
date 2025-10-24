import React, { useState } from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import CustomTextInput from "@/components/custom/CustomTextInput";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useNavigate } from "@/hooks/useNavigate";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ResetPassword } from "@/routes/ApiRouter";

export default function ResetPasswordScreen() {
  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const { error, success } = useCustomAlert();
  const params = useLocalSearchParams();
  const email = params.email ? JSON.parse(params.email as string) : "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password || !confirm) {
      error("Lỗi", "Vui lòng nhập đầy đủ mật khẩu");
      return;
    }
    if (password !== confirm) {
      error("Lỗi", "Mật khẩu nhập lại không khớp");
      return;
    }

    try {
      setLoading(true);
      const response = await ResetPassword({ email, newPassword: password });
      if (!response.success) {
        error("Lỗi", response.message || "Không thể đặt lại mật khẩu");
        return;
      }
      success("Thành công", "Đặt lại mật khẩu thành công!");
      navigate("Login");
    } catch (err) {
      error("Lỗi", "Không thể đặt lại mật khẩu, vui lòng thử lại.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 p-8 ${colorScheme === "dark" ? "bg-[#0E0C1F]" : "bg-white"}`}>
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
        <Text className={`text-3xl font-bold mb-6 text-center ${colorScheme === "dark" ? "text-white" : "text-[#222222]"}`}>
          Đặt lại mật khẩu
        </Text>

        <CustomTextInput
          placeholder="Mật khẩu mới"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          iconName="key"
        />

        <CustomTextInput
          placeholder="Xác nhận mật khẩu"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          iconName="key"
        />

        <View className="rounded-full p-0.5 mb-4 mt-6">
          <TouchableOpacity
            className="bg-[#089b0d] rounded-full py-4 items-center"
            onPress={handleReset}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text className="text-white font-bold text-lg">
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-2">
          <Text className="text-gray-400">Quay lại </Text>
          <TouchableOpacity onPress={() => navigate("Login")} disabled={loading}>
            <Text className="text-[#34D399] font-bold ml-1">Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
