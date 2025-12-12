// components/player/GlobalPlayer.js
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { SaveToListeningHistory } from "@/services/historiesService";
import { GetExternalUrl } from "@/services/musicService"; // Import hàm lấy URL
import useAuthStore from "@/store/authStore";
import { useHistoriesStore } from "@/store/historiesStore";
import { usePlayerStore } from "@/store/playerStore";
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

const GUEST_SONG_PLAY_LIMIT = 3;

const URL_SAMPLE = [
  'https://res.cloudinary.com/chaamz03/video/upload/v1765563483/kltn/tracks/BTS_Jungkook_Euphoria_lyrics_color_lyrics_laiiji.mp3',
  'https://res.cloudinary.com/chaamz03/video/upload/v1765563485/kltn/tracks/Serendipity_Full_Length_Edition_g8jgq6.mp3',
  'https://res.cloudinary.com/chaamz03/video/upload/v1765564185/kltn/tracks/Ch%E1%BB%89_L%C3%A0_Kh%C3%B4ng_C%C3%B3_Nhau_buitruonglinh_x13ttd.mp3',
  'https://res.cloudinary.com/chaamz03/video/upload/v1765564192/kltn/tracks/T%E1%BB%ABng_Ng%C3%A0y_Y%C3%AAu_Em_Acoustic_buitruonglinh_hbfahi.mp3',
  'https://res.cloudinary.com/chaamz03/video/upload/v1765564185/kltn/tracks/Ch%E1%BB%89_L%C3%A0_Kh%C3%B4ng_C%C3%B3_Nhau_buitruonglinh_x13ttd.mp3',
  'https://res.cloudinary.com/chaamz03/video/upload/v1765564192/kltn/tracks/T%E1%BB%ABng_Ng%C3%A0y_Y%C3%AAu_Em_Acoustic_buitruonglinh_hbfahi.mp3',
]

