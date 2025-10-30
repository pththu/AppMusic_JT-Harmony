// components/player/GlobalPlayer.js
import React, { useRef } from "react";
import YoutubePlayer from "react-native-youtube-iframe";
import { usePlayerStore } from "@/store/playerStore";

export default function GlobalPlayer() {
  const playerRef = useRef(null);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playbackPosition = usePlayerStore((state) => state.playbackPosition);
  const playNext = usePlayerStore((state) => state.playNext);
  const setPlaybackPosition = usePlayerStore((state) => state.setPlaybackPosition);

  const onPlayerReady = () => {
    if (playerRef.current && playbackPosition > 0) {
      playerRef.current.seekTo(playbackPosition, true);
    }
  };

  const onPlayerStateChange = async (state) => {
    const latestState = usePlayerStore.getState();

    if (state === "ended") {
      latestState.playNext();
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

  if (!currentTrack || !currentTrack.videoId) {
    return null;
  }

  return (
    <YoutubePlayer
      ref={playerRef}
      height={0}
      videoId={currentTrack.videoId}
      play={isPlaying}
      onChangeState={onPlayerStateChange}
      onReady={onPlayerReady}
    />
  );
}