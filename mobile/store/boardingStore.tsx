import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface BoardingState {
  selectedArtists: string[];
  selectedMood: any;
  selectedGenres: string[];
  selectedActivity: any;

  recommendBasedOnActivity: any[];
  recommendBasedOnMood: any[];
  recommendBasedOnFollowedArtists: any[];
  recommendBasedOnFavorites: any[];
  recommendBasedOnHistories: any[];
  recommendBasedOnTimeOfDay: any[];
  recommendBasedOnPlaylist: any[];
  recommendBasedOnQueue: any[];
  recommendTrackBasedOnFavorites: any[];

  setWhenLogin: () => void;
  setSelectedArtists: (artists: string[]) => void;
  setSelectedMood: (mood: any) => void;
  setSelectedGenres: (genres: string[]) => void;
  setSelectedActivity: (activity: any) => void;
  setRecommendBasedOnActivity: (recommendations: any[]) => void;
  setRecommendBasedOnMood: (recommendations: any[]) => void;
  setRecommendBasedOnFollowedArtists: (recommendations: any[]) => void;
  setRecommendBasedOnFavorites: (recommendations: any[]) => void;
  setRecommendBasedOnHistories: (recommendations: any[]) => void;
  setRecommendBasedOnTimeOfDay: (recommendations: any[]) => void;
  setRecommendBasedOnPlaylist: (recommendations: any[]) => void;
  setRecommendBasedOnQueue: (recommendations: any[]) => void;
  setRecommendTrackBasedOnFavorites: (recommendations: any[]) => void;
  updateSelectedMood: (mood: any) => void;
  updateSelectedActivity: (activity: any) => void;

  clearBoardingStore: () => void;
}

export const useBoardingStore = create<BoardingState>()(
  persist(
    (set) => ({
      selectedArtists: [],
      selectedMood: '',
      selectedGenres: [],
      selectedActivity: '',
      recommendBasedOnActivity: [],
      recommendBasedOnMood: [],
      recommendBasedOnFollowedArtists: [],
      recommendBasedOnFavorites: [],
      recommendBasedOnHistories: [],
      recommendBasedOnTimeOfDay: [],
      recommendBasedOnPlaylist: [],
      recommendBasedOnQueue: [],
      recommendTrackBasedOnFavorites: [],

      setWhenLogin: () => set({
        selectedMood: { id: 'happy', label: 'Vui vẻ 😊' },
        selectedActivity: { id: 'relax', label: 'Thư giãn' },
      }),
      setRecommendBasedOnActivity: (recommendations) => set({ recommendBasedOnActivity: recommendations }),
      setRecommendBasedOnMood: (recommendations) => set({ recommendBasedOnMood: recommendations }),
      setRecommendBasedOnFollowedArtists: (recommendations) => set({ recommendBasedOnFollowedArtists: recommendations }),
      setRecommendBasedOnFavorites: (recommendations) => set({ recommendBasedOnFavorites: recommendations }),
      setRecommendBasedOnHistories: (recommendations) => set({ recommendBasedOnHistories: recommendations }),
      setRecommendBasedOnTimeOfDay: (recommendations) => set({ recommendBasedOnTimeOfDay: recommendations }),
      setRecommendBasedOnPlaylist: (recommendations) => set({ recommendBasedOnPlaylist: recommendations }),
      setRecommendBasedOnQueue: (recommendations) => set({ recommendBasedOnQueue: recommendations }),
      setRecommendTrackBasedOnFavorites: (recommendations) => set({ recommendTrackBasedOnFavorites: recommendations }),
      setSelectedArtists: (artists) => set({ selectedArtists: artists }),
      setSelectedMood: (mood) => set({ selectedMood: mood }),
      setSelectedGenres: (genres) => set({ selectedGenres: genres }),
      setSelectedActivity: (activity) => set({ selectedActivity: activity }),
      updateSelectedMood: (mood) => set({ selectedMood: mood }),
      updateSelectedActivity: (activity) => set({ selectedActivity: activity }),
      clearBoardingStore: () =>
        set({
          selectedArtists: [],
          selectedMood: '',
          selectedGenres: [],
          selectedActivity: '',
          recommendBasedOnActivity: [],
          recommendBasedOnMood: [],
          recommendBasedOnFollowedArtists: [],
          recommendBasedOnFavorites: [],
          recommendBasedOnHistories: [],
          recommendBasedOnTimeOfDay: [],
          recommendBasedOnPlaylist: [],
          recommendBasedOnQueue: [],
          recommendTrackBasedOnFavorites: [],
        }),
    }),
    {
      name: 'boarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log(" Boarding store rehydrated"); // gọi khi load từ AsyncStorage xong
      }
    }
  )
);