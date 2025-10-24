import CustomTextInput from "@/components/custom/CustomTextInput";
import GenderSelector from "@/components/GenderSelector";
import { useNavigate } from "@/hooks/useNavigate";
import React, { useState } from "react";
import { useColorScheme, ScrollView, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "react-native-ui-datepicker";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { Register } from "@/routes/ApiRouter";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const { error, success } = useCustomAlert();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!username) newErrors.username = "Username là bắt buộc";
    if (!email) newErrors.email = "Email là bắt buộc";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Email không hợp lệ";
    if (!password) newErrors.password = "Mật khẩu là bắt buộc";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Mật khẩu không khớp";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    try {
      const userData = {
        username,
        email,
        password,
        dob: dob ? dob.toISOString() : null,
        gender: gender === "Male" ? true : false,
      };

      const response = await Register(userData);
      if (!response.success) {
        error("Lỗi đăng kí", response.message);
        return;
      }

      success("Thành công", "Đăng ký tài khoản thành công! Chúng tôi đã gửi một email xác nhận đến bạn, vui lòng kiểm tra hộp thư.");
      navigate("VerifyEmail", { email: JSON.stringify(email), next: "Login" });
    } catch (error) {
      if (error.response) {
        error("Lỗi đăng kí", error.response.data.message);
      } else if (error.request) {
        error("Lỗi đăng kí", "Không kết nối được đến server. Vui lòng thử lại.");
      } else {
        error("Lỗi đăng kí", "Đã xảy ra lỗi không mong muốn.");
      }
    }
  };

  // Hàm xử lý ngày tháng đã được cập nhật
  const onChangeDate = (params: { date: Date }) => {
    setShowDatePicker(false);
    if (params?.date) {
      let selectedDate = new Date(params.date.toString());
      setDob(selectedDate);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return "Chọn ngày";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
        <Text className={`text-4xl font-extrabold mb-6 text-center ${colorScheme === "dark" ? "text-white" : "text-[#0E0C1F]"}`}>
          Đăng ký
        </Text>

        <CustomTextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          iconName="person"
          error={errors.username}
          autoCapitalize="none"
        />

        <CustomTextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          iconName="email"
          keyboardType="email-address"
          error={errors.email}
          autoCapitalize="none"
        />

        <CustomTextInput
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          iconName="lock"
          secureTextEntry
          error={errors.password}
        />

        <CustomTextInput
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          iconName="lock"
          secureTextEntry
          error={errors.confirmPassword}
        />

        {/* Ô nhập liệu cho ngày sinh */}
        <View className="mb-4">
          <Text className={`mb-2 ${colorScheme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Ngày sinh</Text>
          <TouchableOpacity
            className={`flex-row items-center border ${colorScheme === "dark" ? "border-gray-600" : "border-gray-300"} rounded-lg px-4 py-3`}
            onPress={() => setShowDatePicker(true)}
          >
            <Text className={`flex-1 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>{formatDate(dob)}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            date={dob}
            mode="single"
            onChange={onChangeDate}
            maxDate={new Date()}
            style={{
              backgroundColor: colorScheme === "dark" ? "#222222" : "#e5e7eb",
              borderRadius: 10,
              padding: 10,
              marginTop: 10,
            }}
            styles={{
              day_label: { color: colorScheme === "dark" ? "white" : "#0E0C1F" },
              day: { color: colorScheme === "dark" ? "white" : "#0E0C1F" },
              disabled_label: { color: "gray" },
              selected_label: {
                color: colorScheme === "dark" ? "white" : "#0E0C1F",
                fontWeight: "bold",
                backgroundColor: "#089b0d",
                padding: 10,
                borderRadius: 50,
              },
              today_label: {
                color: "#089b0d",
                fontWeight: "bold"
              },
              month_selector_label: { color: colorScheme === "dark" ? "white" : "#0E0C1F" },
              year_selector_label: { color: colorScheme === "dark" ? "white" : "#0E0C1F" },
              weekday_label: { color: colorScheme === "dark" ? "white" : "#0E0C1F" }
            }}
          />
        )}

        {/* Gender Selector */}
        <GenderSelector selectedGender={gender} onSelectGender={setGender} />

        {/* Nút Sign Up */}
        <View className="rounded-full p-0.5 mb-6">
          <TouchableOpacity
            className="bg-[#089b0d] rounded-full py-4 items-center"
            onPress={handleSignUp}
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-lg">Đăng ký</Text>
          </TouchableOpacity>
        </View>

        {/* Liên kết Log in */}
        <View className="flex-row justify-center">
          <Text className="text-gray-400">Bạn đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigate("Login")}>
            <Text className="text-[#34D399] font-bold ml-1">Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
