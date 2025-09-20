import React, { useState } from 'react';
import { Text, TouchableOpacity, ScrollView, Alert, View } from 'react-native';
import CustomTextInput from '../components/CustomTextInput';
import GenderSelector from '../components/GenderSelector';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';

export default function EditProfileScreen({ navigation }: { navigation: any }) {
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
    navigation.goBack();
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDob(selectedDate);
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
    <ScrollView className="flex-1  bg-[#0E0C1F] px-4 pt-4">
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
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
          value={dob || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()}
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
        className="bg-[#089b0d] rounded-full py-4 items-center"
        onPress={onSave}
        activeOpacity={0.7}
      >
        <Text className="text-white font-bold text-lg">Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
