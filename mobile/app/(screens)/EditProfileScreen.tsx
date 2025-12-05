import CustomTextInput from "@/components/custom/CustomTextInput";
import { useTheme } from "@/components/ThemeContext"; // Import useTheme
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { UpdateProfile } from "@/routes/ApiRouter";
import useAuthStore from "@/store/authStore";
import dayjs from "dayjs";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import DateTimePicker, { DateType } from "react-native-ui-datepicker";
import Icon from "react-native-vector-icons/Ionicons";

export default function EditProfileScreen() {
  const { theme } = useTheme(); // Lấy theme hiện tại
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { error, success } = useCustomAlert();
  const [username, setUsername] = useState(user?.username || "");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [dob, setDob] = useState<Date | undefined>(user?.dob ? dayjs(user.dob).toDate() : undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState(user?.gender === true ? "Male" : "Female");
  const [bio, setBio] = useState(user?.bio || "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isChange, setIsChange] = useState(false);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();


  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (dob === undefined) newErrors.dob = "Ngày sinh không được để trống";
    if (!gender) newErrors.gender = "Giới tính không được để trống";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const payload = {
        username: username || null,
        bio: bio || null,
        fullName: fullName || null,
        dob: dob || null,
        gender: gender === 'Male' ? true : false,
      }
      const response = await UpdateProfile(payload);
      if (!response.success) {
        error("Cập nhật thất bại", response.message || "Đã có lỗi xảy ra, vui lòng thử lại");
        return;
      }
      success("Cập nhật thành công", "Thông tin cá nhân đã được cập nhật");
      updateUser(response.user);
      router.back();
    } catch (error) {
      error("Cập nhật thất bại", "Đã có lỗi xảy ra, vui lòng thử lại");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (params: { date: DateType }) => {
    if (params && params.date) {
      const selectedDate = dayjs(params.date).toDate();
      setDob(selectedDate);
      setShowDatePicker(false);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (user) {
      const hasChanged =
        username !== user.username ||
        fullName !== user.fullName ||
        (dob ? dayjs(dob).startOf('day').toISOString() : "") !== (user.dob ? dayjs(user.dob).startOf('day').toISOString() : "") || // So sánh ngày chính xác hơn
        gender !== (user.gender === true ? "Male" : "Female") ||
        bio !== user.bio
      setIsChange(hasChanged);
    }
  }, [username, fullName, dob, gender, bio, user]);

  // Màu Icon mũi tên dựa trên theme
  const backIconColor = theme === 'dark' ? 'white' : 'black';
  // Màu nền cho DatePicker container
  const datePickerContainerBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200';
  // Màu chữ cho label ngày sinh
  const labelColor = 'text-gray-600 dark:text-gray-300';
  // Màu nền cho input ngày sinh
  const dateInputBg = 'bg-gray-200 dark:bg-gray-800';
  // Màu chữ cho input ngày sinh
  const dateInputText = 'text-black dark:text-white';


  return (
    <ScrollView className="flex-1 bg-white dark:bg-[#0E0C1F] px-4 pt-4">
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          {/* Cập nhật màu icon */}
          <Icon name="arrow-back" size={24} color={backIconColor} />
        </TouchableOpacity>
        {/* Cập nhật màu chữ tiêu đề */}
        <Text className="text-black dark:text-white text-2xl font-extrabold text-center">
          Thông tin người dùng
        </Text>
      </View>

      <CustomTextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        iconName="person"
        error={errors.username}
        autoCapitalize="none"
      />

      <CustomTextInput
        placeholder="Tên hiển thị"
        value={fullName}
        onChangeText={setFullName}
        iconName="badge"
      />

      {/* Ngày sinh Input */}
      <Text className={labelColor}>Ngày sinh</Text>
      <TouchableOpacity
        className={`${dateInputBg} rounded-md p-3 mb-4 mt-3`} // Cập nhật màu nền
        onPress={() => setShowDatePicker(true)}
      >
        <Text className={dateInputText}> {/* Cập nhật màu chữ */}
          {dob ? formatDate(dob) : "Chọn ngày"}
        </Text>
      </TouchableOpacity>
      {!!errors.dob && <Text className="text-red-500 mb-2">{errors.dob}</Text>}

      {/* DatePicker */}
      {
        showDatePicker && (
          <View className={`${datePickerContainerBg} rounded-lg p-2 mb-4`}>
            <DateTimePicker
              mode="single"
              date={dob ? dayjs(dob) : dayjs()}
              onChange={onChangeDate}
              maxDate={new Date()}
              // Cập nhật style và styles để tương thích với Light/Dark Mode
              style={{
                backgroundColor: theme === 'dark' ? "#3A3A3A" : "#FFFFFF", // Màu nền DatePicker
                borderRadius: 10,
                padding: 10,
                marginTop: 10,
              }}
              styles={{
                day_label: { color: theme === 'dark' ? "white" : "black" },
                day: { color: theme === 'dark' ? "white" : "black" },
                disabled_label: { color: "gray" },
                selected_label: {
                  color: "white",
                  fontWeight: "bold",
                  backgroundColor: "#089b0d", // Màu xanh lá cố định
                  padding: 10,
                  borderRadius: 50,
                },
                today_label: {
                  color: "#dff519", // Màu vàng neon cố định
                  fontWeight: "bold"
                },
                month_selector_label: { color: theme === 'dark' ? "white" : "black" },
                year_selector_label: { color: theme === 'dark' ? "white" : "black" },
                weekday_label: { color: theme === 'dark' ? "white" : "black" }
              }}
            />
          </View>
        )
      }

      <CustomTextInput
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        iconName="description"
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        // className="bg-[#089b0d] rounded-full py-4 items-center"
        className={`rounded-full py-4 items-center ${isChange ? 'bg-[#089b0d]' : 'border border-gray-200'}`}
        onPress={() => handleSave()}
        activeOpacity={0.7}
        disabled={!isChange}
      >
        {/* <Text className="text-white font-bold text-lg">Lưu</Text> */}
        <Text className={`font-bold text-lg ${isChange ? 'text-white' : 'text-gray-300'}`}>
          {loading ? 'Đang lưu...' : 'Lưu'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}