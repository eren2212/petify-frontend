import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface UserState {
  // User Profile State
  profile: UserProfile | null;

  // Loading States
  isProfileLoading: boolean;

  // Actions
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setProfileLoading: (loading: boolean) => void;
  fetchProfile: (userId: string) => Promise<void>;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      isProfileLoading: false,

      // Actions
      setProfile: (profile) => {
        set({ profile });
      },

      updateProfile: (updates) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: {
              ...currentProfile,
              ...updates,
              updated_at: new Date().toISOString(),
            },
          });
        }
      },

      setProfileLoading: (isProfileLoading) => {
        set({ isProfileLoading });
      },

      fetchProfile: async (userId) => {
        try {
          set({ isProfileLoading: true });

          // Burada Supabase'den profil bilgilerini çekeceksiniz
          // Şimdilik örnek implementasyon

          // const { data, error } = await supabase
          //   .from('profiles')
          //   .select('*')
          //   .eq('id', userId)
          //   .single();

          // if (error) throw error;
          // set({ profile: data });
        } catch (error) {
          console.error("Profile fetch error:", error);
        } finally {
          set({ isProfileLoading: false });
        }
      },

      reset: () => {
        set({
          profile: null,
          isProfileLoading: false,
        });
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist profile data
      partialize: (state) => ({
        profile: state.profile,
      }),
    }
  )
);
