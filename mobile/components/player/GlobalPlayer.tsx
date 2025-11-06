// components/player/GlobalPlayer.js
import React, { useEffect, useRef, useState } from "react";
import YoutubePlayer from "react-native-youtube-iframe";
import { usePlayerStore } from "@/store/playerStore";
import { GetVideoId } from "@/services/musicService";

export default function GlobalPlayer() {
  const playerRef = useRef(null);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playbackPosition = usePlayerStore((state) => state.playbackPosition);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const isLastIndex = usePlayerStore((state) => state.isLastIndex);
  const seekTrigger = usePlayerStore((state) => state.seekTrigger);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const playNext = usePlayerStore((state) => state.playNext);
  const setPlaybackPosition = usePlayerStore((state) => state.setPlaybackPosition);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const updateCurrentTrack = usePlayerStore((state) => state.updateCurrentTrack);

  const [videoIdTemp, setVideoIdTemp] = useState('');

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
  }, [isPlaying, setPlaybackPosition]);

  useEffect(() => {
    console.log('currentTrack global: ', currentTrack);

    const updateVideoId = async () => {
      if (!currentTrack.videoId) {
        console.log('Đang tìm video id')
        try {
          const response = await GetVideoId(currentTrack.spotifyId);
          console.log('response ui: ', response)
          if (response.success) {
            currentTrack.videoId = response.data;
            console.log(response.data)
            updateCurrentTrack(currentTrack)
            setVideoIdTemp(videoIdTemp);
            return true;
          }
        } catch (err) {
          console.log(err)
          return false;
        }
      }
      return false;
    }
    const isVideoIdUpdated = updateVideoId();
    console.log(currentTrack)

    if (currentTrack && isVideoIdUpdated && playerRef.current) {
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
            console.log(retries, "đang lấy duration")
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
  }, [currentTrack]);

  useEffect(() => {
    if (seekTrigger && playerRef.current) {
      playerRef.current.seekTo(0, true);
    }
  }, [seekTrigger]);

  if (!currentTrack) {
    return null;
  }

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