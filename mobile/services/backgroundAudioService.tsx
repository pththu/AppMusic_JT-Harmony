// services/backgroundAudioService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// ==================== CONSTANTS ====================

const STORAGE_KEYS = {
  PLAYBACK_STATE: '@music_playback_state',
};

// State internal của service
let currentNotificationId = null;

// ==================== NOTIFICATION SETUP ====================

/**
 * Cấu hình notification handler
 * Gọi 1 lần khi app khởi động
 */
export const setupNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: false, // iOS-specific
      shouldShowList: false,   // iOS-specific
    }),
  });
};

// ==================== PERMISSIONS ====================

/**
 * Yêu cầu quyền thông báo
 * @returns {Promise<boolean>}
 */
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('⚠️ Không có quyền thông báo');
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Lỗi request permissions:', error);
    return false;
  }
};

// ==================== NOTIFICATION MANAGEMENT ====================

/**
 * Hiển thị/Cập nhật notification với thông tin bài hát
 * @param {Object} track - Thông tin bài hát
 * @param {boolean} isPlaying - Trạng thái phát
 * @returns {Promise<string|null>} - Notification ID
 */
export const showMusicNotification = async (track, isPlaying = true) => {
  if (!track) return null;

  console.log('track', track.name)

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    console.log(1)
    // Xóa notification cũ nếu có
    if (currentNotificationId) {
      console.log(2)
      await Notifications.dismissNotificationAsync(currentNotificationId);
    }
    
    console.log(3)
    // Chuẩn bị nội dung notification
    const content = {
      title: track.name || 'Đang phát nhạc',
      body: `${track.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}${isPlaying ? ' 🎵' : ' ⏸'}`,
      data: {
        trackId: track.id,
        spotifyId: track.spotifyId,
        isPlaying,
        timestamp: Date.now(),
      },
      sound: false,
      sticky: true,
      ongoing: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      // android: {
      //   largeIcon: track.album.images[0].url,
      //   color: '#1DB954',
      //   channelId: 'music-playback',
      // }
    };

    console.log('content', content)

    // Hiển thị notification
    currentNotificationId = await Notifications.scheduleNotificationAsync({
      content,
      trigger: null,
    });

    console.log('✅ Notification đã hiển thị:', currentNotificationId);
    return currentNotificationId;
  } catch (error) {
    console.log('❌ Lỗi hiển thị notification:', error);
    return null;
  }
};

/**
 * Xóa notification hiện tại
 * @returns {Promise<void>}
 */
export const clearNotification = async () => {
  try {
    if (currentNotificationId) {
      await Notifications.dismissNotificationAsync(currentNotificationId);
      currentNotificationId = null;
      console.log('🗑️ Đã xóa notification');
    }
  } catch (error) {
    console.error('❌ Lỗi xóa notification:', error);
  }
};

/**
 * Xóa tất cả notifications
 * @returns {Promise<void>}
 */
export const clearAllNotifications = async () => {
  try {
    await Notifications.dismissAllNotificationsAsync();
    currentNotificationId = null;
    console.log('🗑️ Đã xóa tất cả notifications');
  } catch (error) {
    console.error('❌ Lỗi xóa all notifications:', error);
  }
};

// ==================== PLAYBACK STATE MANAGEMENT ====================

/**
 * Lưu trạng thái playback vào AsyncStorage
 * @param {Object} state - Trạng thái playback
 * @param {Object} state.track - Track hiện tại
 * @param {number} state.position - Vị trí phát (giây)
 * @param {boolean} state.isPlaying - Đang phát hay không
 * @returns {Promise<void>}
 */
export const savePlaybackState = async (state) => {
  try {
    const stateData = {
      track: state.track,
      position: state.position,
      isPlaying: state.isPlaying,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(
      STORAGE_KEYS.PLAYBACK_STATE,
      JSON.stringify(stateData)
    );

    console.log('💾 Đã lưu playback state');
  } catch (error) {
    console.error('❌ Lỗi lưu playback state:', error);
  }
};

/**
 * Restore trạng thái playback từ AsyncStorage
 * @returns {Promise<Object|null>} - State đã lưu hoặc null
 */
export const restorePlaybackState = async () => {
  try {
    const stateJson = await AsyncStorage.getItem(STORAGE_KEYS.PLAYBACK_STATE);

    if (!stateJson) {
      console.log('ℹ️ Không có playback state để restore');
      return null;
    }

    const state = JSON.parse(stateJson);

    // Chỉ restore nếu state không quá cũ (< 24h)
    const ageHours = (Date.now() - state.timestamp) / (1000 * 60 * 60);
    if (ageHours > 24) {
      console.log('⏰ Playback state đã quá cũ, bỏ qua');
      await clearPlaybackState();
      return null;
    }

    console.log('🔄 Restore playback state:', {
      track: state.track?.name,
      position: state.position,
      age: `${ageHours.toFixed(1)}h ago`,
    });

    return state;
  } catch (error) {
    console.error('❌ Lỗi restore playback state:', error);
    return null;
  }
};

/**
 * Xóa state đã lưu
 * @returns {Promise<void>}
 */
export const clearPlaybackState = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PLAYBACK_STATE);
    console.log('🗑️ Đã xóa playback state');
  } catch (error) {
    console.error('❌ Lỗi xóa playback state:', error);
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Kiểm tra xem có notification đang hiển thị không
 * @returns {boolean}
 */
export const hasActiveNotification = () => {
  return currentNotificationId !== null;
};

/**
 * Lấy notification ID hiện tại
 * @returns {string|null}
 */
export const getCurrentNotificationId = () => {
  return currentNotificationId;
};

// ==================== EXPORT DEFAULT ====================

// Export all functions as default object (để tương thích với code cũ)
export default {
  setupNotifications,
  requestNotificationPermissions,
  showMusicNotification,
  clearNotification,
  clearAllNotifications,
  savePlaybackState,
  restorePlaybackState,
  clearPlaybackState,
  hasActiveNotification,
  getCurrentNotificationId,
};