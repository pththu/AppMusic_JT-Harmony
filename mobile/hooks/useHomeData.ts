import { useState, useCallback, useEffect } from "react";
import { GetAlbumsForYou, GetArtistsForYou, GetPlaylistsForYou } from "@/services/musicService";
import { SearchTracks } from "@/services/searchService";
import { shuffleData } from "@/utils/array"; // Cần import shuffleData từ utils
import { GenerateFromActivity, GenerateFromFavorites, GenerateFromFollowedArtists, GenerateFromHistories, GenerateFromMood, GenerateFromTimeOfDay } from "@/services/recommendationService";
import { useBoardingStore } from "@/store/boardingStore"; // Cần dùng store để set recommendations

interface QueryParams {
  playlistForYou: string[];
  albumForYou: string[];
  playlistTrending: string[];
  albumTrending: string[];
  artistNames: string[];
  genres: string[];
}

export const useHomeData = (
  queryParam: QueryParams,
  formattedListenHistory: any[],
  formattedFavoriteItems: any[],
  formattedArtistFollowed: any[],
  selectedActivity: any,
  selectedMood: any,
) => {
  const [dataForYou, setDataForYou] = useState({
    playlistsForYou: [],
    albumsForYou: [],
    playlistsTrending: [],
    albumsTrending: [],
    artistsForYou: [],
  });

  const [dataRecommendations, setDataRecommendations] = useState({
    baseOnHistory: [],
    baseOnMoods: [],
    baseOnActivities: [],
    baseOnTimeOfDay: [],
    baseOnFavoriteItems: [],
    baseOnFollowedArtists: [],
  });

  const [isLoading, setIsLoading] = useState({
    playlistForYou: true,
    albumsForYou: true,
    playlistTrending: true,
    albumsTrending: true,
    artistsForYou: true,
    baseOnHistory: true,
    baseOnMoods: true,
    baseOnActivities: true,
    baseOnTimeOfDay: true,
    baseOnFavoriteItems: true,
    baseOnFollowedArtists: true,
  });

  // recommend store -> gợi ý
  const setRecommendBasedOnActivity = useBoardingStore((state) => state.setRecommendBasedOnActivity);
  const setRecommendBasedOnMood = useBoardingStore((state) => state.setRecommendBasedOnMood);
  const setRecommendBasedOnFollowedArtists = useBoardingStore((state) => state.setRecommendBasedOnFollowedArtists);
  const setRecommendBasedOnFavorites = useBoardingStore((state) => state.setRecommendBasedOnFavorites);
  const setRecommendBasedOnHistories = useBoardingStore((state) => state.setRecommendBasedOnHistories);
  const setRecommendBasedOnTimeOfDay = useBoardingStore((state) => state.setRecommendBasedOnTimeOfDay);

  // fetch data recommend
  const fetchGenericRecommendation = useCallback(async (dataItems, keyStateName, setRecommendStore) => {
    if (!dataItems || dataItems.length === 0) {
      setIsLoading(prev => ({ ...prev, [keyStateName]: false }));
      return;
    }

    let groups = { artistNames: [], playlistNames: [], albumNames: [], genres: [], trackName: null };
    for (let item of dataItems) {
      const itemType = item.type;
      switch (itemType) {
        case 'playlist': groups.playlistNames.push(item.query); break;
        case 'album': groups.albumNames.push(item.query); break;
        case 'artist': groups.artistNames.push(item.query); break;
        case 'track': groups.trackName = item.query; break;
        case 'genre': groups.genres.push(item.query); break;
      }
    }

    try {
      const [resPlaylist, resAlbum, resArtist, resTrack] = await Promise.all([
        groups.playlistNames.length > 0 ? GetPlaylistsForYou(groups.playlistNames) : null,
        groups.albumNames.length > 0 ? GetAlbumsForYou(groups.albumNames) : null,
        groups.artistNames.length > 0 ? GetArtistsForYou({ artistNames: groups.artistNames, genres: groups.genres }) : null,
        groups.trackName ? SearchTracks({ trackName: groups.trackName, limit: 5 }) : null,
      ]);

      let result = [];
      if (resPlaylist?.success) result = [...result, ...resPlaylist.data];
      if (resAlbum?.success) result = [...result, ...resAlbum.data];
      if (resArtist?.success) result = [...result, ...resArtist.data];
      if (resTrack?.success) {
        const tracks = resTrack.data.map((track) => ({ ...track, type: 'track' }));
        result = [...result, ...tracks];
      }

      if (result.length > 0) {
        setRecommendStore(shuffleData(dataItems));
        setDataRecommendations(prev => ({
          ...prev,
          [keyStateName]: shuffleData(result)
        }));
      }
    } catch (e) {
      console.log(`Error fetching ${keyStateName}`, e);
    } finally {
      setIsLoading(prev => ({ ...prev, [keyStateName]: false }));
    }
  }, [
    setRecommendBasedOnActivity,
    setRecommendBasedOnMood,
    setRecommendBasedOnFollowedArtists,
    setRecommendBasedOnFavorites,
    setRecommendBasedOnHistories,
    setRecommendBasedOnTimeOfDay,
  ]);

  // --- HÀM FETCH DỮ LIỆU CỐ ĐỊNH (FOR YOU, TRENDING) ---
  const fetchPlaylistsForYou = useCallback(async () => {
    try {
      const response = await GetPlaylistsForYou(queryParam.playlistForYou);
      if (response.success) {
        setDataForYou((prev) => ({
          ...prev,
          playlistsForYou: response.data
        }));
        setIsLoading((prev) => ({ ...prev, playlistForYou: false }));
      }
    } catch (error) {
      console.log('Error fetching playlists: ', error);
    }
  }, [queryParam.playlistForYou]);

  const fetchAlbumsForYou = useCallback(async () => {
    try {
      const response = await GetAlbumsForYou(queryParam.albumForYou);

      if (response.success) {
        setDataForYou((prev) => ({
          ...prev,
          albumsForYou: response.data
        }));
        setIsLoading((prev) => ({ ...prev, albumsForYou: false }));
      }
    } catch (error) {
      console.log('Error fetching albums: ', error);
    }
  }, [queryParam.albumForYou]);

  const fetchTrendingPlaylists = useCallback(async () => {
    try {
      const response = await GetPlaylistsForYou(queryParam.playlistTrending);
      if (response.success) {
        setDataForYou((prev) => ({
          ...prev,
          playlistsTrending: response.data
        }));
        setIsLoading((prev) => ({ ...prev, playlistTrending: false }));
      }
    } catch (error) {
      console.log('Error fetching trending playlists: ', error);
    }
  }, [queryParam.playlistTrending]);

  const fetchTrendingAlbums = useCallback(async () => {
    try {
      const response = await GetAlbumsForYou(queryParam.albumTrending);
      if (response.success) {
        setDataForYou((prev) => ({
          ...prev,
          albumsTrending: response.data
        }));
        setIsLoading((prev) => ({ ...prev, albumsTrending: false }));
      }
    } catch (error) {
      console.log('Error fetching trending albums: ', error);
    }
  }, [queryParam.albumTrending]);

  const fetchArtistsForYou = useCallback(async () => {
    try {
      const response = await GetArtistsForYou({
        artistNames: queryParam.artistNames,
        genres: queryParam.genres
      });
      if (response.success) {
        setDataForYou((prev) => ({
          ...prev,
          artistsForYou: response.data
        }));
        setIsLoading((prev) => ({ ...prev, artistsForYou: false }));
      }
    } catch (error) {
      console.log('Error fetching artists: ', error);
    }
  }, [queryParam.artistNames, queryParam.genres]);

  // (Thêm fetchTrendingPlaylists, fetchTrendingAlbums, fetchArtistsForYou tương tự ở đây...)

  // --- EFFECT: TẢI DỮ LIỆU CỐ ĐỊNH VÀ THỜI GIAN ---
  useEffect(() => {
    const fetchBaseData = async () => {
      await Promise.all([
        fetchPlaylistsForYou(),
        fetchAlbumsForYou(),
        fetchTrendingPlaylists(),
        fetchTrendingAlbums(),
        fetchArtistsForYou()
      ]);
      GenerateFromTimeOfDay().then(response => {
        if (response.success) {
          fetchGenericRecommendation(response.data, 'baseOnTimeOfDay', setRecommendBasedOnTimeOfDay);
        }
      })
    };
    fetchBaseData();
  }, [fetchPlaylistsForYou, fetchAlbumsForYou, fetchGenericRecommendation, setRecommendBasedOnTimeOfDay]);


  // --- EFFECT: GỢI Ý THEO LỊCH SỬ ---
  useEffect(() => {
    if (formattedListenHistory.length > 0) {
      GenerateFromHistories(formattedListenHistory).then(response => {
        if (response.success) {
          fetchGenericRecommendation(response.data, 'baseOnHistory', setRecommendBasedOnHistories);
        } else {
          setIsLoading(prev => ({ ...prev, baseOnHistory: false }));
        }
      });
    } else {
      setIsLoading(prev => ({ ...prev, baseOnHistory: false }));
    }
  }, [formattedListenHistory, fetchGenericRecommendation, setRecommendBasedOnHistories]);

  // --- EFFECT: GỢI Ý THEO FAVORITES ---
  useEffect(() => {
    if (formattedFavoriteItems.length > 0) {
      GenerateFromFavorites(formattedFavoriteItems).then(response => {
        if (response.success) {
          fetchGenericRecommendation(response.data, 'baseOnFavoriteItems', setRecommendBasedOnFavorites);
        } else {
          setIsLoading(prev => ({ ...prev, baseOnFavoriteItems: false }));
        }
      });
    } else {
      setIsLoading(prev => ({ ...prev, baseOnFavoriteItems: false }));
    }
  }, [formattedFavoriteItems, fetchGenericRecommendation, setRecommendBasedOnFavorites]);

  // --- EFFECT: GỢI Ý THEO ARTIST FOLLOWED ---
  useEffect(() => {
    if (formattedArtistFollowed.length > 0) {
      GenerateFromFollowedArtists(formattedArtistFollowed).then(response => {
        if (response.success) {
          fetchGenericRecommendation(response.data, 'baseOnFollowedArtists', setRecommendBasedOnFollowedArtists);
        } else {
          setIsLoading(prev => ({ ...prev, baseOnFollowedArtists: false }));
        }
      });
    } else {
      setIsLoading(prev => ({ ...prev, baseOnFollowedArtists: false }));
    }
  }, [formattedArtistFollowed, fetchGenericRecommendation, setRecommendBasedOnFollowedArtists]);

  // --- EFFECT: GỢI Ý THEO ACTIVITY ---
  useEffect(() => {
    if (selectedActivity) {
      setIsLoading(prev => ({ ...prev, baseOnActivities: true }));
      GenerateFromActivity(selectedActivity.label).then(response => {
        if (response.success) {
          fetchGenericRecommendation(response.data, 'baseOnActivities', setRecommendBasedOnActivity);
        } else {
          setIsLoading(prev => ({ ...prev, baseOnActivities: false }));
        }
      });
    } else {
      setIsLoading(prev => ({ ...prev, baseOnActivities: false }));
    }
  }, [selectedActivity, fetchGenericRecommendation, setRecommendBasedOnActivity]);

  // --- EFFECT: GỢI Ý THEO MOOD ---
  useEffect(() => {
    if (selectedMood) {
      setIsLoading(prev => ({ ...prev, baseOnMoods: true }));
      GenerateFromMood(selectedMood.label).then(response => {
        if (response.success) {
          fetchGenericRecommendation(response.data, 'baseOnMoods', setRecommendBasedOnMood);
        } else {
          setIsLoading(prev => ({ ...prev, baseOnMoods: false }));
        }
      });
    } else {
      setIsLoading(prev => ({ ...prev, baseOnMoods: false }));
    }
  }, [selectedMood, fetchGenericRecommendation, setRecommendBasedOnMood]);

  return {
    dataForYou,
    dataRecommendations,
    isLoading,
    setIsLoading,
  };
};