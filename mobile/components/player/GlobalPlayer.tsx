// // components/player/GlobalPlayer.js
// import { SaveToListeningHistory } from "@/services/historiesService";
// import { GetVideoId } from "@/services/musicService";
// import useAuthStore from "@/store/authStore";
// import { useHistoriesStore } from "@/store/historiesStore";
// import { usePlayerStore } from "@/store/playerStore";
// import { useSegments } from "expo-router";
// import React, { useEffect, useRef, useState } from "react";
// import { AppState, View } from "react-native";
// // import YoutubePlayer from "react-native-youtube-iframe";
// import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";

// const GUEST_SONG_PLAY_LIMIT = 3;

// export default function GlobalPlayer() {
//   const playerRef = useRef<YoutubeIframeRef>(null);
//   const segments = useSegments();
//   const isGuest = useAuthStore((state) => state.isGuest);
//   const guestSongPlayCount = useAuthStore((state) => state.guestSongPlayCount);
//   const currentTrack = usePlayerStore((state) => state.currentTrack);
//   const isPlaying = usePlayerStore((state) => state.isPlaying);
//   const playbackPosition = usePlayerStore((state) => state.playbackPosition);
//   const repeatMode = usePlayerStore((state) => state.repeatMode);
//   const isLastIndex = usePlayerStore((state) => state.isLastIndex);
//   const seekTrigger = usePlayerStore((state) => state.seekTrigger);
//   const duration = usePlayerStore((state) => state.duration);
//   const targetSeekMs = usePlayerStore((state) => state.targetSeekMs); // Bình luận theo mốc thời gian
//   const uiOverlayOpen = usePlayerStore((state) => state.uiOverlayOpen); // tránh giật khi mở TrackCommentsModal
//   const incrementGuestSongPlayCount = useAuthStore((state) => state.incrementGuestSongPlayCount);
//   const setShowLoginWall = useAuthStore((state) => state.setShowLoginWall);
//   const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
//   const playNext = usePlayerStore((state) => state.playNext);
//   const setPlaybackPosition = usePlayerStore((state) => state.setPlaybackPosition);
//   const setDuration = usePlayerStore((state) => state.setDuration);
//   const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
//   const updateCurrentTrack = usePlayerStore((state) => state.updateCurrentTrack);
//   const addListenHistory = useHistoriesStore((state) => state.addListenHistory);
//   const setTargetSeekMs = usePlayerStore((state) => state.setTargetSeekMs);

//   const latestPositionRef = useRef(0);
//   const historySavedRef = useRef(null);
//   const appState = useRef(AppState.currentState);

//   const [videoIdTemp, setVideoIdTemp] = useState('');

//   const isAuthScreen = segments[0] === "(auth)";
//   const isVisible = !!currentTrack && !isAuthScreen;

//   const saveTrackToListeningHistory = (track, duration) => {
//     if (isGuest) {
//       console.log("Guest user - not saving listening history.");
//       return;
//     }
//     // console.log('duration: ', duration)
//     if (!track) return;
//     if (duration < 1000) {
//       duration *= 1000; // Chuyển sang mili-giây
//     }
//     if (duration > 15000) {
//       const payload = {
//         itemType: 'track',
//         itemId: track?.id,
//         itemSpotifyId: track?.spotifyId,
//         durationListened: duration
//       };

//       SaveToListeningHistory(payload).then((response) => {
//         if (response.success) {
//           if (response.updated) {
//             console.log('Cập nhật lịch sử nghe track from global thành công:', response.data.id);
//           } else {
//             console.log('Tạo mới lịch sử nghe track from global thành công:', response.data.id);
//             addListenHistory(response.data);
//           }
//         } else {
//           console.error('Lưu lịch sử thất bại, reset cờ.');
//           historySavedRef.current = null;
//         }
//       });
//     } else {
//       console.log(`Bài hát ${track.name} chưa được nghe đủ 15s (duration: ${duration}ms), không lưu lịch sử.`);
//     }
//   }

//   useEffect(() => {
//     latestPositionRef.current = playbackPosition;
//   }, [playbackPosition]);

