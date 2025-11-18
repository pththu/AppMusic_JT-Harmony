import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BoardingState {
  selectedArtists: string[];
  selectedMood: any;
  selectedGenres: string[];
  selectedActivity: any;

  recommendBasedOnActivity: any[];
  recommendBasedOnMood: any[];

  setSelectedArtists: (artists: string[]) => void;
  setSelectedMood: (mood: any) => void;
  setSelectedGenres: (genres: string[]) => void;
  setSelectedActivity: (activity: any) => void;
  setRecommendBasedOnActivity: (recommendations: any[]) => void;
  setRecommendBasedOnMood: (recommendations: any[]) => void;
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

      setRecommendBasedOnActivity: (recommendations) => set({ recommendBasedOnActivity: recommendations }),
      setRecommendBasedOnMood: (recommendations) => set({ recommendBasedOnMood: recommendations }),
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
        }),
    }),
    {
      name: 'boarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);