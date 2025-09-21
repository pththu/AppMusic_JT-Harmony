// import React, { useState } from 'react';
// import { Text, TouchableOpacity, Alert, View } from 'react-native';
// import CustomTextInput from '../components/CustomTextInput';
// import authService from '../services/authService';

// export default function LoginScreen({ navigation }: { navigation: any }) {
//   const [username, setUsername] = useState('user');
//   const [password, setPassword] = useState('123456');

//   // const handleLogin = () => {
//   //   if (username !== 'user' || password !== '123456') {
//   //     Alert.alert('Error', 'Invalid username or password.');
//   //     return;
//   //   }
//   //   // Successful login, navigate to Main screen
//   //   navigation.navigate('Main');
//   // };
//   const handleLogin = async () => {
//     try {
//       // Gọi API đăng nhập từ authService
//       const userData = await authService.login(username, password);

//       // Nếu API trả về thành công, xử lý dữ liệu và chuyển hướng
//       console.log('Đăng nhập thành công!', userData);
//       Alert.alert('Thành công', 'Đăng nhập thành công!');
//       navigation.navigate('Main'); // Điều hướng đến màn hình chính
//     } catch (error) {
//       // Xử lý lỗi từ API, ví dụ: tên đăng nhập hoặc mật khẩu không hợp lệ
//       console.error(
//         'Lỗi đăng nhập:',
//         error.response?.data?.message || 'Lỗi không xác định',
//       );
//       Alert.alert(
//         'Lỗi',
//         error.response?.data?.message || 'Đăng nhập thất bại.',
//       );
//     }
//   };

//   return (
//     // Nền xám đen
//     <View className="flex-1  bg-[#0E0C1F] items-center justify-center">
//       {/* Khung đăng nhập với màu nền #222222 và hiệu ứng đổ bóng */}
//       <View
//         className="w-11/12 p-8 rounded-2xl"
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
//           Login
//         </Text>

//         {/* Input cho Email */}
//         <View className="mb-4">
//           <Text className="text-gray-300 mb-2">Email</Text>
//           <CustomTextInput
//             placeholder="Your Email"
//             value={username}
//             onChangeText={setUsername}
//             iconName="mail"
//             autoCapitalize="none"
//           />
//         </View>

//         {/* Input cho Password */}
//         <View className="mb-4">
//           <Text className="text-gray-300 mb-2">Password</Text>
//           <CustomTextInput
//             placeholder="Your Password"
//             value={password}
//             onChangeText={setPassword}
//             iconName="lock"
//             secureTextEntry
//           />
//         </View>

//         {/* Tùy chọn Remember me và Forgot password? */}
//         <View className="flex-row items-center justify-between mb-8">
//           <View className="flex-row items-center">
//             <TouchableOpacity className="w-5 h-5 border border-gray-400 rounded mr-2"></TouchableOpacity>
//             <Text className="text-[#34D399]">Remember me</Text>
//           </View>
//           <TouchableOpacity>
//             <Text className="text-[#34D399]">Forgot password?</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Nút Login với màu nền #089b0d */}
//         <View className="rounded-full p-0.5 mb-6">
//           <TouchableOpacity
//             className="bg-[#089b0d] rounded-full py-4 items-center"
//             onPress={handleLogin}
//             activeOpacity={0.7}
//           >
//             <Text className="text-white font-bold text-lg">Login</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Liên kết Don't have an account? Register */}
//         <View className="flex-row justify-center">
//           <Text className="text-gray-400">Don't have an account?</Text>
//           <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
//             <Text className="text-[#34D399] font-bold ml-1">Sign Up</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// }
import React, { useState } from 'react';
import { Text, TouchableOpacity, Alert, View } from 'react-native';
import CustomTextInput from '../components/CustomTextInput';
import authService from '../services/authService';

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('tuan@gmail.com');
  const [password, setPassword] = useState('123456');

  const handleLogin = async () => {
    try {
      // 💡 Logic tạm thời: Kiểm tra tài khoản cứng trước khi gọi API
      if (email === 'tuan@gmail.com' && password === '123456') {
        console.log('Đăng nhập thành công (tạm thời)!');
        Alert.alert('Thành công', 'Đăng nhập thành công (tạm thời)!');
        navigation.navigate('Main'); // Điều hướng đến màn hình chính
        return; // Dừng hàm tại đây, không gọi API
      }
      // Gọi API đăng nhập từ authService
      const userData = await authService.login(email, password);

      // Nếu API trả về thành công, xử lý dữ liệu và chuyển hướng
      console.log('Đăng nhập thành công!', userData);
      Alert.alert('Thành công', 'Đăng nhập thành công!');
      navigation.navigate('Main'); // Điều hướng đến màn hình chính
    } catch (error) {
      // Kiểm tra xem lỗi có phải từ phản hồi của server không
      if (error.response) {
        // Lỗi từ server (ví dụ: 401, 404)
        console.error('Lỗi đăng nhập:', error.response.data.message);
        Alert.alert('Lỗi', error.response.data.message);
      } else if (error.request) {
        // Lỗi không nhận được phản hồi từ server
        console.error('Lỗi đăng nhập: Không nhận được phản hồi từ server');
        Alert.alert('Lỗi', 'Không kết nối được đến server. Vui lòng thử lại.');
      } else {
        // Lỗi khác
        console.error('Lỗi đăng nhập:', error.message);
        Alert.alert('Lỗi', 'Đã xảy ra lỗi không mong muốn.');
      }
    }
  };

  return (
    // Nền xám đen
    <View className="flex-1 bg-[#0E0C1F] items-center justify-center">
      {/* Khung đăng nhập với màu nền #222222 và hiệu ứng đổ bóng */}
      <View
        className="w-11/12 p-8 rounded-2xl"
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
          Login
        </Text>

        {/* Input cho Email */}
        <View className="mb-4">
          <Text className="text-gray-300 mb-2">Email</Text>
          <CustomTextInput
            placeholder="Your Email"
            value={email}
            onChangeText={setEmail}
            iconName="mail"
            autoCapitalize="none"
          />
        </View>

        {/* Input cho Password */}
        <View className="mb-4">
          <Text className="text-gray-300 mb-2">Password</Text>
          <CustomTextInput
            placeholder="Your Password"
            value={password}
            onChangeText={setPassword}
            iconName="lock"
            secureTextEntry
          />
        </View>

        {/* Tùy chọn Remember me và Forgot password? */}
        <View className="flex-row items-center justify-between mb-8">
          <View className="flex-row items-center">
            <TouchableOpacity className="w-5 h-5 border border-gray-400 rounded mr-2"></TouchableOpacity>
            <Text className="text-[#34D399]">Remember me</Text>
          </View>
          <TouchableOpacity>
            <Text className="text-[#34D399]">Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Nút Login với màu nền #089b0d */}
        <View className="rounded-full p-0.5 mb-6">
          <TouchableOpacity
            className="bg-[#089b0d] rounded-full py-4 items-center"
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-lg">Login</Text>
          </TouchableOpacity>
        </View>

        {/* Liên kết Don't have an account? Register */}
        <View className="flex-row justify-center">
          <Text className="text-gray-400">Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text className="text-[#34D399] font-bold ml-1">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
