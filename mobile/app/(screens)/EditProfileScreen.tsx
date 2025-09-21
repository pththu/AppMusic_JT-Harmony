import React, { useState } from 'react';
import { Text, TouchableOpacity, ScrollView, Alert, View } from 'react-native';
import CustomTextInput from '@/components/custom/CustomTextInput';
import GenderSelector from '@/components/GenderSelector';
// import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { router } from 'expo-router';
import DateTimePicker, { DateType } from "react-native-ui-datepicker";

export default function EditProfileScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateEmail = (email: string) => {
    const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(email);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!username.trim()) newErrors.username = 'Username không được để trống';
    if (!email) newErrors.email = 'Email không được để trống';
    else if (!validateEmail(email)) newErrors.email = 'Email không hợp lệ';
    if (dob === undefined) newErrors.dob = 'Ngày sinh không được để trống';
    if (!gender) newErrors.gender = 'Giới tính không được để trống';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSave = () => {
    if (!validate()) return;
    Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật');
    router.back();
  };

  const onChangeDate = (params: { date: DateType }) => {
    if (params?.date) {
      let selectedDate: Date | undefined;
      if (params.date instanceof Date) {
        selectedDate = params.date;
      } else if (typeof params.date === 'string' || typeof params.date === 'number') {
        selectedDate = new Date(params.date);
      } else if (params.date && typeof (params.date as any).toDate === 'function') {
        selectedDate = (params.date as any).toDate();
      }
      setDob(selectedDate);
      setShowDatePicker(false);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-4">
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-3xl font-extrabold mb-6 text-center">
          Personal Information
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
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        iconName="email"
        keyboardType="email-address"
        error={errors.email}
        autoCapitalize="none"
      />

      <CustomTextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        iconName="badge"
      />

      <Text className="text-gray-300 mb-1">Date of Birth</Text>
      <TouchableOpacity
        className="bg-gray-800 rounded-md p-3 mb-4"
        onPress={() => setShowDatePicker(true)}
      >
        <Text className="text-white">
          {dob ? formatDate(dob) : 'Select date'}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          mode="single"
          date={dob || new Date()}
          onChange={onChangeDate}
          maxDate={new Date()}
          classNames={{
            selected: 'bg-green-600 rounded-full',
            selected_label: 'text-white',
            header: 'bg-gray-800 text-white',
            time_selector_label: 'text-white',
            today: 'bg-gray-700 rounded-full',
            today_label: 'text-white',
            days: 'bg-gray-800',
            disabled_label: 'text-gray-500',
            month_selector_label: 'text-white',
            year_selector_label: 'text-white',
            day_label: 'text-white'
          }}
        />
      )}

      <GenderSelector selectedGender={gender} onSelectGender={setGender} />

      <CustomTextInput
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        iconName="description"
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        className="bg-white rounded-full py-4 items-center"
        onPress={onSave}
        activeOpacity={0.7}
      >
        <Text className="text-black font-semibold text-lg">Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
