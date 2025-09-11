import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  View,
} from 'react-native';
import CustomTextInput from '../components/CustomTextInput';
import GenderSelector from '../components/GenderSelector';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SignUpScreen({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!username) newErrors.username = 'Username is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email không hợp lệ';
    if (!password) newErrors.password = 'Password is required';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = () => {
    if (!validate()) return;
    Alert.alert('Success', 'User registered successfully!');
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
    <ScrollView className="flex-1 bg-black px-8 py-20">
      <Text className="text-white text-3xl font-extrabold mb-6 text-center">
        Sign Up
      </Text>

      <CustomTextInput
        placeholder="Enter username"
        value={username}
        onChangeText={setUsername}
        iconName="person"
        error={errors.username}
        autoCapitalize="none"
      />

      <CustomTextInput
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
        iconName="email"
        keyboardType="email-address"
        error={errors.email}
        autoCapitalize="none"
      />

      <CustomTextInput
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        iconName="lock"
        secureTextEntry
        error={errors.password}
      />

      <CustomTextInput
        placeholder="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        iconName="lock"
        secureTextEntry
        error={errors.confirmPassword}
      />

      <CustomTextInput
        placeholder="Enter full name"
        value={fullName}
        onChangeText={setFullName}
        iconName="badge"
      />

      <Text className="text-gray-300 mb-1">Date of Birth</Text>
      <TouchableOpacity
        className="bg-gray-800 rounded-md p-3 mb-4"
        onPress={() => setShowDatePicker(true)}
      >
        <Text className="text-white">{dob ? formatDate(dob) : 'Select date'}</Text>
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

      <TouchableOpacity
        className="bg-white rounded-full py-4 items-center"
        onPress={handleSignUp}
        activeOpacity={0.7}
      >
        <Text className="text-black font-semibold text-lg">Sign Up</Text>
      </TouchableOpacity>

      <View className="items-center mt-4">
        <Text className="text-gray-300">Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text className="text-white underline">Log in</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