//   const handleSaveHistory = async (track, duration) => {
//     if (duration > 15) { // Chỉ lưu nếu nghe hơn 15s
//       if (isGuest) {
//         console.log("Guest user - not saving listening history.");
//         return;
//       };
//       console.log(`SAVING HISTORY: ${track.name} at ${duration}s`);
//       try {
//         SaveToListeningHistory({
//           itemType: 'track',
//           itemId: track?.id,
//           itemSpotifyId: track?.spotifyId,
//           durationListened: duration
//         }).then((response) => {
//           if (response.success) {
//             if (response.updated) {
//               console.log('Cập nhật lịch sử nghe track thành công:', response.data);
//             } else {
//               console.log('Tạo mới lịch sử nghe track thành công:', response.data);
//               addListenHistory(response.data);
//             }
//           }
//         })
//       } catch (err) {
//         console.error("SaveToListeningHistory failed:", err)
//       }
//     } else {
//       console.log(`NOT SAVING: ${track.name} - duration ${duration}s <= 15s`);
//     }
//   };

//   const onPlayerReady = () => {
//     if (playerRef.current && playbackPosition >= 0) {
//       // playerRef.current.seekTo(playbackPosition, true);
//       playerRef.current?.seekTo(0, true);
//     }
//   };

//   const onPlayerStateChange = async (state) => {
//     const latestState = usePlayerStore.getState();
//     console.log(`[Youtube Player State] New State: ${state}`);
//     if (state === "ended") {
//       try {
//         handleSaveHistory(latestState.currentTrack, currentTrack?.duration || latestState.playbackPosition); // Lưu lại trước khi chuyển bài
//       } catch (e) {
//         console.log("Lỗi khi lấy duration lúc 'ended'", e);
//         handleSaveHistory(latestState.currentTrack, latestState.playbackPosition); // Fallback: lưu vị trí cuối cùng biết được
//       }

//       if (repeatMode === "one") {
//         playerRef.current?.seekTo(0, true);
//         return;
//       } else if (repeatMode === "none") {
//         playNext();
//         if (isLastIndex) {
//           togglePlayPause();
//         }
//       } else if (repeatMode === "all") {
//         playNext();
//       }
//       setIsPlaying(true);
//     } else if (state === "paused") {
//       try {
//         const currentTime = await playerRef.current?.getCurrentTime();
//         if (currentTime && typeof currentTime === 'number') {
//           latestState.setPlaybackPosition(currentTime);
//           handleSaveHistory(latestState.currentTrack, currentTime);
//         }
//       } catch (err) {
//         console.log("Lỗi khi lấy thởi gian Youtube:", err);
//       }
//     }
//   };

//   useEffect(() => {
//     let intervalId = null;
//     if (isPlaying && !uiOverlayOpen) {
//       intervalId = setInterval(async () => {
//         if (playerRef.current) {
//           try {
//             const currentTime = await playerRef.current.getCurrentTime();
//             setPlaybackPosition(currentTime);
//           } catch (error) {
//             console.log(error)
//           }
//         }
//       }, 1000);
//     } else {
//       if (intervalId) {
//         clearInterval(intervalId);
//       }
//     };

//     return () => {
//       if (intervalId) {
//         clearInterval(intervalId);
//       }
//     };
//   }, [isPlaying, uiOverlayOpen]);

//   useEffect(() => {
//     const subscription = AppState.addEventListener("change", async (nextAppState) => {
//       // Nếu app đang active và sắp bị inactive/background
//       if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
//         const { isPlaying, setIsPlaying } = usePlayerStore.getState();
//         if (playerRef.current && isPlaying) {
//           try {
//             setIsPlaying(!isPlaying);
//           } catch (e) {
//             console.error("Lỗi khi lưu playback position:", e);
//           }
//         }
//       }
//       appState.current = nextAppState;
//     });

//     return () => {
//       subscription.remove();
//     };
//   }, []);

//   useEffect(() => {
//     const trackForThisEffect = currentTrack;
//     const updateVideoId = async () => {
//       if (!trackForThisEffect) return;

//       const latestState = usePlayerStore.getState();
//       if (latestState.currentTrack?.spotifyId !== trackForThisEffect.spotifyId) {
//         console.log('Track đã thay đổi, hủy tìm videoId.');
//         return;
//       }

//       if (!trackForThisEffect.videoId) {
//         console.log(`Đang tìm video id cho: ${trackForThisEffect.name}`);
//         const title = trackForThisEffect.name;
//         const artists = trackForThisEffect.artists.map(artist => artist.name);
//         const payload = {
//           title,
//           artists
//         };
//         try {
//           const response = await GetVideoId(payload);
//           if (response.success) {
//             console.log('response.success: ', response.data);
//             setVideoIdTemp(response.data.videoId || '');
//             const updatedTrack = {
//               ...trackForThisEffect,
//               videoId: response.data.videoId,
//               duration: response.data.duration
//             };
//             updateCurrentTrack(updatedTrack);
//             setDuration(response.data.duration || 0);
//           }
//         } catch (err) {
//           console.log(err);
//         }
//       }
//     };

