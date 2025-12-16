// hooks/useBackgroundAudio.js
import * as backgroundAudio from '@/services/backgroundAudioService';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

/**
 * Custom hook để quản lý background audio và notifications
 * @param {Object} options
 * @param {Object} options.currentTrack - Track hiện tại
 * @param {boolean} options.isPlaying - Trạng thái phát
 * @param {number} options.currentPosition - Vị trí hiện tại (seconds)
 * @param {boolean} options.enabled - Bật/tắt background audio
 */
export const useBackgroundAudio = ({
  currentTrack,
  isPlaying,
  currentPosition,
  enabled = true,
}) => {
  const appState = useRef(AppState.currentState);
  const lastSyncTime = useRef(Date.now());
  const STATE_SYNC_INTERVAL = 5000; // 5 seconds

  // Setup notifications khi mount
  useEffect(() => {
    if (!enabled) return;
    backgroundAudio.setupNotifications();
  }, [enabled]);

  // Update notification khi track hoặc play state thay đổi
  useEffect(() => {
    if (!enabled || !currentTrack) return;

    backgroundAudio.showMusicNotification(currentTrack, isPlaying);
  }, [currentTrack?.id, isPlaying, enabled]);

  // Lưu playback state định kỳ
  useEffect(() => {
    if (!enabled || !currentTrack || currentPosition <= 0) return;

    const now = Date.now();
    if (now - lastSyncTime.current > STATE_SYNC_INTERVAL) {
      lastSyncTime.current = now;

      backgroundAudio.savePlaybackState({
        track: currentTrack,
        position: currentPosition,
        isPlaying,
      });
    }
  }, [currentTrack, currentPosition, isPlaying, enabled]);

  // Handle app state changes
  useEffect(() => {
    if (!enabled) return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // App đi vào background
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        console.log('🌙 App đi vào background');

        // Lưu state ngay lập tức
        if (currentTrack && currentPosition > 0) {
          backgroundAudio.savePlaybackState({
            track: currentTrack,
            position: currentPosition,
            isPlaying,
          });
        }
      }

      // App quay lại foreground
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App quay lại foreground');

        // Đồng bộ lại notification
        if (currentTrack) {
          backgroundAudio.showMusicNotification(currentTrack, isPlaying);
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [currentTrack, currentPosition, isPlaying, enabled]);

  // Cleanup khi unmount hoặc không còn track
  useEffect(() => {
    return () => {
      if (!currentTrack) {
        backgroundAudio.clearNotification();
      }
    };
  }, [currentTrack]);

  // Return các hàm utility
  const clearNotification = useCallback(() => {
    return backgroundAudio.clearNotification();
  }, []);

  const saveState = useCallback(() => {
    if (!currentTrack || currentPosition <= 0) return;

    return backgroundAudio.savePlaybackState({
      track: currentTrack,
      position: currentPosition,
      isPlaying,
    });
  }, [currentTrack, currentPosition, isPlaying]);

  return {
    clearNotification,
    saveState,
  };
};

/**
 * Hook riêng để restore playback state khi app khởi động
 * @returns {Object|null} - Restored state hoặc null
 */
export const useRestorePlaybackState = () => {
  const [restoredState, setRestoredState] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const state = await backgroundAudio.restorePlaybackState();
      setRestoredState(state);
      setIsRestoring(false);
    };

    restore();
  }, []);

  return {
    restoredState,
    isRestoring,
  };
};