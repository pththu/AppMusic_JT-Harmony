import { GetTracksByPlaylistId } from "@/services/musicService";
import useAuthStore from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { usePlayerStore } from "@/store/playerStore";
import { useCallback, useEffect, useState } from "react";

export const usePlaylistData = (currentPlaylist) => {

  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const favoriteItems = useFavoritesStore((state) => state.favoriteItems);
  const setListTrack = usePlayerStore((state) => state.setListTrack);

  const [playlist, setPlaylist] = useState(currentPlaylist);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isMine, setIsMine] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchTracks = useCallback(async (playlist) => {
    if (!playlist) return setListTrack([]);

    setIsLoading(true);
    const type = playlist.spotifyId ? 'api' : 'local';
    const playlistId = playlist.spotifyId || playlist.id;

    try {
      const response = await GetTracksByPlaylistId({
        playlistId: playlistId,
        type: type
      });

      if (response.success) {
        setListTrack(response.data);
      } else {
        setListTrack([]);
      }
    } catch (e) {
      console.error('Error fetching tracks:', e);
      setListTrack([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPlaylist, setListTrack]);

  const checkIsFavorite = useCallback(() => {
    if (!currentPlaylist || !isLoggedIn) {
      setIsFavorite(false);
      return;
    }

    const found = favoriteItems.some((item) => {
      if (item?.itemType === 'playlist') {
        return (
          (currentPlaylist.id && (item.itemId === currentPlaylist.id)) ||
          (currentPlaylist.spotifyId && (item.itemSpotifyId === currentPlaylist.spotifyId))
        );
      }
      return false;
    });
    setIsFavorite(found);
  }, [currentPlaylist, isLoggedIn, favoriteItems]);

  const checkIsMine = useCallback(() => {
    if (!currentPlaylist || !user?.id) return false;
    return currentPlaylist.owner?.id === user.id || currentPlaylist.userId === user.id;
  }, [currentPlaylist, user?.id]);

  useEffect(() => {
    setPlaylist(currentPlaylist);
    setIsMine(checkIsMine());
    fetchTracks(currentPlaylist);
    checkIsFavorite();
  }, [currentPlaylist, checkIsMine, fetchTracks, checkIsFavorite]);

  useEffect(() => {
    checkIsFavorite();
  }, [favoriteItems, checkIsFavorite]);

  return {
    // Data State
    playlist,
    isLoading,
    isMine,
    isFavorite,
    isFavoriteLoading,
    modalVisible,

    // Actions
    setModalVisible,
    setIsFavoriteLoading,
    setIsFavorite,
    fetchTracks,
  };
}