import { GetFavoriteItemsGrouped } from "@/services/favoritesService";
import { GetArtistFollowed, GetFollowees, GetFollowers } from "@/services/followService";
import { GetListeningHistory, GetSearchHistory } from "@/services/historiesService";
import { GetMyPlaylists } from "@/services/musicService";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useFollowStore } from "@/store/followStore";
import { useHistoriesStore } from "@/store/historiesStore";
import { usePlayerStore } from "@/store/playerStore";
import { useCallback } from "react";

export const useAuthData = () => {
  const setListenHistory = useHistoriesStore((state) => state.setListenHistory);
  const setSearchHistory = useHistoriesStore((state) => state.setSearchHistory);
  const setFavoriteItems = useFavoritesStore((state) => state.setFavoriteItems);
  const setMyPlaylists = usePlayerStore((state) => state.setMyPlaylists);
  const setArtistFollowed = useFollowStore((state) => state.setArtistFollowed);
  const setFollowers = useFollowStore((state) => state.setFollowers);
  const setFollowees = useFollowStore((state) => state.setFollowees);

  const fetchHistory = useCallback(async (userId) => {
    const [responseListen, responseSearch] = await Promise.all([
      GetListeningHistory(userId),
      GetSearchHistory(userId)
    ]);
    if (responseSearch.success) {
      setSearchHistory(responseSearch.data);
    } else {
      setSearchHistory([]);
    }
    if (responseListen.success) {
      setListenHistory(responseListen.data);
    } else {
      setListenHistory([]);
    }
  }, []);

  const fetchFavoritesItem = useCallback(async (userId) => {
    try {
      const response = await GetFavoriteItemsGrouped(userId);
      if (response.success) {
        setFavoriteItems(response.data);
      }
    } catch (error) {
      console.log('errorr fetch favorites: ', error);
    }
  }, []);

  const fetchArtistFollowed = useCallback(async (userId) => {
    try {
      const response = await GetArtistFollowed(userId);
      if (response.success) {
        setArtistFollowed(response.data);
      }
    } catch (error) {
      console.log('error fetch follow artist', error);
    }
  }, []);

  const fetchMyPlaylists = useCallback(async (userId) => {
    try {
      const response = await GetMyPlaylists(userId);
      if (response.success) {
        setMyPlaylists(response.data);
      } else {
        setMyPlaylists([]);
      }
    } catch (error) {
      console.log("Lỗi khi lấy playlist của tôi:", error);
    }
  }, []);

  const fetchFollowers = useCallback(async (userId) => {
    try {
      const response = await GetFollowers(userId);
      if (response.success) {
        setFollowers(response.data);
      } else {
        setFollowers([]);
      }
    } catch (error) {
      console.log('Lỗi khi lấy danh sách followers: ', error);
    }
  }, []);


  const fetchFollowees = useCallback(async (userId) => {
    try {
      const response = await GetFollowees(userId);
      if (response.success) {
        setFollowees(response.data);
      } else {
        setFollowees([]);
      }
    } catch (error) {
      console.log('Lỗi khi lấy danh sách followees: ', error);
    }
  }, []);

  return {
    fetchHistory,
    fetchFavoritesItem,
    fetchArtistFollowed,
    fetchMyPlaylists,
    fetchFollowers,
    fetchFollowees
  }
}