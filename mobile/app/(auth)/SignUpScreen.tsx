import CustomTextInput from "@/components/custom/CustomTextInput";
import GenderSelector from "@/components/GenderSelector";
import { useNavigate } from "@/hooks/useNavigate";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "react-native-ui-datepicker";
import authService from "../../services/authService";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { Register } from "@/routes/ApiRouter";

export default function SignUpScreen() {
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

      console.log('userData', userData);
      const response = await Register(userData);
      if (!response.success) {
        console.error("Lỗi đăng kí 4:", response.message);
        return;
      }

      success("Thành công", "Đăng ký tài khoản thành công! Chúng tôi đã gửi một email xác nhận đến bạn, vui lòng kiểm tra hộp thư.");
      navigate("VerifyEmail", { email: JSON.stringify(email) });
    } catch (error) {
      if (error.response) {
        error("Lỗi đăng kí", error.response.data.message);
      } else if (error.request) {
        console.error("Lỗi đăng kí: Không nhận được phản hồi từ server");
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
    <ScrollView className="flex-1 bg-[#0E0C1F] p-8">
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
        <Text className="text-white text-3xl font-bold mb-8 text-center">
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
          <Text className="text-gray-300 mb-2">Ngày sinh</Text>
          <TouchableOpacity
            className="flex-row items-center bg-[#1a1a1a] rounded-lg border border-[#3A3A3A] px-4 py-3"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-white flex-1">{formatDate(dob)}</Text>
            <Text className="text-gray-400">Select date</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            date={dob}
            mode="single"
            onChange={onChangeDate}
            maxDate={new Date()}
            style={{
              backgroundColor: "#3A3A3A",
              borderRadius: 10,
              padding: 10,
              marginTop: 10,
            }}
            styles={{
              day_label: { color: "white" },
              day: { color: "white" },
              disabled_label: { color: "gray" },
              selected_label: {
                color: "white",
                fontWeight: "bold",
                backgroundColor: "#089b0d",
                padding: 10,
                borderRadius: 50,
              },
              today_label: {
                color: "#dff519",
                fontWeight: "bold"
              },
              month_selector_label: { color: "white" },
              year_selector_label: { color: "white" },
              weekday_label: { color: "white" }
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
    </ScrollView>
  );
}