//     if (currentTrack) {
//       updateVideoId();
//     }

//     return () => {
//       const lastPosition = latestPositionRef.current; // Vị trí cuối cùng của track cũ
//       if (lastPosition === 0) return;
//       console.log(`TRACK CHANGE CLEANUP: Saving ${trackForThisEffect?.name} at ${lastPosition}s`);
//       handleSaveHistory(trackForThisEffect, lastPosition);
//     };

//   }, [currentTrack?.spotifyId]);

//   // Khi đổi bài, xử lý tạm dừng và phát lại sau delay
//   useEffect(() => {
//     if (!currentTrack) return;

//     setIsPlaying(false);
//     let timeoutId = null;

//     console.log('currentTrack?.videoId && duration', currentTrack?.videoId, duration)

//     if (currentTrack?.videoId && duration) {
//       // --- Logic cho Khách ---'
//       if (isGuest) {
//         console.log('logic guest')
//         if (guestSongPlayCount < GUEST_SONG_PLAY_LIMIT) {
//           console.log(
//             `Khách: còn lượt (${guestSongPlayCount + 1
//             }/${GUEST_SONG_PLAY_LIMIT}). Đang phát...`
//           );

//           incrementGuestSongPlayCount();
//           timeoutId = setTimeout(async () => {
//             try {
//               if (playerRef.current && playbackPosition >= 0) {
//                 await playerRef.current.seekTo(playbackPosition, true);
//               }
//               setIsPlaying(true);
//             } catch (err) {
//               console.log("Delayed play error (Guest)", err);
//             }
//           }, 700);
//         } else {
//           setShowLoginWall(true);
//           console.log("Khách: Đã hết lượt. Kích hoạt Login Wall.");
//         }
//       } else {
//         // --- Logic cho User đã đăng nhập ---
//         console.log("User: Đã đăng nhập. Đang phát...");
//         timeoutId = setTimeout(async () => {
//           try {
//             if (playerRef.current && playbackPosition >= 0) {
//               await playerRef.current.seekTo(playbackPosition, true);
//             }
//             setIsPlaying(true);
//           } catch (err) {
//             console.log("Delayed play error (User)", err);
//           }
//         }, 700);
//       }
//     }

//     return () => {
//       if (timeoutId) {
//         clearTimeout(timeoutId);
//       }
//     };
//   }, [currentTrack?.spotifyId, currentTrack?.videoId]);

//   useEffect(() => {
//     if (seekTrigger && playerRef.current) {
//       playerRef.current.seekTo(0, true);
//     }
//   }, [seekTrigger]);

//   useEffect(() => {
//     if (targetSeekMs != null && playerRef.current) {
//       try {
//         playerRef.current.seekTo(Math.max(0, (targetSeekMs || 0) / 1000), true);
//       } catch (e) {
//         console.log('seekTo error', e);
//       } finally {
//         setTargetSeekMs && setTargetSeekMs(null);
//       }
//     }
//   }, [targetSeekMs]);

//   useEffect(() => {
//     historySavedRef.current = null;
//   }, [currentTrack?.spotifyId]);

//   useEffect(() => {
//     const trackId = currentTrack?.spotifyId;
//     console.log('playbackPosition', playbackPosition)
//     if (trackId && playbackPosition > 15 && historySavedRef.current !== trackId) {
//       historySavedRef.current = trackId;
//       console.log(`Bài hát ${currentTrack.name} đã qua 15s. Đang lưu lịch sử...`);
//       saveTrackToListeningHistory(currentTrack, playbackPosition);
//     }
//   }, [playbackPosition, currentTrack?.spotifyId]);

//   const videoIdToPlay = currentTrack?.videoId || videoIdTemp;
//   if (!currentTrack) return null;
//   if (!isVisible) return null;
//   if (!videoIdToPlay) return null;

//   console.log('videoIdToPlay', videoIdToPlay)

//   return (
//     <View style={{ height: 1, width: 1, opacity: 0 }}>
//       <YoutubePlayer
//         ref={playerRef}
//         height={1}
//         width={1}
//         videoId={videoIdToPlay}
//         play={isPlaying}
//         onChangeState={onPlayerStateChange}
//         onReady={onPlayerReady}

