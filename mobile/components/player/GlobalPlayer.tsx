// components/player/GlobalPlayer.js
import { SaveToListeningHistory } from "@/services/historiesService";
import { GetVideoId } from "@/services/musicService";
import useAuthStore from "@/store/authStore";
import { useHistoriesStore } from "@/store/historiesStore";
import { usePlayerStore } from "@/store/playerStore";
import { useSegments } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

const GUEST_SONG_PLAY_LIMIT = 3;

export default function GlobalPlayer() {
  const playerRef = useRef(null);
  const segments = useSegments();
  const isGuest = useAuthStore((state) => state.isGuest);
  const guestSongPlayCount = useAuthStore((state) => state.guestSongPlayCount);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playbackPosition = usePlayerStore((state) => state.playbackPosition);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const isLastIndex = usePlayerStore((state) => state.isLastIndex);
  const seekTrigger = usePlayerStore((state) => state.seekTrigger);
  const duration = usePlayerStore((state) => state.duration);
  const targetSeekMs = usePlayerStore((state) => state.targetSeekMs); // Bình luận theo mốc thời gian
  const uiOverlayOpen = usePlayerStore((state) => state.uiOverlayOpen); // tránh giật khi mở TrackCommentsModal
  const incrementGuestSongPlayCount = useAuthStore((state) => state.incrementGuestSongPlayCount);
  const setShowLoginWall = useAuthStore((state) => state.setShowLoginWall);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const playNext = usePlayerStore((state) => state.playNext);
  const setPlaybackPosition = usePlayerStore((state) => state.setPlaybackPosition);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const updateCurrentTrack = usePlayerStore((state) => state.updateCurrentTrack);
  const addListenHistory = useHistoriesStore((state) => state.addListenHistory);
  const setTargetSeekMs = usePlayerStore((state) => state.setTargetSeekMs);

  const latestPositionRef = useRef(0);
  const historySavedRef = useRef(null);
  const appState = useRef(AppState.currentState);

  const [videoIdTemp, setVideoIdTemp] = useState('');

  const isAuthScreen = segments[0] === "(auth)";
  const isVisible = !!currentTrack && !isAuthScreen;

  const saveTrackToListeningHistory = (track, duration) => {
    if (isGuest) {
      console.log("Guest user - not saving listening history.");
      return;
    }
    // console.log('duration: ', duration)
    if (!track) return;
    if (duration < 1000) {
      duration *= 1000; // Chuyển sang mili-giây
    }
    if (duration > 15000) {
      const payload = {
        itemType: 'track',
        itemId: track?.id,
        itemSpotifyId: track?.spotifyId,
        durationListened: duration
      };

      SaveToListeningHistory(payload).then((response) => {
        if (response.success) {
          if (response.updated) {
            console.log('Cập nhật lịch sử nghe track from global thành công:', response.data.id);
          } else {
            console.log('Tạo mới lịch sử nghe track from global thành công:', response.data.id);
            addListenHistory(response.data);
          }
        } else {
          console.error('Lưu lịch sử thất bại, reset cờ.');
          historySavedRef.current = null;
        }
      });
    } else {
      console.log(`Bài hát ${track.name} chưa được nghe đủ 15s (duration: ${duration}ms), không lưu lịch sử.`);
    }
  }

  useEffect(() => {
    latestPositionRef.current = playbackPosition;
  }, [playbackPosition]);

  const handleSaveHistory = async (track, duration) => {
    if (duration > 15) { // Chỉ lưu nếu nghe hơn 15s
      if (isGuest) {
        console.log("Guest user - not saving listening history.");
        return;
      };
      console.log(`SAVING HISTORY: ${track.name} at ${duration}s`);
      try {
        SaveToListeningHistory({
          itemType: 'track',
          itemId: track?.id,
          itemSpotifyId: track?.spotifyId,
          durationListened: duration
        }).then((response) => {
          if (response.success) {
            if (response.updated) {
              console.log('Cập nhật lịch sử nghe track thành công:', response.data);
            } else {
              console.log('Tạo mới lịch sử nghe track thành công:', response.data);
              addListenHistory(response.data);
            }
          }
        })
      } catch (err) {
        console.error("SaveToListeningHistory failed:", err)
      }
    } else {
      console.log(`NOT SAVING: ${track.name} - duration ${duration}s <= 15s`);
    }
  };

  const onPlayerReady = () => {
    if (playerRef.current && playbackPosition > 0) {
      playerRef.current.seekTo(playbackPosition, true);
    }
  };

  const onPlayerStateChange = async (state) => {
    const latestState = usePlayerStore.getState();
    if (state === "ended") {
      try {
        // const durationPlayer = await playerRef.current?.getDuration(); // Lấy tổng thời lượng bài hát
        handleSaveHistory(latestState.currentTrack, currentTrack?.duration || latestState.playbackPosition); // Lưu lại trước khi chuyển bài
      } catch (e) {
        console.log("Lỗi khi lấy duration lúc 'ended'", e);
        handleSaveHistory(latestState.currentTrack, latestState.playbackPosition); // Fallback: lưu vị trí cuối cùng biết được
      }

      if (repeatMode === "one") {
        playerRef.current?.seekTo(0, true);
        return;
      } else if (repeatMode === "none") {
        playNext();
        if (isLastIndex) {
          togglePlayPause();
        }
      } else if (repeatMode === "all") {
        playNext();
      }
      setIsPlaying(true);
    }
    else if (state === "paused") {
      try {
        const currentTime = await playerRef.current?.getCurrentTime();
        if (currentTime && typeof currentTime === 'number') {
          latestState.setPlaybackPosition(currentTime);
          handleSaveHistory(latestState.currentTrack, currentTime);
        }
      } catch (err) {
        console.log("Lỗi khi lấy thởi gian Youtube:", err);
      }
    }
  };

  useEffect(() => {
    let intervalId = null;
    if (isPlaying && !uiOverlayOpen) {
      intervalId = setInterval(async () => {
        if (playerRef.current) {
          try {
            const currentTime = await playerRef.current.getCurrentTime();
            setPlaybackPosition(currentTime);
          } catch (error) {
            console.log(error)
          }
        }
      }, 1000);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, uiOverlayOpen]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      // Nếu app đang active và sắp bị inactive/background
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        const { isPlaying, setIsPlaying } = usePlayerStore.getState();
        if (playerRef.current && isPlaying) {
          try {
            setIsPlaying(!isPlaying);
          } catch (e) {
            console.error("Lỗi khi lưu playback position:", e);
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const trackForThisEffect = currentTrack;
    const updateVideoId = async () => {
      if (!trackForThisEffect) return;

      const latestState = usePlayerStore.getState();
      if (latestState.currentTrack?.spotifyId !== trackForThisEffect.spotifyId) {
        console.log('Track đã thay đổi, hủy tìm videoId.');
        return;
      }

      if (!trackForThisEffect.videoId) {
        console.log(`Đang tìm video id cho: ${trackForThisEffect.name}`);
        try {
          const response = await GetVideoId(trackForThisEffect?.spotifyId);
          if (response.success) {
            console.log('response.success: ', response.data);
            setVideoIdTemp(response.data.videoId || '');
            const updatedTrack = {
              ...trackForThisEffect,
              videoId: response.data.videoId,
              duration: response.data.duration
            };
            updateCurrentTrack(updatedTrack);
            setDuration(response.data.duration || 0);
          }
        } catch (err) {
          console.log(err);
        }
      }
    };

    if (currentTrack) {
      updateVideoId();
    }

    return () => {
      const lastPosition = latestPositionRef.current; // Vị trí cuối cùng của track cũ
      if (lastPosition === 0) return;
      console.log(`TRACK CHANGE CLEANUP: Saving ${trackForThisEffect?.name} at ${lastPosition}s`);
      handleSaveHistory(trackForThisEffect, lastPosition);
    };

  }, [currentTrack?.spotifyId]);

  // Khi đổi bài, xử lý tạm dừng và phát lại sau delay
  useEffect(() => {
    if (!currentTrack) return;

    setIsPlaying(false);
    let timeoutId = null;

    if (currentTrack?.videoId && duration) {
      setTimeout(() => {
        // --- Logic cho Khách ---
        if (isGuest) {
          console.log('logic guest')
          if (guestSongPlayCount < GUEST_SONG_PLAY_LIMIT) {
            console.log(
              `Khách: còn lượt (${guestSongPlayCount + 1
              }/${GUEST_SONG_PLAY_LIMIT}). Đang phát...`
            );

            incrementGuestSongPlayCount();
            timeoutId = setTimeout(async () => {
              try {
                if (playerRef.current && playbackPosition > 0) {
                  await playerRef.current.seekTo(playbackPosition, true);
                }
                setIsPlaying(true);
              } catch (err) {
                console.log("Delayed play error (Guest)", err);
              }
            }, 2000);
          } else {
            setShowLoginWall(true);
            console.log("Khách: Đã hết lượt. Kích hoạt Login Wall.");
          }
        } else {
          // --- Logic cho User đã đăng nhập ---
          console.log("User: Đã đăng nhập. Đang phát...");
          timeoutId = setTimeout(async () => {
            try {
              if (playerRef.current && playbackPosition > 0) {
                await playerRef.current.seekTo(playbackPosition, true);
              }
              setIsPlaying(true);
            } catch (err) {
              console.log("Delayed play error (User)", err);
            }
          }, 2000);
        }
      }, 1000)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentTrack?.spotifyId, currentTrack?.videoId]);

  useEffect(() => {
    if (seekTrigger && playerRef.current) {
      playerRef.current.seekTo(0, true);
    }
  }, [seekTrigger]);

  useEffect(() => {
    if (targetSeekMs != null && playerRef.current) {
      try {
        playerRef.current.seekTo(Math.max(0, (targetSeekMs || 0) / 1000), true);
      } catch (e) {
        console.log('seekTo error', e);
      } finally {
        setTargetSeekMs && setTargetSeekMs(null);
      }
    }
  }, [targetSeekMs]);

  useEffect(() => {
    historySavedRef.current = null;
  }, [currentTrack?.spotifyId]);

  useEffect(() => {
    const trackId = currentTrack?.spotifyId;
    if (trackId && playbackPosition > 15 && historySavedRef.current !== trackId) {
      historySavedRef.current = trackId;
      console.log(`Bài hát ${currentTrack.name} đã qua 15s. Đang lưu lịch sử...`);
      saveTrackToListeningHistory(currentTrack, playbackPosition);
    }
  }, [playbackPosition, currentTrack?.spotifyId]);

  if (!currentTrack) return null;
  if (!isVisible) return null;

  return (
    <YoutubePlayer
      ref={playerRef}
      height={0}
      videoId={"erBLE3XUvSs"}
      play={isPlaying}
      onChangeState={onPlayerStateChange}
      onReady={onPlayerReady}
    />
  );
}