import { AddTrackToPlaylist, AddTrackToPlaylistAfterConfirm, GetTracksFromRecommend } from "@/services/musicService";
import { useBoardingStore } from "@/store/boardingStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { usePlayerStore } from "@/store/playerStore";
import { useCallback, useEffect, useState } from "react";
import { useCustomAlert } from "./useCustomAlert";

export const useAddTrackData = () => {

  const { error, confirm } = useCustomAlert();
  const favoritesItems = useFavoritesStore((state) => state.favoriteItems);
  const currentPlaylist = usePlayerStore((state) => state.currentPlaylist);
  const recommendBasedOnPlaylist = useBoardingStore((state) => state.recommendBasedOnPlaylist);
  const recommendTrackBasedOnFavorites = useBoardingStore((state) => state.recommendTrackBasedOnFavorites);
  const updateTotalTracksInCurrentPlaylist = usePlayerStore((state) => state.updateTotalTracksInCurrentPlaylist);
  const updateTotalTracksInMyPlaylists = usePlayerStore((state) => state.updateTotalTracksInMyPlaylists);
  const addTrackToPlaylist = usePlayerStore((state) => state.addTrackToPlaylist);

  const [recentData, setRecentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteData, setFavoriteData] = useState([]);
  const [recommendData, setRecommendData] = useState([]);

  const handleAddTrackAfterConfirm = async (track, payload) => {
    const removeTrackFromState = (setStateFunc, trackIdToRemove) => {
      setStateFunc(prevData => {
        if (!prevData) return [];
        return prevData.filter(t => t.spotifyId !== trackIdToRemove);
      });
    };
    removeTrackFromState(setRecentData, track.spotifyId);
    removeTrackFromState(setFavoriteData, track.spotifyId);
    removeTrackFromState(setRecommendData, track.spotifyId);

    const confirmResponse = await AddTrackToPlaylistAfterConfirm(payload);
    if (confirmResponse.success) {
      updateTotalTracksInCurrentPlaylist(1);
      updateTotalTracksInMyPlaylists(currentPlaylist.id, 1);
      addTrackToPlaylist(confirmResponse.data);
    } else {
      error('Lỗi', 'Không thể thêm bài hát vào danh sách phát.');
    }
  }

  const handleAddTrack = async (track) => {
    console.log(`Đã thêm bài hát: ${track.name}`);
    try {
      const payload = {
        playlistId: currentPlaylist?.id,
        trackId: track?.id || null,
        trackSpotifyId: track?.spotifyId,
      }
      const removeTrackFromState = (setStateFunc, trackIdToRemove) => {
        setStateFunc(prevData => {
          if (!prevData) return [];
          return prevData.filter(t => t.spotifyId !== trackIdToRemove);
        });
      };

      removeTrackFromState(setRecentData, track.spotifyId);
      removeTrackFromState(setFavoriteData, track.spotifyId);
      removeTrackFromState(setRecommendData, track.spotifyId);



      const response = await AddTrackToPlaylist(payload);
      if (response.success) {
        addTrackToPlaylist(response.data);
        console.log(`Thêm bài hát ${track.name} thành công.`);
        updateTotalTracksInCurrentPlaylist(1);
        updateTotalTracksInMyPlaylists(currentPlaylist.id, 1);
      } else {
        if (response.isExisting) {
          confirm(
            'Bài hát đã tồn tại',
            response.message,
            () => handleAddTrackAfterConfirm(track, payload),
            () => { }
          )
        }
      }
    } catch (err) {
      console.error(err);
      error('Lỗi', 'Không thể thêm bài hát vào danh sách phát.');
    }
  };

  const fetchDataFavorite = useCallback(async () => {
    try {
      if (favoritesItems.length > 0) {
        for (const item of favoritesItems) {
          if (item.itemType === 'track') {
            const track = item.item;
            setFavoriteData((prevData) => [...prevData, track]);
          }
        }
      }
    } catch (error) {
      console.log('error fetch favorite data', error);
    }
  }, [favoritesItems]);

  const fetchDataFromRecommend = useCallback(async () => {
    try {
      setIsLoading(true);
      const formatDataRecommendBasedOnPlaylist = recommendBasedOnPlaylist.map((item) => ({ name: item.name, artists: item.artists }));
      const formatDataRecommendTrackBasedOnFavorites = recommendTrackBasedOnFavorites.map((item) => ({ name: item.name, artists: item.artists }));

      const payload = {
        recommendBaseOnPlaylist: formatDataRecommendBasedOnPlaylist,
        recommendBaseOnFavorites: formatDataRecommendTrackBasedOnFavorites
      };

      const response = await GetTracksFromRecommend(payload);
      if (response.success) {
        setRecentData(response.data.dataBaseOnPlaylist);
        setRecommendData(response.data.dataBaseOnFavorites);
      } else {
        setFavoriteData([]);
        setRecommendData([]);
      }
    } catch (error) {
      console.log('error fetch data from recommend', error);
    } finally {
      setIsLoading(false);
    }

  }, [recommendBasedOnPlaylist, recommendTrackBasedOnFavorites]);

  useEffect(() => {
    setIsLoading(true);
    fetchDataFavorite();
    fetchDataFromRecommend();
    setIsLoading(false);
  }, [currentPlaylist?.id]);

  return {
    isLoading,
    recentData,
    favoriteData,
    recommendData,
    setFavoriteData,
    setRecentData,
    setRecommendData,
    setIsLoading,
    handleAddTrack
  }
};