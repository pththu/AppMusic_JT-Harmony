import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet, useColorScheme } from 'react-native';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '@/store/playerStore';

// Giới hạn (để hiển thị cho người dùng)
const GUEST_SONG_PLAY_LIMIT = 3;

export default function LoginWall() {
  const colorScheme = useColorScheme();
  const showLoginWall = useAuthStore((state) => state.showLoginWall);
  const guestSongPlayCount = useAuthStore((state) => state.guestSongPlayCount);
  const setShowLoginWall = useAuthStore((state) => state.setShowLoginWall);
  const setGuestSongPlayCount = useAuthStore((state) => state.setGuestSongPlayCount);
  const setIsGuest = useAuthStore((state) => state.setIsGuest);
  const clearPlayerStore = usePlayerStore((state) => state.clearPlayerStore);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Xác định lý do kích hoạt (để hiển thị thông báo)
  const reason =
    guestSongPlayCount >= GUEST_SONG_PLAY_LIMIT
      ? `Bạn đã dùng hết ${GUEST_SONG_PLAY_LIMIT} lượt nghe nhạc.`
      : 'Đã hết thời gian trải nghiệm.';

  const handleLogin = () => {
    // Tắt wall và điều hướng đến màn hình (auth)
    setIsGuest(false);
    setShowLoginWall(false);
    setGuestSongPlayCount(0); // Đặt lại số lượt nghe nhạc của khách
    clearPlayerStore(); // Xóa dữ liệu player store
  };

  return (
    <Modal
      visible={showLoginWall}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View className='flex-1 bg-black/50 justify-center items-center p-5'>
        <View className={`${colorScheme === 'dark' ? 'bg-[#222]' : 'bg-white'} rounded-2xl p-6 w-full max-w-md items-center shadow-lg shadow-black shadow-opacity-30 shadow-offset-0 shadow-radius-10`}>
          <Text className={`text-3xl font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-black'} mb-3`}>Vui lòng đăng nhập</Text>
          <Text className={`${colorScheme === 'dark' ? 'text-yellow-500' : 'text-red-600'} text-lg mb-4`}>{reason}</Text>
          <Text className={`${colorScheme === 'dark' ? 'text-gray-200' : 'text-black'} text-lg text-center mb-7`}>
            Đăng nhập hoặc đăng ký để tiếp tục trải nghiệm không giới hạn.
          </Text>

          <Pressable className="bg-green-600 py-3 px-8 rounded-full w-full items-center" onPress={handleLogin}>
            <Text className="text-white text-lg font-bold">Đăng nhập / Đăng ký</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
