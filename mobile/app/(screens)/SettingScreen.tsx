import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import SettingButton from "@/components/button/SettingButton";
import CustomButton from "@/components/custom/CustomButton";
import { useNavigate } from "@/hooks/useNavigate";
import { router } from "expo-router";
import useAuthStore from "@/store/authStore";
import { useCustomAlert } from "@/hooks/useCustomAlert";

export default function SettingScreen() {

  const user = useAuthStore(state => state.user);
  const { navigate } = useNavigate();
  const { error, success, confirm } = useCustomAlert();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateEmail = () => {
    navigate("UpdateEmail");
  };

  const handleEditProfile = () => {
    navigate("EditProfile");
  };

  const handleChangePassword = () => {
    navigate("ChangePassword");
  };

  const handleLinkAccountFacebook = () => {
    console.log("Link account Facebook");
  };

  const handleLinkAccountGoogle = () => {
    console.log("Link account Google");
  };

  const handleLockAccount = () => {
    console.log("Lock account");
    const lock = async () => {
      console.log("lock");
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };

    const cancel = () => {
      console.log("cancel");
      setLoading(false);
    };

    setLoading(true);
    confirm(
      "Xác nhận",
      "Bạn có chắc chắn muốn khóa tài khoản không?",
      lock,
      cancel
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0E0C1F] p-6">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <Icon name="settings-sharp" size={28} color="white" />
        <Text className="text-white text-3xl font-bold ml-2">Cài đặt</Text>
      </View>

      {/* Danh sách cài đặt */}
      <View>
        <SettingButton title="Xác thực email" icon="mail-outline" onPress={handleUpdateEmail} />
        <SettingButton title="Chỉnh sửa hồ sơ" icon="person-circle-outline" onPress={handleEditProfile} />
        <SettingButton title="Đổi mật khẩu" icon="key-outline" onPress={handleChangePassword} />

        {/* Liên kết tài khoản */}
        <SettingButton title="Liên kết tài khoản" icon="link-outline">
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center bg-[#1877F2] py-3 px-4 rounded-2xl mb-3"
            disabled={!!user?.facebookId}
            onPress={() => handleLinkAccountFacebook()}
          >
            <Icon name="logo-facebook" size={20} color="#fff" />
            <Text className="text-white text-base ml-3">{user?.facebookId ? "Đã liên kết với Facebook" : "Liên kết với Facebook"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center bg-white py-3 px-4 rounded-2xl"
            disabled={!!user?.googleId}
            onPress={() => handleLinkAccountGoogle()}
          >
            <Icon name="logo-google" size={20} color="#000" />
            <Text className="text-black text-base ml-3">{user?.googleId ? "Đã liên kết với Google" : "Liên kết với Google"}</Text>
          </TouchableOpacity>
        </SettingButton>

        {/* Khóa tài khoản */}
        <SettingButton title="Khóa tài khoản" icon="lock-closed-outline" color="#ff6666">
          <Text className="text-gray-300 text-sm mb-2">
            Nhập mật khẩu để xác nhận khóa tài khoản:
          </Text>
          <TextInput
            placeholder="Mật khẩu"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="bg-[#1A1833] text-white px-4 py-3 rounded-xl mb-3"
          />
          <TouchableOpacity
            activeOpacity={0.8}
            className="bg-[#ff4d4d] py-3 rounded-xl items-center"
            onPress={() => handleLockAccount()}
          >
            <Text className="text-white font-semibold text-base">Xác nhận khóa</Text>
          </TouchableOpacity>
        </SettingButton>


      </View>

      {/* Nút quay lại */}
      <View className="mt-8">
        <CustomButton title="Quay lại" onPress={() => router.back()} iconName="arrow-back" />
      </View>
    </SafeAreaView >
  );
}