//         forceAndroidAutoplay={true}
//         baseUrlOverride="https://www.youtube.com"
//         webViewProps={{
//           // Cho phép chạy script
//           javaScriptEnabled: true,

//           // Cho phép phát media dạng inline (không bung full màn hình)
//           allowsInlineMediaPlayback: true,

//           // Tự động phát mà không cần người dùng chạm tay vào màn hình lần nữa
//           mediaPlaybackRequiresUserAction: false,

//           // QUAN TRỌNG NHẤT: Giả danh trình duyệt Desktop (Macbook) để Youtube không biết đây là điện thoại
//           userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36",

//           // Cho phép điều hướng nội bộ an toàn
//           originWhitelist: ['*'],
//         }}
//       />
//     </View>
//   );
// }

// components/player/GlobalPlayer.js
import { SaveToListeningHistory } from "@/services/historiesService";
import { GetVideoId } from "@/services/musicService";
import useAuthStore from "@/store/authStore";
import { useHistoriesStore } from "@/store/historiesStore";
import { usePlayerStore } from "@/store/playerStore";
import { useAudioPlayer } from 'expo-audio'; // Import đúng hook
import { useSegments } from "expo-router";
import { useEffect, useRef } from "react";

const GUEST_SONG_PLAY_LIMIT = 3;

// Danh sách Server Piped
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.yt',
  'https://pipedapi.drgns.space',
  'https://piped-api.garudalinux.org'
];

