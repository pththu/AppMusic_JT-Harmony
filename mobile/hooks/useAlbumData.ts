import { GetTracksByAlbumId } from "@/services/musicService";
import useAuthStore from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { usePlayerStore } from "@/store/playerStore";
import { useCallback, useEffect, useRef, useState } from "react";

export const useAlbumData = (currentAlbum) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const favoriteItems = useFavoritesStore((state) => state.favoriteItems);

  // Lấy listTrack để kiểm tra dữ liệu hiện có
  const listTrack = usePlayerStore((state) => state.listTrack);
  const setListTrack = usePlayerStore((state) => state.setListTrack);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // QUAN TRỌNG: Chỉ loading nếu chưa có bài hát nào trong list
  const [isLoading, setIsLoading] = useState(!listTrack || listTrack.length === 0);

  // Ref để lưu ID album hiện tại, giúp chặn fetch trùng
  const currentAlbumIdRef = useRef(null);

  const fetchTracks = useCallback(async (album) => {
    if (!album) return;

    const albumId = album.spotifyId || album.id;

    // Chặn fetch nếu đã có data và ID trùng
    if (currentAlbumIdRef.current === albumId && listTrack && listTrack.length > 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    currentAlbumIdRef.current = albumId;

    try {
      const response = await GetTracksByAlbumId(albumId);
      if (response.success) {
        const tracksWithImage = response.data?.map((track) => ({
          ...track,
          imageUrl: album?.imageUrl
        }));
        setListTrack(tracksWithImage || []);
      } else {
        setListTrack([]);
      }
    } catch (error) {
      console.log("Error fetching album tracks:", error);
      setListTrack([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // ⚠️ Bỏ listTrack khỏi dependency

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
  }, [currentAlbum?.id, currentAlbum?.spotifyId, isLoggedIn, favoriteItems]);

  // Effect 1: Fetch Tracks (Chỉ chạy khi ID thay đổi)
  useEffect(() => {
    const albumId = currentAlbum?.id || currentAlbum?.spotifyId;

    // Nếu không có album hoặc ID vẫn trùng với ref -> Bỏ qua
    if (!currentAlbum || !albumId || albumId === currentAlbumIdRef.current) {
      return;
    }

    fetchTracks(currentAlbum);
  }, [currentAlbum?.id, currentAlbum?.spotifyId]);

  // Effect 2: Check Favorite
  useEffect(() => {
    checkIsFavorite();
  }, [favoriteItems, checkIsFavorite]);

  return {
    isFavorite,
    isLoading,
    isFavoriteLoading,
    setIsFavorite,
    setIsFavoriteLoading,
    setIsLoading,
    fetchTracks
  }
}