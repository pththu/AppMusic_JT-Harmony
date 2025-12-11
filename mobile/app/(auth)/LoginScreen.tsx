// import CustomTextInput from "@/components/custom/CustomTextInput";
// import { useAuthData } from "@/hooks/useAuthData";
// import { useCustomAlert } from "@/hooks/useCustomAlert";
// import { useNavigate } from "@/hooks/useNavigate";
// import { Login } from "@/routes/ApiRouter";
// import useAuthStore from "@/store/authStore";
// import { useBoardingStore } from "@/store/boardingStore";
// import { validateForm } from "@/utils";
// import React, { useState } from "react";
// import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function LoginScreen() {
//   const colorScheme = useColorScheme();
//   const { navigate } = useNavigate();
//   const { success, error } = useCustomAlert();
//   const { login } = useAuthStore();
//   const {
//     fetchHistory,
//     fetchFavoritesItem,
//     fetchArtistFollowed,
//     fetchMyPlaylists,
//     fetchFollowers,
//     fetchFollowees
//   } = useAuthData();

//   const setWhenLogin = useBoardingStore(state => state.setWhenLogin);

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLogin = async () => {
//     const validationMessage = validateForm(email, password);
//     if (validationMessage) {
//       error("Lỗi Đăng Nhập", validationMessage);
//       return;
//     }
//     try {
//       const payload = { email, password };
//       const response = await Login(payload);
//       if (!response.success) {
//         error("Lỗi Đăng Nhập", response.message || "Đăng nhập thất bại.");
//         return;
//       }
//       const userId = response.user.id;
//       await Promise.all([
//         fetchHistory(userId),
//         fetchFavoritesItem(userId),
//         fetchArtistFollowed(userId),
//         fetchMyPlaylists(userId),
//       ])
//       setWhenLogin();
//       login(response.user, 'local', response.user?.accessToken);
//       success("Thành Công", "Đăng nhập thành công!");
//       // navigate("Main");
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message ||
//         "Đã xảy ra lỗi trong quá trình đăng nhập.";
//       error("Lỗi Đăng Nhập", errorMessage);
//     }
//   };

//   return (
//     <SafeAreaView className={`flex-1 items-center justify-center ${colorScheme === "dark" ? "bg-[#0E0C1F]" : "bg-white"}`}>
//       <View
//         className="w-11/12 p-8 rounded-2xl"
//         style={{
//           backgroundColor: colorScheme === "dark" ? "#222222" : "white",
//           shadowColor: "#000",
//           shadowOffset: { width: 0, height: 10 },
//           shadowOpacity: 0.2,
//           shadowRadius: 10,
//           elevation: 10,
//         }}
//       >
//         <Text className={`text-4xl font-extrabold mb-6 text-center ${colorScheme === "dark" ? "text-white" : "text-[#0E0C1F]"}`}>
//           Đăng nhập
//         </Text>

//         {/* Input cho Email */}
//         <View className="mb-4">
//           <Text className={`text-gray-300 mb-2 ${colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Email</Text>
//           <CustomTextInput
//             placeholder="Nhập email"
//             value={email}
//             onChangeText={setEmail}
//             iconName="mail"
//             autoCapitalize="none"
//           />
//         </View>

//         {/* Input cho Password */}
//         <View className="mb-4">
//           <Text className={`text-gray-300 mb-2 ${colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Mật khẩu</Text>
//           <CustomTextInput
//             placeholder="Nhập mật khẩu"
//             value={password}
//             onChangeText={setPassword}
//             iconName="lock"
//             secureTextEntry
//           />
//         </View>

//         {/* Tùy chọn Remember me và Forgot password? */}
//         <View className="flex-row items-center justify-center mb-8">
//           <TouchableOpacity onPress={() => navigate("ForgotPassword")}>
//             <Text className="text-[#34D399] underline">Quên mật khẩu?</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Nút Login */}
//         <View className="rounded-full p-0.5 mb-6">
//           <TouchableOpacity
//             className="bg-[#089b0d] rounded-full py-4 items-center"
//             onPress={handleLogin}
//             activeOpacity={0.7}
//           >
//             <Text className="text-white font-bold text-lg">Đăng nhập</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Liên kết Chưa có tài khoản? Đăng ký */}
//         <View className="flex-row justify-center">
//           <Text className="text-gray-400">Chưa có tài khoản?</Text>
//           <TouchableOpacity onPress={() => navigate("SignUp")}>
//             <Text className="text-[#34D399] font-bold ml-1">Đăng ký</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

import CustomTextInput from "@/components/custom/CustomTextInput";
import { useAuthData } from "@/hooks/useAuthData";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useNavigate } from "@/hooks/useNavigate";
import { Login } from "@/routes/ApiRouter";
import useAuthStore from "@/store/authStore";
import { useBoardingStore } from "@/store/boardingStore";
import { validateForm } from "@/utils";
import React, { useState, useEffect } from "react"; // Đã thêm useEffect
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router"; // Import thêm useNavigation

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const { success, error } = useCustomAlert();
  const { login } = useAuthStore();
  const navigation = useNavigation(); // Hook để truy cập đối tượng navigation gốc

  const {
    fetchHistory,
    fetchFavoritesItem,
    fetchArtistFollowed,
    fetchMyPlaylists,
    fetchFollowers,
    fetchFollowees
  } = useAuthData();

  const setWhenLogin = useBoardingStore(state => state.setWhenLogin);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- XỬ LÝ NÚT BACK VÀ CỬ CHỈ VUỐT ---
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      // Chỉ chặn khi hành động là 'GO_BACK' (Back button hoặc Swipe back)
      // Không chặn nếu là 'PUSH' hoặc 'REPLACE' (ví dụ khi login thành công và chuyển trang)
      if (e.data.action.type === 'GO_BACK') {
        // Ngăn chặn hành động mặc định (thoát màn hình hoặc quay lại trang trước đó trong stack)
        e?.preventDefault();

        // Điều hướng thủ công về trang index của (auth)
        // Lưu ý: Đảm bảo route "(auth)" hoặc "(auth)/index" là hợp lệ trong cấu hình router của bạn
        navigate("Auth");
      }
    });

    return unsubscribe;
  }, [navigation, navigate]);
  // --------------------------------------

  const handleLogin = async () => {
    const validationMessage = validateForm(email, password);
    if (validationMessage) {
      error("Lỗi Đăng Nhập", validationMessage);
      return;
    }
    try {
      const payload = { email, password };
      const response = await Login(payload);
      if (!response.success) {
        error("Lỗi Đăng Nhập", response.message || "Đăng nhập thất bại.");
        return;
      }
      const userId = response.user.id;
      await Promise.all([
        fetchHistory(userId),
        fetchFavoritesItem(userId),
        fetchArtistFollowed(userId),
        fetchMyPlaylists(userId),
      ])
      setWhenLogin();
      login(response.user, 'local', response.user?.accessToken);
      success("Thành Công", "Đăng nhập thành công!");
      // navigate("Main");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Đã xảy ra lỗi trong quá trình đăng nhập.";
      error("Lỗi Đăng Nhập", errorMessage);
    }
  };

  return (
    <SafeAreaView className={`flex-1 items-center justify-center ${colorScheme === "dark" ? "bg-[#0E0C1F]" : "bg-white"}`}>
      <View
        className="w-11/12 p-8 rounded-2xl"
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
          Đăng nhập
        </Text>

        {/* Input cho Email */}
        <View className="mb-4">
          <Text className={`text-gray-300 mb-2 ${colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Email</Text>
          <CustomTextInput
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
            iconName="mail"
            autoCapitalize="none"
          />
        </View>

        {/* Input cho Password */}
        <View className="mb-4">
          <Text className={`text-gray-300 mb-2 ${colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Mật khẩu</Text>
          <CustomTextInput
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            iconName="lock"
            secureTextEntry
          />
        </View>

        {/* Tùy chọn Remember me và Forgot password? */}
        <View className="flex-row items-center justify-center mb-8">
          <TouchableOpacity onPress={() => navigate("ForgotPassword")}>
            <Text className="text-[#34D399] underline">Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>

        {/* Nút Login */}
        <View className="rounded-full p-0.5 mb-6">
          <TouchableOpacity
            className="bg-[#089b0d] rounded-full py-4 items-center"
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-lg">Đăng nhập</Text>
          </TouchableOpacity>
        </View>

        {/* Liên kết Chưa có tài khoản? Đăng ký */}
        <View className="flex-row justify-center">
          <Text className="text-gray-400">Chưa có tài khoản?</Text>
          <TouchableOpacity onPress={() => navigate("SignUp")}>
            <Text className="text-[#34D399] font-bold ml-1">Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}