import CustomTextInput from "@/components/custom/CustomTextInput";
import GenderSelector from "@/components/GenderSelector";
import dayjs from "dayjs"; // Import dayjs
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import DateTimePicker, { DateType } from "react-native-ui-datepicker";
import Icon from "react-native-vector-icons/Ionicons";
import useAuthStore from "@/store/authStore";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { UpdateProfile } from "@/routes/ApiRouter";

export default function EditProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const colorScheme = useColorScheme();
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
    success("Cập nhật thành công", "Thông tin cá nhân đã được cập nhật");
  };

  // Cập nhật hàm xử lý onChangeDate
  const onChangeDate = (params: { date: DateType }) => {
    // Thư viện mới trả về ngày dưới dạng { date: DateType }
    // Chúng ta chuyển nó về đối tượng Date để lưu vào state.
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
        (dob ? dayjs(dob).toDate().toString() : "") !== (user.dob ? dayjs(user.dob).toDate().toString() : "") ||
        gender !== (user.gender === true ? "Male" : "Female") ||
        bio !== user.bio
      setIsChange(hasChanged);
    }
  }, [username, fullName, dob, gender, bio]);

  return (
    <ScrollView className={`flex-1 p-4 ${colorScheme === "dark" ? "bg-[#0E0C1F]" : "bg-white"}`}>
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Icon name="arrow-back" size={24} color={`${colorScheme === "dark" ? "white" : "#0E0C1F"}`} />
        </TouchableOpacity>
        <Text className={`text-2xl font-bold ${colorScheme === "dark" ? "text-white" : "text-[#0E0C1F]"}`}>
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

      <Text className={`mb-1 ${colorScheme === "dark" ? "text-gray-400" : "text-gray-900"}`}>Ngày sinh</Text>
      <TouchableOpacity
        className={`rounded-md p-3 mb-4 ${colorScheme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}
        onPress={() => setShowDatePicker(true)}
      >
        <Text className={`${colorScheme === "dark" ? "text-white" : "text-gray-900"}`}>
          {dob ? formatDate(dob) : "Chọn ngày"}
        </Text>
      </TouchableOpacity>
      {!!errors.dob && <Text className="text-red-500 mb-2">{errors.dob}</Text>}
      {showDatePicker && (
        <View className={`rounded-lg p-2 ${colorScheme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
          <DateTimePicker
            mode="single"
            date={dob ? dayjs(dob) : dayjs()}
            onChange={onChangeDate}
            maxDate={new Date()}
            style={{
              backgroundColor: `${colorScheme === "dark" ? "#3A3A3A" : "#e5e7eb"}`,
              borderRadius: 10,
              padding: 10,
              marginTop: 10,
            }}
            styles={{
              day_label: { color: `${colorScheme === "dark" ? "white" : "#0E0C1F"}` },
              day: { color: `${colorScheme === "dark" ? "white" : "#0E0C1F"}` },
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
              month_selector_label: { color: `${colorScheme === "dark" ? "white" : "#0E0C1F"}` },
              year_selector_label: { color: `${colorScheme === "dark" ? "white" : "#0E0C1F"}` },
              weekday_label: { color: `${colorScheme === "dark" ? "white" : "#0E0C1F"}` }
            }}
          />
        </View>
      )}

      <GenderSelector selectedGender={gender} onSelectGender={setGender} />
      {errors.gender && (
        <Text className="text-red-500 mb-2">{errors.gender}</Text>
      )}

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