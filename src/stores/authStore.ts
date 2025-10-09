import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../lib/api";
import type { Login, Register } from "../types/type";
import { queryClient } from "../lib/queryClient";

// Backend'den dönen session tipi
export interface Session {
  access_token: string;
  refresh_token: string;
}

export interface AuthState {
  // State - Sadece auth bilgileri (user profile TanStack Query'de yönetilecek)
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (loginData: Login) => Promise<{ error?: string }>;
  signUp: (registerData: Register) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      session: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      setSession: (session) => {
        set({
          session,
          isAuthenticated: !!session,
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      signIn: async (loginData) => {
        try {
          set({ isLoading: true });

          // Backend'e login isteği at
          const response = await authApi.login(loginData);

          // Backend response formatı: { success, data: { user, session, userRole } }
          if (response?.data?.session) {
            // Sadece session bilgilerini store'a kaydet
            set({
              session: response.data.session,
              isAuthenticated: true,
            });

            // ✅ TanStack Query cache'ini invalidate et (yeni user bilgisi için)
            queryClient.invalidateQueries({
              queryKey: ["auth", "currentUser"],
            });

            return {};
          } else {
            return { error: "Giriş yapılırken bir hata oluştu" };
          }
        } catch (error: any) {
          return {
            error:
              error?.response?.data?.message ||
              "Giriş yapılırken bir hata oluştu",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (registerData) => {
        try {
          set({ isLoading: true });

          // Backend'e register isteği at
          const response = await authApi.register(registerData);
          console.log(JSON.stringify(response, null, 2));

          // ✅ TanStack Query cache'ini invalidate et (yeni user bilgisi için)
          queryClient.invalidateQueries({ queryKey: ["auth", "currentUser"] });

          // Backend response formatı: { success, data: { user, session, roleStatus } }
          return {};
        } catch (error: any) {
          console.error("Sign up error:", error);
          return {
            error:
              error?.response?.data?.message || "Kayıt olurken bir hata oluştu",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true });

          // Backend'e logout isteği at
          await authApi.logout();

          // ✅ TanStack Query cache'ini tamamen temizle
          queryClient.clear();

          // Store'u temizle (AsyncStorage dahil)
          await get().reset();
        } catch (error) {
          console.error("Sign out error:", error);

          // ✅ Hata olsa bile cache'i temizle
          queryClient.clear();

          // Hata olsa bile store'u temizle (client-side logout)
          await get().reset();
        } finally {
          set({ isLoading: false });
        }
      },

      initialize: async () => {
        try {
          set({ isLoading: true });

          // AsyncStorage'dan token bilgilerini oku
          const [accessToken, refreshToken] = await Promise.all([
            AsyncStorage.getItem("access_token"),
            AsyncStorage.getItem("refresh_token"),
          ]);

          // Eğer token varsa, store'a kaydet
          if (accessToken && refreshToken) {
            const session = {
              access_token: accessToken,
              refresh_token: refreshToken,
            };

            set({
              session,
              isAuthenticated: true,
            });
          } else {
            // Token yoksa authenticated değil
            set({
              session: null,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          // Hata durumunda auth bilgilerini temizle
          set({
            session: null,
            isAuthenticated: false,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      reset: async () => {
        // AsyncStorage'ı temizle
        await AsyncStorage.multiRemove([
          "access_token",
          "refresh_token",
          "user",
        ]);

        set({
          session: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist session, not loading states
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
