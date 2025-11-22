import { useEffect, useRef, useCallback } from 'react';
import useAuthStore from '@/store/authStore';
import { useSegments } from 'expo-router';

// --- Hằng số cấu hình ---
// (Trigger 1) Giới hạn số lần chơi nhạc cho khách
const GUEST_SONG_PLAY_LIMIT = 3;
// (Trigger 2) Thời gian sử dụng app (15 phút)
// const GUEST_APP_USAGE_TIMEOUT_MS = 30 * 1000;
const GUEST_APP_USAGE_TIMEOUT_MS = 15 * 60 * 1000;
// Để demo, bạn có thể đổi thành 10 giây (10 * 1000)

export function useGuestTriggers() {
  const segments = useSegments();
  const isGuest = useAuthStore((state) => state.isGuest);
  const guestSongPlayCount = useAuthStore((state) => state.guestSongPlayCount);
  const setShowLoginWall = useAuthStore((state) => state.setShowLoginWall);
  const showLoginWall = useAuthStore((state) => state.showLoginWall);

  const isAuthScreen = segments[0] === "(auth)";
  // Ref cho bộ đếm thời gian (Trigger 2)
  const appUsageTimerRef = useRef(null);

  // Hàm hủy Trigger 2 (Time)
  const clearUsageTimer = useCallback(() => {
    if (appUsageTimerRef.current) {
      console.log(
        'Hủy Trigger 2 (Time): Người dùng bắt đầu tương tác (chơi nhạc).'
      );
      clearTimeout(appUsageTimerRef.current);
      appUsageTimerRef.current = null;
    }
  }, []);

  // Hàm bắt đầu Trigger 2 (Time)
  const startUsageTimer = useCallback(() => {
    clearUsageTimer(); // Đảm bảo không có bộ đếm nào đang chạy
    console.log(
      `Kích hoạt Trigger 2 (Time): Bắt đầu đếm ${GUEST_APP_USAGE_TIMEOUT_MS / 1000
      } giây.`
    );
    appUsageTimerRef.current = setTimeout(() => {
      console.log(
        'KÍCH HOẠT LOGIN WALL (Trigger 2): Hết thời gian sử dụng.'
      );
      setShowLoginWall(true);
    }, GUEST_APP_USAGE_TIMEOUT_MS);
  }, [clearUsageTimer, setShowLoginWall]);

  // Effect chính để quản lý các trigger
  useEffect(() => {
    // Chỉ chạy logic này nếu là khách và Login Wall chưa hiển thị
    if (!isGuest || showLoginWall) {
      // Nếu không phải khách (đã đăng nhập) hoặc wall đã hiện,
      // hãy đảm bảo timer đã tắt.
      clearUsageTimer();
      return;
    }

    // --- Xử lý Trigger 1 (Action) ---
    if (guestSongPlayCount > 0) {
      // Ngay khi khách chơi bài hát đầu tiên, hủy Trigger 2 (15 phút).
      clearUsageTimer();
    }

    if (guestSongPlayCount > GUEST_SONG_PLAY_LIMIT) {
      console.log(
        `KÍCH HOẠT LOGIN WALL (Trigger 1): Đã hết ${GUEST_SONG_PLAY_LIMIT} lượt nghe.`
      );
      setShowLoginWall(true);
      return; // Dừng lại
    }

    if (guestSongPlayCount === 0 && !appUsageTimerRef.current) {
      startUsageTimer();
    }

    return () => clearUsageTimer(); // hủy timer khi unmount hoặc dependencies thay đổi
  }, [
    isGuest,
    guestSongPlayCount,
    showLoginWall,
    setShowLoginWall,
    startUsageTimer,
    clearUsageTimer,
  ]);

  useEffect(() => {
    if (isAuthScreen) {
      clearUsageTimer();
      setShowLoginWall(false);
    }
  }, [isAuthScreen]);
}