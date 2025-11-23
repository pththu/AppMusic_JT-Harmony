import { GetAlbumsOfArtist, GetTopTracksOfArtist } from "@/services/musicService";
import useAuthStore from "@/store/authStore";
import { useFollowStore } from "@/store/followStore";
import { usePlayerStore } from "@/store/playerStore";
import { useCallback, useEffect, useState } from "react";

export const useArtistData = (currentArtist) => {

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const artistFollowed = useFollowStore((state) => state.artistFollowed);
  const setListTrack = usePlayerStore((state) => state.setListTrack);
  const setPopularTracks = useFollowStore((state) => state.setPopularTracks);
  const setAlbums = useFollowStore((state) => state.setAlbums);
  const setIsFollowing = useFollowStore((state) => state.setIsFollowing);

  const [artistOptionModalVisible, setArtistOptionModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState({
    topTracks: true,
    albums: true,
    following: false,
    screen: true,
  });

  const fetchAlbums = useCallback(async () => {
    try {
      const response = await GetAlbumsOfArtist(currentArtist.spotifyId);
      if (response.success === true) {
        setAlbums(response.data);
        setIsLoading((prev) => ({ ...prev, albums: false }));
      }
    } catch (err) {
      console.log('Error fetching albums:', err);
    }
  }, [currentArtist, setAlbums]);

  const fetchTopTracks = useCallback(async () => {
    try {
      const response = await GetTopTracksOfArtist(currentArtist.spotifyId);
      if (response.success === true) {
        setPopularTracks(response.data);
        setIsLoading((prev) => ({ ...prev, topTracks: false }));
        setListTrack(response.data);
      }
    } catch (err) {
      console.log('Error fetching top tracks:', err);
    }
  }, [currentArtist, setListTrack, setPopularTracks]);

  const checkIsFollowing = useCallback(() => {
    if (!currentArtist || !isLoggedIn) {
      setIsFollowing(false);
    }
    const artist = artistFollowed.find(a => a?.artistSpotifyId === currentArtist?.spotifyId);
    if (artist) {
      setIsFollowing(true);
      return;
    }
    setIsFollowing(false);
  }, [currentArtist?.spotifyId, isLoggedIn, artistFollowed]);

  useEffect(() => {
    setIsLoading((prev) => ({ ...prev, screen: true }));
    checkIsFollowing();
    fetchTopTracks();
    fetchAlbums();
    setIsLoading((prev) => ({ ...prev, screen: false }));
  }, [currentArtist, checkIsFollowing, fetchAlbums, fetchTopTracks]);

  useEffect(() => {
    checkIsFollowing();
  }, [artistFollowed, checkIsFollowing]);

  return {
    isLoading,
    artistOptionModalVisible,
    setArtistOptionModalVisible,
    setIsLoading,
    fetchAlbums,
    fetchTopTracks,
  }
}