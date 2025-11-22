import { GetTracksByAlbumId } from "@/services/musicService";
import useAuthStore from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { usePlayerStore } from "@/store/playerStore";
import { useCallback, useEffect, useState } from "react";

export const useAlbumData = (currentAlbum) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const favoriteItems = useFavoritesStore((state) => state.favoriteItems);
  const setListTrack = usePlayerStore((state) => state.setListTrack);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTracks = useCallback(async (album) => {
    if (!album) return setListTrack([]);
    setIsLoading(true);
    try {
      const response = await GetTracksByAlbumId(album?.spotifyId);
      if (response.success) {
        response.data?.map((track) => {
          track.imageUrl = album?.imageUrl;
        });
        setListTrack(response.data);
      }
    } catch (error) {
      setListTrack([]);
      console.log("Error fetching album tracks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setListTrack, currentAlbum?.spotifyId]);

  const checkIsFavorite = useCallback(() => {
    if (!currentAlbum || !isLoggedIn) {
      setIsFavorite(false);
      return;
    }

    const found = favoriteItems.some((item) => {
      if (item?.itemType === 'album') {
        return (
          (currentAlbum.id && (item.itemId === currentAlbum.id)) ||
          (currentAlbum.spotifyId && (item.itemSpotifyId === currentAlbum.spotifyId))
        );
      }
      return false;
    });
    setIsFavorite(found);
  }, [currentAlbum?.spotifyId, isLoggedIn, favoriteItems]);

  useEffect(() => {
    fetchTracks(currentAlbum);
    checkIsFavorite();
  }, [fetchTracks, currentAlbum?.spotifyId, checkIsFavorite]);

  useEffect(() => {
    checkIsFavorite();
  }, [favoriteItems, checkIsFavorite]);

  return {
    isFavorite,
    isLoading,
    isFavoriteLoading,
    setIsFavorite,
    setIsFavoriteLoading,
    fetchTracks,
  }
}