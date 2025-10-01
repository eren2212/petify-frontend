import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setSession: (session) => {
        set({
          session,
          user: session?.user || null,
          isAuthenticated: !!session?.user,
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      signIn: async (email, password) => {
        try {
          set({ isLoading: true });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            return { error: error.message };
          }

          if (data.session) {
            get().setSession(data.session);
          }

          return {};
        } catch (error) {
          return { error: "Giriş yapılırken bir hata oluştu" };
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email, password) => {
        try {
          set({ isLoading: true });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) {
            return { error: error.message };
          }

          if (data.session) {
            get().setSession(data.session);
          }

          return {};
        } catch (error) {
          return { error: "Kayıt olurken bir hata oluştu" };
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true });

          await supabase.auth.signOut();
          get().reset();
        } catch (error) {
          console.error("Sign out error:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      initialize: async () => {
        try {
          set({ isLoading: true });

          // Get initial session
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            get().setSession(session);
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            get().setSession(session);
          });
        } catch (error) {
          console.error("Auth initialization error:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      reset: () => {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user and session, not loading states
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
