import { GetTracksByPlaylistId } from "@/services/musicService";
import { GenerateFromPlaylist } from "@/services/recommendationService";
import useAuthStore from "@/store/authStore";
import { useBoardingStore } from "@/store/boardingStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { usePlayerStore } from "@/store/playerStore";
import { useCallback, useEffect, useRef, useState } from "react";

export const usePlaylistData = (currentPlaylist) => {

  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const listTrack = usePlayerStore((state) => state.listTrack);
  const favoriteItems = useFavoritesStore((state) => state.favoriteItems);
  const setListTrack = usePlayerStore((state) => state.setListTrack);
  const setRecommendBasedOnPlaylist = useBoardingStore((state) => state.setRecommendBasedOnPlaylist);

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
      console.log('Error fetching tracks:', e);
      setListTrack([]);
    } finally {
      setIsLoading(false);
    }
  }, [setListTrack]);

  const currentPlaylistIdRef = useRef(null);

  const fetchRecommendBasedOnPlaylist = useCallback(async () => {
    if (!currentPlaylist || !isLoggedIn) return;
    if (currentPlaylist?.id && currentPlaylist?.owner?.id !== user?.id) return;
    const payload = {
      playlistDetails: {
        name: currentPlaylist?.name,
        description: currentPlaylist?.description,
      },
      playlistTracks: listTrack.map((track) => ({
        name: track?.name,
        artists: track?.artists.map(artist => artist?.name),
      }))
    };
    const response = await GenerateFromPlaylist(payload);
    if (response.success) {
      setRecommendBasedOnPlaylist(response.data || []);
    } else {
      setRecommendBasedOnPlaylist([]);
    }
  }, []);

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
    const playlistId = currentPlaylist?.id || currentPlaylist?.spotifyId;

    // ⚠️ Chỉ fetch khi ID thay đổi
    if (playlistId !== currentPlaylistIdRef.current) {
      currentPlaylistIdRef.current = playlistId;
      setPlaylist(currentPlaylist);
      setIsMine(checkIsMine());
      fetchTracks(currentPlaylist);
      checkIsFavorite();

      if (currentPlaylist?.id && currentPlaylist?.owner?.id === user?.id) {
        fetchRecommendBasedOnPlaylist();
      }
    }
  }, [currentPlaylist?.id, currentPlaylist?.spotifyId]);

  useEffect(() => {
    checkIsFavorite();
  }, [favoriteItems, checkIsFavorite]);

  return {
    // Data State
    playlist,
    listTrack,
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