export default function GlobalPlayer() {
  const segments = useSegments();

  // --- Store Selectors ---
  const { info, error } = useCustomAlert();
  const isGuest = useAuthStore((state) => state.isGuest);
  const guestSongPlayCount = useAuthStore((state) => state.guestSongPlayCount);
  const incrementGuestSongPlayCount = useAuthStore((state) => state.incrementGuestSongPlayCount);
  const setShowLoginWall = useAuthStore((state) => state.setShowLoginWall);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const isLastIndex = usePlayerStore((state) => state.isLastIndex);
  const seekTrigger = usePlayerStore((state) => state.seekTrigger);
  const targetSeekMs = usePlayerStore((state) => state.targetSeekMs);

  const playNext = usePlayerStore((state) => state.playNext);
  const setPlaybackPosition = usePlayerStore((state) => state.setPlaybackPosition);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const setTargetSeekMs = usePlayerStore((state) => state.setTargetSeekMs);
  const updateCurrentTrack = usePlayerStore((state) => state.updateCurrentTrack); // Lấy hàm update

  const addListenHistory = useHistoriesStore((state) => state.addListenHistory);

  // --- Refs & Internal State ---
  const historySavedRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const isAuthScreen = segments[0] === "(auth)";

  // --- Logic: Fetch External URL if missing ---
  useEffect(() => {
    const checkAndFetchUrl = async () => {
      // Nếu có track nhưng chưa có externalUrl
      if (currentTrack && !currentTrack.externalUrl) {
        console.log(`Track ${currentTrack.name} chưa có URL, đang tìm...`);
        try {
          // Gọi API lấy link
          const response = await GetExternalUrl(currentTrack.id);
          if (response?.success && response?.data?.externalUrl) {
            console.log("Đã tìm thấy URL:", response.data.externalUrl);

            // Cập nhật lại track trong store với URL mới
            // Việc này sẽ trigger lại hook useAudioPlayer bên dưới
            updateCurrentTrack({
              ...currentTrack,
              externalUrl: response.data.externalUrl
            });
          } else {
            info("Trình phát tạm không hỗ trợ bài hát này.");
          }
        } catch (err) {
          error("Lỗi khi lấy External URL:", err);
        }
      }
    };

    checkAndFetchUrl();
  }, [currentTrack?.id]); // Chạy lại khi đổi bài

  // --- Expo Audio Init ---
  // Tự động load source khi currentTrack.externalUrl thay đổi
  // Nếu chưa có URL, pass null để player chờ
  const player = useAudioPlayer(currentTrack?.externalUrl || null);
  const status = useAudioPlayerStatus(player);

  const isVisible = !!currentTrack && !isAuthScreen;

  // --- Helper: Save History ---
  const saveTrackToListeningHistory = (track, durationSec) => {
    if (isGuest) return;
    if (!track) return;

    const durationMs = durationSec * 1000;

    if (durationMs > 15000) {
      const payload = {
        itemType: 'track',
        itemId: track?.id,
        itemSpotifyId: track?.spotifyId,
        durationListened: durationMs
      };

      SaveToListeningHistory(payload).then((response) => {
        if (response.success) {
          if (response.updated) {
            console.log('Cập nhật lịch sử thành công:', response.data.id);
          } else {
            console.log('Tạo mới lịch sử thành công:', response.data.id);
            addListenHistory(response.data);
          }
        } else {
          console.log('Lưu lịch sử thất bại.');
          historySavedRef.current = null;
        }
      }).catch(err => console.log(err));
    }
  };

  // --- Effect 1: Sync Player Status to Store ---
  useEffect(() => {
    if (!status) return;

    setPlaybackPosition(status.currentTime);
    if (status.duration > 0) {
      setDuration(status.duration);
    }

    if (status.didJustFinish) {
      console.log("Audio Ended. Mode:", repeatMode);
      saveTrackToListeningHistory(currentTrack, status.duration || status.currentTime);

      if (repeatMode === "one") {
        player.seekTo(0);
        player.play();
      } else if (repeatMode === "none") {
        playNext();
        if (isLastIndex) {
          setIsPlaying(false);
        }
      } else if (repeatMode === "all") {
        playNext();
      }

      if (!isLastIndex || repeatMode === "all") {
        setIsPlaying(true);
      }
    }
  }, [status, currentTrack, repeatMode, isLastIndex]);

  // --- Effect 2: Auto-save History after 15s ---
  useEffect(() => {
    const trackId = currentTrack?.spotifyId;
    if (trackId && status.currentTime > 15 && historySavedRef.current !== trackId) {
      historySavedRef.current = trackId;
      console.log(`Bài hát ${currentTrack.name} đã qua 15s. Đang lưu lịch sử...`);
      saveTrackToListeningHistory(currentTrack, status.currentTime);
    }
  }, [status.currentTime, currentTrack?.spotifyId]);

  // --- Effect 3: Handle Play/Pause from Store ---
  useEffect(() => {
    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying]);

  // --- Effect 4: Handle Seek ---
  useEffect(() => {
    if (seekTrigger) {
      player.seekTo(0);
    }
  }, [seekTrigger]);

  useEffect(() => {
    if (targetSeekMs != null) {
      try {
        const seekSeconds = Math.max(0, targetSeekMs / 1000);
        player.seekTo(seekSeconds);
        if (isPlaying) player.play();
      } catch (e) {
        console.log('seekTo error', e);
      } finally {
        setTargetSeekMs(null);
      }
    }
  }, [targetSeekMs]);

  // --- Effect 5: Handle Track Change & Guest Logic ---
  useEffect(() => {
    if (!currentTrack) return;

    // QUAN TRỌNG: Nếu chưa có externalUrl, dừng tại đây. 
    // Để Effect Fetch URL bên trên chạy xong, update store -> Effect này chạy lại lần nữa.
    if (!currentTrack.externalUrl) {
      console.log("Chờ External URL để phát...");
      return;
    }

    // Reset cờ lưu lịch sử cho bài mới
    historySavedRef.current = null;

    let timeoutId = null;

    const performPlay = () => {
      // --- Logic cho Khách ---
      if (isGuest) {
        if (guestSongPlayCount < GUEST_SONG_PLAY_LIMIT) {
          console.log(`Khách: còn lượt (${guestSongPlayCount + 1}/${GUEST_SONG_PLAY_LIMIT}).`);
          incrementGuestSongPlayCount();
          setIsPlaying(true);
          player.play();
        } else {
          console.log("Khách: Đã hết lượt. Kích hoạt Login Wall.");
          setIsPlaying(false);
          player.pause();
          setShowLoginWall(true);
        }
      } else {
        // --- Logic cho User đã đăng nhập ---
        console.log("User: Đã đăng nhập. Phát nhạc.");
        setIsPlaying(true);
        player.play();
      }
    }

    // Delay nhỏ
    timeoutId = setTimeout(() => {
      performPlay();
    }, 500);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };

    // Thêm currentTrack.externalUrl vào dependency để effect chạy lại khi URL được update
  }, [currentTrack?.id, currentTrack?.externalUrl]);

  // --- Effect 6: App State ---
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        // Handle background logic if needed
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!isVisible) return null;

  return null;
}