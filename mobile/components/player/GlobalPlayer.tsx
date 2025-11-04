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

  const onPlayerReady = () => {
    if (playerRef.current && playbackPosition > 0) {
      playerRef.current.seekTo(playbackPosition, true);
    }
  };

  useEffect(() => {
    if (currentTrack && playerRef.current) {
      playerRef.current.seekTo(0, true);

      const timer = setTimeout(async () => {
        try {
          if (playerRef.current) {
            const duration = await playerRef.current.getDuration();
            if (typeof duration === "number") {
              setDuration(duration);
            }
          }
        } catch (error) {
          console.error("Lỗi khi lấy độ dài video Youtube:", error);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentTrack]);

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