export default function GlobalPlayer() {
  const segments = useSegments();

  // -- ZUSTAND STORES --
  const { isGuest, guestSongPlayCount, incrementGuestSongPlayCount, setShowLoginWall } = useAuthStore();
  const {
    currentTrack, isPlaying, playbackPosition, repeatMode, isLastIndex,
    seekTrigger, duration, targetSeekMs, uiOverlayOpen,
    togglePlayPause, playNext, setPlaybackPosition, setDuration,
    setIsPlaying, updateCurrentTrack, setTargetSeekMs
  } = usePlayerStore();
  const { addListenHistory } = useHistoriesStore();

  // -- REFS --
  const latestPositionRef = useRef(0);
  const historySavedRef = useRef(null);

  // -- EXPO AUDIO PLAYER SETUP --
  const player = useAudioPlayer(null);

  const isAuthScreen = segments[0] === "(auth)";

  // --- 1. HÀM LẤY DIRECT URL (GIỮ NGUYÊN) ---
  const getDirectAudioUrl = async (videoId) => {
    for (const instance of PIPED_INSTANCES) {
      try {
        // console.log(`Fetching audio from: ${instance}`);
        const response = await fetch(`${instance}/streams/${videoId}`);
        const data = await response.json();

        if (data.error) continue;

        const audioStream = data.audioStreams.find(s => s.format === 'M4A') || data.audioStreams[0];
        if (audioStream) return audioStream.url;
      } catch (e) {
        // console.warn(`Error fetching from ${instance}:`, e.message);
      }
    }
    return null;
  };

  // --- 2. LOGIC LƯU LỊCH SỬ ---
  const saveTrackToListeningHistory = (track, listenDurationSec) => {
    if (isGuest || !track) return;
    const durationMs = listenDurationSec * 1000;

    if (durationMs > 15000) {
      const payload = {
        itemType: 'track',
        itemId: track?.id,
        itemSpotifyId: track?.spotifyId,
        durationListened: durationMs
      };

      SaveToListeningHistory(payload).then((response) => {
        if (response.success) {
          if (!response.updated) addListenHistory(response.data);
          console.log('Lưu lịch sử thành công:', track.name);
        } else {
          historySavedRef.current = null;
        }
      });
    }
  };

  // --- 3. [FIXED] QUẢN LÝ TIẾN TRÌNH & SỰ KIỆN ---

  // A. Cập nhật thanh tiến trình (Progress) bằng Interval (Thay vì Event Listener)
  useEffect(() => {
    let interval = null;

    if (player && isPlaying && !uiOverlayOpen) {
      interval = setInterval(() => {
        // Lấy thời gian hiện tại trực tiếp từ player
        const currentSec = player.currentTime;

        // Cập nhật Store
        setPlaybackPosition(currentSec);
        latestPositionRef.current = currentSec;

        // Kiểm tra lưu lịch sử > 15s
        const trackId = currentTrack?.spotifyId;
        if (trackId && currentSec > 15 && historySavedRef.current !== trackId) {
          historySavedRef.current = trackId;
          // console.log(`Đã nghe > 15s. Lưu lịch sử...`);
          saveTrackToListeningHistory(currentTrack, currentSec);
        }
      }, 1000); // Cập nhật mỗi 1 giây
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [player, isPlaying, uiOverlayOpen, currentTrack]);


  // B. Lắng nghe trạng thái (Kết thúc bài hát)
  useEffect(() => {
    if (!player) return;

    // Lắng nghe sự kiện thay đổi trạng thái của player
    const statusSubscription = player.addListener('status', (status) => {
      // Cập nhật duration nếu có thay đổi
      if (player.duration && duration !== player.duration) {
        setDuration(player.duration);
      }

      // Kiểm tra bài hát đã kết thúc chưa
      // Lưu ý: expo-audio status có thể khác nhau tùy version, 
      // cách chuẩn nhất là check status.status === 'idle' và đã chạy hết thời gian
      // Hoặc kiểm tra event 'recorderStateChange' (nếu nhầm) -> Nhưng với AudioPlayer là statusChange

      // Log status để debug nếu cần: console.log(status);

      // Giả lập check ended: Nếu player dừng và thời gian hiện tại xấp xỉ duration
      if (status.status === 'readyToPlay' || status.status === 'idle') {
        // Logic check ended có thể cần tinh chỉnh tùy version expo-audio
        // Một số bản dùng event 'playToEnd'
      }
    });

    // expo-audio có thể có event riêng cho việc kết thúc, tên là 'playToEnd' (nếu có trong bản bạn dùng)
    // Nếu TypeScript báo lỗi statusChange, hãy thử kiểm tra lại type AudioEvents

    // HACK: Để bắt sự kiện ENDED chuẩn nhất trên expo-audio hiện tại:
    // Thường dùng check trong Interval ở trên hoặc lắng nghe playingChange

    return () => {
      statusSubscription.remove();
    };
  }, [player, duration]);

  // FIX: Xử lý ENDED thủ công trong Interval (An toàn nhất cho bản Beta)
  useEffect(() => {
    if (!player || !isPlaying) return;
    const checkEndInterval = setInterval(() => {
      if (player.duration > 0 && player.currentTime >= player.duration - 0.5) {
        console.log("Audio Ended (Detected via Interval)");
        player.pause();
        player.seekTo(0); // Reset về đầu

        saveTrackToListeningHistory(currentTrack, player.duration);

        if (repeatMode === "one") {
          player.play();
        } else if (repeatMode === "none") {
          playNext();
          if (isLastIndex) setIsPlaying(false);
        } else if (repeatMode === "all") {
          playNext();
        }
      }
    }, 1000);
    return () => clearInterval(checkEndInterval);
  }, [player, isPlaying, duration, repeatMode, isLastIndex, currentTrack]);


  // --- 4. TẢI VÀ PHÁT NHẠC ---
  useEffect(() => {
    const loadSource = async () => {
      if (!currentTrack || !player) return;

      historySavedRef.current = null;
      player.pause();

      let videoId = currentTrack.videoId;
      if (!videoId) {
        try {
          const res = await GetVideoId({
            title: currentTrack.name,
            artists: currentTrack.artists.map(a => a.name)
          });
          if (res.success) {
            videoId = res.data.videoId;
            updateCurrentTrack({ ...currentTrack, videoId });
          }
        } catch (e) { console.log(e); return; }
      }

      if (isGuest) {
        if (guestSongPlayCount >= GUEST_SONG_PLAY_LIMIT) {
          setShowLoginWall(true);
          setIsPlaying(false);
          return;
        }
        incrementGuestSongPlayCount();
      }

      const audioUrl = await getDirectAudioUrl(videoId);
      if (audioUrl) {
        try {
          const source = { uri: audioUrl };
          await player.replace(source);
          player.play();
          setIsPlaying(true);
        } catch (err) {
          console.error("Lỗi replace source:", err);
        }
      }
    };

    loadSource();
  }, [currentTrack?.spotifyId]);

  // --- 5. ĐỒNG BỘ PLAY/PAUSE ---
  useEffect(() => {
    if (!player) return;
    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying, player]);

  // --- 6. XỬ LÝ TUA ---
  useEffect(() => {
    if (!player) return;
    if (seekTrigger) {
      player.seekTo(0);
    }
    if (targetSeekMs != null) {
      player.seekTo(targetSeekMs / 1000);
      setTargetSeekMs(null);
    }
  }, [seekTrigger, targetSeekMs, player]);

  return null;
}