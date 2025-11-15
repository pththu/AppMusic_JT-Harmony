// components/player/GlobalPlayer.js
import React, { useEffect, useRef, useState } from "react";
import YoutubePlayer from "react-native-youtube-iframe";
import { usePlayerStore } from "@/store/playerStore";
import { GetVideoId } from "@/services/musicService";
import { SaveToListeningHistory } from "@/services/historiesService";
import { AppState } from "react-native";

export default function GlobalPlayer() {
  const playerRef = useRef(null);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playbackPosition = usePlayerStore((state) => state.playbackPosition);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const isLastIndex = usePlayerStore((state) => state.isLastIndex);
  const seekTrigger = usePlayerStore((state) => state.seekTrigger);
  const targetSeekMs = usePlayerStore((state) => state.targetSeekMs); // Bình luận theo mốc thời gian
  const uiOverlayOpen = usePlayerStore((state) => state.uiOverlayOpen); // tránh giật khi mở TrackCommentsModal
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const playNext = usePlayerStore((state) => state.playNext);
  const setPlaybackPosition = usePlayerStore((state) => state.setPlaybackPosition);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const updateCurrentTrack = usePlayerStore((state) => state.updateCurrentTrack);
  const setTargetSeekMs = usePlayerStore((state) => state.setTargetSeekMs);

  const appState = useRef(AppState.currentState);
  const [videoIdTemp, setVideoIdTemp] = useState('');

  const latestPositionRef = useRef(0);
  useEffect(() => {
    latestPositionRef.current = playbackPosition;
  }, [playbackPosition]);

  const handleSaveHistory = (track, durationInSeconds) => {
    if (!track) return;
    const durationMs = durationInSeconds * 1000; // Chuyển sang mili-giây

    // Chỉ lưu nếu đã nghe > 15 giây
    if (durationMs > 15000) {
      console.log(`SAVING HISTORY: ${track.name} at ${durationMs}ms`);
      // "Fire-and-forget" - Chạy ngầm, không cần await
      SaveToListeningHistory({
        itemType: 'track',
        itemId: track?.id,
        itemSpotifyId: track?.spotifyId,
        durationListened: durationMs
      }).catch(err => console.error("SaveToListeningHistory failed:", err));
    } else {
      console.log(`NOT SAVING: ${track.name} - duration ${durationMs}ms <= 15000ms`);
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
        // Lấy tổng thời lượng bài hát
        const duration = await playerRef.current?.getDuration();
        // Lưu lại trước khi chuyển bài
        handleSaveHistory(latestState.currentTrack, duration || latestState.playbackPosition);
      } catch (e) {
        console.log("Lỗi khi lấy duration lúc 'ended'", e);
        // Fallback: lưu vị trí cuối cùng biết được
        handleSaveHistory(latestState.currentTrack, latestState.playbackPosition);
      }

      if (repeatMode === "one") {
        playerRef.current?.seekTo(0, true);
        return;
      } else if (repeatMode === "none") {
        latestState.playNext();
        if (isLastIndex) {
          togglePlayPause();
        }
      } else if (repeatMode === "all") {
        latestState.playNext();
      }
    }
    else if (state === "paused") {
      try {
        const currentTime = await playerRef.current?.getCurrentTime();
        if (currentTime) {
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
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, uiOverlayOpen, setPlaybackPosition]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (
        appState.current.match(/active/) && // Nếu app đang active
        nextAppState.match(/inactive|background/) // Và sắp bị inactive/background
      ) {
        if (playerRef.current && isPlaying) {
          try {
            // const currentTime = await playerRef.current.getCurrentTime();
            // setPlaybackPosition(currentTime); // Lưu vị trí lại
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
  }, [isPlaying, setIsPlaying]);

  // useEffect(() => {
  //   const trackForThisEffect = currentTrack;
  //   console.log('currentTrack global: ', currentTrack);
  //   const updateVideoId = async () => {
  //     if (!currentTrack?.videoId) {
  //       console.log('Đang tìm video id')
  //       try {
  //         const response = await GetVideoId(currentTrack?.spotifyId);
  //         console.log('response ui: ', response)
  //         if (response.success) {
  //           currentTrack.videoId = response.data;
  //           console.log(response.data)
  //           updateCurrentTrack(currentTrack)
  //           setVideoIdTemp(response.data);
  //           return true;
  //         }
  //         console.log('aaaaaaaaa')
  //       } catch (err) {
  //         console.log(err)
  //         return false;
  //       }
  //     } else {
  //       setVideoIdTemp(currentTrack?.videoId);
  //     }
  //     return false;
  //   }
  //   if (currentTrack) {
  //     updateVideoId();
  //   }

  //   if (currentTrack && videoIdTemp && playerRef.current) {
  //     playerRef.current.seekTo(0, true);
  //     setDuration(0);
  //     let intervalId = null;
  //     let retries = 0;
  //     const maxRetries = 10;
  //     const pollInterval = 500;
  //     setDuration(currentTrack?.duration * 0.001)

  //     const tryGetDuration = async () => {
  //       if (!playerRef.current) {
  //         console.log('lỗi trình phát')
  //         if (intervalId) clearInterval(intervalId);
  //         return;
  //       }

  //       try {
  //         const duration = await playerRef.current.getDuration();
  //         if (typeof duration === "number" && duration > 0) {
  //           console.log(retries, "đã lấy duration", duration)
  //           setDuration(duration);
  //           if (intervalId) clearInterval(intervalId);
  //         } else {
  //           retries++;
  //           if (retries >= maxRetries) {
  //             console.log("Không thể lấy duration video sau", maxRetries, "lần thử.");
  //             setDuration(currentTrack.duration * 0.001);
  //             if (intervalId) clearInterval(intervalId);
  //           }
  //         }
  //       } catch (error) {
  //         console.log("Lỗi khi gọi getDuration():", error);
  //         retries++;
  //         if (retries >= maxRetries) {
  //           if (intervalId) clearInterval(intervalId);
  //         }
  //       }
  //     };

  //     intervalId = setInterval(tryGetDuration, pollInterval);

  //     return () => {
  //       if (intervalId) {
  //         clearInterval(intervalId);
  //       }
  //     };
  //   }
  // }, [currentTrack]);

  /**
   * 'currentTrack' trong closure này là track SẮP PHÁT
   * latestPositionRef.current' LÚC NÀY vẫn là của track CŨ
   * trước khi logic tìm videoId chạy)
   * 'usePlayerStore.getState().currentTrack' LÚC NÀY cũng là track MỚI
   */
  useEffect(() => {
    // Biến này lưu lại track của lần render này
    const trackForThisEffect = currentTrack;
    const updateVideoId = async () => {
      if (!currentTrack?.videoId) {
        console.log('Đang tìm video id')
        try {
          const response = await GetVideoId(currentTrack?.spotifyId);
          console.log('response ui: ', response)
          if (response.success) {
            currentTrack.videoId = response.data;
            console.log(response.data)
            updateCurrentTrack(currentTrack)
            setVideoIdTemp(response.data);
            return true;
          }
          console.log('aaaaaaaaa')
        } catch (err) {
          console.log(err)
          return false;
        }
      } else {
        setVideoIdTemp(currentTrack?.videoId);
      }
      return false;
    }

    if (currentTrack) updateVideoId();

    if (currentTrack && videoIdTemp && playerRef.current) {
      playerRef.current.seekTo(0, true);
      setDuration(0);
      let intervalId = null;
      let retries = 0;
      const maxRetries = 10;
      const pollInterval = 500;
      setDuration(currentTrack?.duration * 0.001)

      const tryGetDuration = async () => {
        if (!playerRef.current) {
          console.log('lỗi trình phát')
          if (intervalId) clearInterval(intervalId);
          return;
        }

        try {
          const duration = await playerRef.current.getDuration();
          if (typeof duration === "number" && duration > 0) {
            console.log(retries, "đã lấy duration", duration)
            setDuration(duration);
            if (intervalId) clearInterval(intervalId);
          } else {
            retries++;
            if (retries >= maxRetries) {
              console.log("Không thể lấy duration video sau", maxRetries, "lần thử.");
              setDuration(currentTrack.duration * 0.001);
              if (intervalId) clearInterval(intervalId);
            }
          }
        } catch (error) {
          console.log("Lỗi khi gọi getDuration():", error);
          retries++;
          if (retries >= maxRetries) {
            if (intervalId) clearInterval(intervalId);
          }
        }
      };

      intervalId = setInterval(tryGetDuration, pollInterval);

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }

    return () => {
      const lastPosition = latestPositionRef.current; // Vị trí cuối cùng của track cũ
      if (lastPosition === 0) return;
      console.log(`TRACK CHANGE CLEANUP: Saving ${trackForThisEffect?.name} at ${lastPosition}s`);
      handleSaveHistory(trackForThisEffect, lastPosition);
    };
  }, [currentTrack]);

  useEffect(() => {
    if (!currentTrack) return;
    // Tạm pause player
    setIsPlaying(false);
    let timeout = setTimeout(async () => {
      try {
        if (playerRef.current && playbackPosition > 0) {
          await playerRef.current.seekTo(playbackPosition, true);
        }
        setIsPlaying(true);
      } catch (err) {
        console.log("Delayed play error", err);
      }
    }, 1800);

    return () => clearTimeout(timeout);
  }, [currentTrack?.spotifyId]);

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

  if (!currentTrack) return null;

  return (
    <YoutubePlayer
      ref={playerRef}
      height={0}
      videoId={currentTrack?.videoId || videoIdTemp}
      play={isPlaying}
      onChangeState={onPlayerStateChange}
      onReady={onPlayerReady}
    />
  );
}