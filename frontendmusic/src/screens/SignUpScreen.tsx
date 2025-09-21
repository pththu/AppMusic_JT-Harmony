// import React, { useState } from 'react';
// import { Text, TouchableOpacity, ScrollView, Alert, View } from 'react-native';
// import CustomTextInput from '../components/CustomTextInput';
// import GenderSelector from '../components/GenderSelector';
// import DateTimePicker from '@react-native-community/datetimepicker';

// export default function SignUpScreen({ navigation }: { navigation: any }) {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   // const [fullName, setFullName] = useState('');
//   const [dob, setDob] = useState<Date | undefined>(undefined);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [gender, setGender] = useState('');
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});

//   const validate = () => {
//     const newErrors: { [key: string]: string } = {};
//     if (!username) newErrors.username = 'Username is required';
//     if (!email) newErrors.email = 'Email is required';
//     else if (!/\S+@\S+\.\S+/.test(email))
//       newErrors.email = 'Email không hợp lệ';
//     if (!password) newErrors.password = 'Password is required';
//     if (password !== confirmPassword)
//       newErrors.confirmPassword = 'Passwords do not match';
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSignUp = () => {
//     if (!validate()) return;
//     Alert.alert('Success', 'User registered successfully!');
//     navigation.goBack();
//   };

//   const onChangeDate = (event: any, selectedDate?: Date) => {
//     setShowDatePicker(false);
//     if (selectedDate) {
//       setDob(selectedDate);
//     }
//   };

//   const formatDate = (date?: Date) => {
//     if (!date) return 'Select date';
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   return (
//     // Nền xám đen tương tự LoginScreen
//     <ScrollView className="flex-1  bg-[#0E0C1F] p-8">
//       {/* Khung đăng ký với màu nền #222222 và hiệu ứng đổ bóng */}
//       <View
//         className="w-full p-8 rounded-2xl"
//         style={{
//           backgroundColor: '#222222',
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: 10 },
//           shadowOpacity: 0.2,
//           shadowRadius: 10,
//           elevation: 10,
//         }}
//       >
//         <Text className="text-white text-3xl font-bold mb-8 text-center">
//           Sign Up
//         </Text>

//         <CustomTextInput
//           placeholder="Your username"
//           value={username}
//           onChangeText={setUsername}
//           iconName="person"
//           error={errors.username}
//           autoCapitalize="none"
//         />

//         <CustomTextInput
//           placeholder="Your email"
//           value={email}
//           onChangeText={setEmail}
//           iconName="email"
//           keyboardType="email-address"
//           error={errors.email}
//           autoCapitalize="none"
//         />

//         <CustomTextInput
//           placeholder="Your password"
//           value={password}
//           onChangeText={setPassword}
//           iconName="lock"
//           secureTextEntry
//           error={errors.password}
//         />

//         <CustomTextInput
//           placeholder="Confirm password"
//           value={confirmPassword}
//           onChangeText={setConfirmPassword}
//           iconName="lock"
//           secureTextEntry
//           error={errors.confirmPassword}
//         />

//         {/* <CustomTextInput
//           placeholder="Your full name"
//           value={fullName}
//           onChangeText={setFullName}
//           iconName="badge"
//         /> */}

//         {/* Ô nhập liệu cho ngày sinh */}
//         <View className="mb-4">
//           <Text className="text-gray-300 mb-2">Date of Birth</Text>
//           <TouchableOpacity
//             className="flex-row items-center bg-[#1A1A1A] rounded-lg border border-[#3A3A3A] px-4 py-3"
//             onPress={() => setShowDatePicker(true)}
//           >
//             <Text className="text-white flex-1">{formatDate(dob)}</Text>
//             <Text className="text-gray-400">Select date</Text>
//           </TouchableOpacity>
//         </View>

//         {showDatePicker && (
//           <DateTimePicker
//             value={dob || new Date()}
//             mode="date"
//             display="default"
//             onChange={onChangeDate}
//             maximumDate={new Date()}
//           />
//         )}

//         {/* Gender Selector sẽ cần được điều chỉnh nếu bạn muốn nó trông đồng bộ */}
//         <GenderSelector selectedGender={gender} onSelectGender={setGender} />

//         {/* Nút Sign Up với màu nền xanh lá cây đậm */}
//         <View className="rounded-full p-0.5 mb-6">
//           <TouchableOpacity
//             className="bg-[#089b0d] rounded-full py-4 items-center"
//             onPress={handleSignUp}
//             activeOpacity={0.7}
//           >
//             <Text className="text-white font-bold text-lg">Sign Up</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Liên kết Log in với màu chữ phù hợp */}
//         <View className="flex-row justify-center">
//           <Text className="text-gray-400">Already have an account? </Text>
//           <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//             <Text className="text-[#34D399] font-bold ml-1">Log in</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ScrollView>
//   );
// }
import React, { useState } from 'react';
import { Text, TouchableOpacity, ScrollView, Alert, View } from 'react-native';
import CustomTextInput from '../components/CustomTextInput';
import GenderSelector from '../components/GenderSelector';
import DateTimePicker from '@react-native-community/datetimepicker';
import authService from '../services/authService'; // Import authService

export default function SignUpScreen({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!username) newErrors.username = 'Username is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = 'Email không hợp lệ';
    if (!password) newErrors.password = 'Password is required';
    if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    try {
      // Dữ liệu đăng ký
      const userData = {
        username,
        email,
        password,
        // dob: dob ? dob.toISOString() : null,
        // gender: gender || null,
      };

      // Gọi hàm đăng ký từ authService
      await authService.register(userData);

      // Đăng ký thành công
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công!');
      navigation.goBack(); // Quay lại màn hình đăng nhập
    } catch (error) {
      // Kiểm tra xem lỗi có phải từ phản hồi của server không
      if (error.response) {
        // Lỗi từ server (ví dụ: 401, 404)
        console.error('Lỗi đăng kí:', error.response.data.message);
        Alert.alert('Lỗi', error.response.data.message);
      } else if (error.request) {
        // Lỗi không nhận được phản hồi từ server
        console.error('Lỗi đăng kí: Không nhận được phản hồi từ server');
        Alert.alert('Lỗi', 'Không kết nối được đến server. Vui lòng thử lại.');
      } else {
        // Lỗi khác
        console.error('Lỗi đăng kí:', error.message);
        Alert.alert('Lỗi', 'Đã xảy ra lỗi không mong muốn.');
      }
    }
  };
  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Select date';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    // Nền xám đen tương tự LoginScreen
    <ScrollView className="flex-1 bg-[#0E0C1F] p-8">
      {/* Khung đăng ký với màu nền #222222 và hiệu ứng đổ bóng */}
      <View
        className="w-full p-8 rounded-2xl"
        style={{
          backgroundColor: '#222222',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <Text className="text-white text-3xl font-bold mb-8 text-center">
          Sign Up
        </Text>

        <CustomTextInput
          placeholder="Your username"
          value={username}
          onChangeText={setUsername}
          iconName="person"
          error={errors.username}
          autoCapitalize="none"
        />

        <CustomTextInput
          placeholder="Your email"
          value={email}
          onChangeText={setEmail}
          iconName="email"
          keyboardType="email-address"
          error={errors.email}
          autoCapitalize="none"
        />

        <CustomTextInput
          placeholder="Your password"
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

        {/* Ô nhập liệu cho ngày sinh */}
        <View className="mb-4">
          <Text className="text-gray-300 mb-2">Date of Birth</Text>
          <TouchableOpacity
            className="flex-row items-center bg-[#1A1A1A] rounded-lg border border-[#3A3A3A] px-4 py-3"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-white flex-1">{formatDate(dob)}</Text>
            <Text className="text-gray-400">Select date</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dob || new Date()}
            mode="date"
            display="default"
            onChange={onChangeDate}
            maximumDate={new Date()}
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
            <Text className="text-white font-bold text-lg">Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Liên kết Log in */}
        <View className="flex-row justify-center">
          <Text className="text-gray-400">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-[#34D399] font-bold ml-1">Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
