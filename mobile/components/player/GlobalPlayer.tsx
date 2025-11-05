// components/player/GlobalPlayer.js
import React, { useEffect, useRef } from "react";
import YoutubePlayer from "react-native-youtube-iframe";
import { usePlayerStore } from "@/store/playerStore";

export default function GlobalPlayer() {
  const playerRef = useRef(null);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playbackPosition = usePlayerStore((state) => state.playbackPosition);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const isLastIndex = usePlayerStore((state) => state.isLastIndex);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const playNext = usePlayerStore((state) => state.playNext);
  const setPlaybackPosition = usePlayerStore((state) => state.setPlaybackPosition);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const seekTrigger = usePlayerStore((state) => state.seekTrigger);

  const onPlayerReady = () => {
    if (playerRef.current && playbackPosition > 0) {
      playerRef.current.seekTo(playbackPosition, true);
    }
  };


  const onPlayerStateChange = async (state) => {
    const latestState = usePlayerStore.getState();

    if (state === "ended") {
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
        }
      } catch (error) {
        console.error("Lỗi khi lấy thời gian Youtube:", error);
      }
    }
  };

  useEffect(() => {
    let intervalId = null;

    if (isPlaying) {
      // Bắt đầu một interval chạy mỗi giây khi nhạc đang phát
      intervalId = setInterval(async () => {
        if (playerRef.current) {
          try {
            // Lấy thời gian hiện tại từ YouTube player
            const currentTime = await playerRef.current.getCurrentTime();
            // Cập nhật vào store
            setPlaybackPosition(currentTime);
          } catch (error) {
            // Bỏ qua lỗi nếu player chưa sẵn sàng
          }
        }
      }, 1000); // 1000ms = 1 giây
    } else {
      // Nếu nhấn pause (isPlaying = false), xóa interval
      if (intervalId) {
        clearInterval(intervalId);
      }
    }

    // Hàm cleanup: Sẽ chạy khi [isPlaying] thay đổi hoặc component unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, setPlaybackPosition]);

  useEffect(() => {
    if (currentTrack && playerRef.current) {

      playerRef.current.seekTo(0, true);
      setDuration(0);

      let intervalId = null;
      let retries = 0;
      const maxRetries = 10;
      const pollInterval = 500;

      const tryGetDuration = async () => {
        if (!playerRef.current) {
          if (intervalId) clearInterval(intervalId);
          return;
        }

        try {
          const duration = await playerRef.current.getDuration();
          if (typeof duration === "number" && duration > 0) {
            setDuration(duration);
            if (intervalId) clearInterval(intervalId);
          } else {
            retries++;
            if (retries >= maxRetries) {
              console.error("Không thể lấy duration video sau", maxRetries, "lần thử.");
              if (intervalId) clearInterval(intervalId);
            }
          }
        } catch (error) {
          console.error("Lỗi khi gọi getDuration():", error);
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
  }, [currentTrack]);

  // useEffect(() => {
  //   if (currentTrack && playerRef.current) {
  //     playerRef.current.seekTo(0, true);

  //     const timer = setTimeout(async () => {
  //       try {
  //         if (playerRef.current) {
  //           const duration = await playerRef.current.getDuration();
  //           if (typeof duration === "number") {
  //             setDuration(duration);
  //           }
  //         }
  //       } catch (error) {
  //         console.error("Lỗi khi lấy độ dài video Youtube:", error);
  //       }
  //     }, 500);

  //     return () => clearTimeout(timer);
  //   }
  // }, [currentTrack]);

  useEffect(() => {
    // Khi seekTrigger thay đổi (và không phải là null)
    // có nghĩa là store yêu cầu tua lại
    if (seekTrigger && playerRef.current) {
      playerRef.current.seekTo(0, true);
    }
  }, [seekTrigger]);

  if (!currentTrack) {
    return null;
  }

  if (!currentTrack.videoId) {
    console.log("tìm video Id ở đây")
  }

  return (
    <YoutubePlayer
      ref={playerRef}
      height={0}
      videoId={currentTrack?.videoId || 'wSmXeHBOX0U'}
      play={isPlaying}
      onChangeState={onPlayerStateChange}
      onReady={onPlayerReady}
    />
  );
}