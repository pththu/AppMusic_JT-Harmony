// utils/audioConfig.js
import { setAudioModeAsync } from 'expo-audio';

/**
 * Cấu hình Audio Mode cho phát nền
 * Gọi hàm này 1 lần khi app khởi động
 * @returns {Promise<boolean>} - true nếu thành công
 */
export const configureAudioForBackground = async () => {
  try {
    await setAudioModeAsync({
      // QUAN TRỌNG: Cho phép phát nhạc khi app ở background
      shouldPlayInBackground: true,
      playsInSilentMode: false,

      // Android: Giảm âm lượng các app khác khi phát nhạc
      interruptionModeAndroid: 'duckOthers',
    });

    console.log('✅ Audio mode đã được cấu hình cho phát nền');
    return true;
  } catch (error) {
    console.log('❌ Lỗi cấu hình audio mode:', error);
    return false;
  }
};

/**
 * Reset audio mode về mặc định (nếu cần)
 * @returns {Promise<void>}
 */
export const resetAudioMode = async () => {
  try {
    await setAudioModeAsync({
      shouldPlayInBackground: false,
      playsInSilentMode: false,
      interruptionMode: 'mixWithOthers',
    });

    console.log('✅ Audio mode đã reset');
  } catch (error) {
    console.log('❌ Lỗi reset audio mode:', error);
  }
};