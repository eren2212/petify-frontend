import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AppState {
  // Theme & UI State
  isDarkMode: boolean;
  language: "tr" | "en";

  // App State
  isFirstLaunch: boolean;
  isOnboardingCompleted: boolean;

  // Loading States
  isAppLoading: boolean;

  // Location State
  latitude: number | null;
  longitude: number | null;
  isLocationLoading: boolean;
  locationError: string | null;

  // Actions
  toggleDarkMode: () => void;
  setLanguage: (language: "tr" | "en") => void;
  setFirstLaunch: (isFirst: boolean) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setAppLoading: (loading: boolean) => void;
  setLocation: (latitude: number | null, longitude: number | null) => void;
  setLocationLoading: (loading: boolean) => void;
  setLocationError: (error: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      isDarkMode: false,
      language: "tr",
      isFirstLaunch: true,
      isOnboardingCompleted: false,
      isAppLoading: false,
      latitude: null,
      longitude: null,
      isLocationLoading: false,
      locationError: null,

      // Actions
      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },

      setLanguage: (language) => {
        set({ language });
      },

      setFirstLaunch: (isFirstLaunch) => {
        set({ isFirstLaunch });
      },

      setOnboardingCompleted: (isOnboardingCompleted) => {
        set({ isOnboardingCompleted });
      },

      setAppLoading: (isAppLoading) => {
        set({ isAppLoading });
      },

      setLocation: (latitude, longitude) => {
        set({ latitude, longitude, locationError: null });
      },

      setLocationLoading: (isLocationLoading) => {
        set({ isLocationLoading });
      },

      setLocationError: (locationError) => {
        set({ locationError });
      },

      reset: () => {
        set({
          isDarkMode: false,
          language: "tr",
          isFirstLaunch: true,
          isOnboardingCompleted: false,
          isAppLoading: false,
          latitude: null,
          longitude: null,
          isLocationLoading: false,
          locationError: null,
        });
      },
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
