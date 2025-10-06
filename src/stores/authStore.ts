import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../lib/api";
import type { Login, Register } from "../types/type";

// Backend'den dönen user tipi
export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role_type?: string;
  role_status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_type: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

// Backend'den dönen session tipi
export interface Session {
  access_token: string;
  refresh_token: string;
}

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
          // Session yalnızca token'ları içeriyor, user ayrı set edilmeli
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
          if (response?.data?.session && response?.data?.user) {
            //  Backend'den gelen userRole bilgisini user objesine ekle
            const userWithRole = {
              ...response.data.user,
              role_type: response.data.userRole?.role_type || null,
              role_status: response.data.userRole?.status || null,
            };

            // Session ve user bilgilerini store'a kaydet
            set({
              session: response.data.session,
              user: userWithRole,
              isAuthenticated: true,
            });

            return {};
          } else {
            return { error: "Giriş yapılırken bir hata oluştu" };
          }
        } catch (error: any) {
          console.error("Sign in error:", error);
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

          // Backend response formatı: { success, data: { user, session, roleStatus } }
          if (response?.data?.session && response?.data?.user) {
            // Kayıt sırasında rol bilgisini user objesine ekle
            const userWithRole = {
              ...response.data.user,
              role_type: registerData.roleType,
              role_status: response.data.roleStatus || "pending",
            };

            console.log(" Signup başarılı - User with role:", userWithRole);

            // Session ve user bilgilerini store'a kaydet
            set({
              session: response.data.session,
              user: userWithRole,
              isAuthenticated: true,
            });

            return {};
          } else {
            return { error: "Kayıt olurken bir hata oluştu" };
          }
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

          // Store'u temizle
          get().reset();
        } catch (error) {
          console.error("Sign out error:", error);
          // Hata olsa bile store'u temizle (client-side logout)
          get().reset();
        } finally {
          set({ isLoading: false });
        }
      },

      initialize: async () => {
        try {
          set({ isLoading: true });

          // AsyncStorage'dan token ve user bilgilerini oku
          const [accessToken, refreshToken, userStr] = await Promise.all([
            AsyncStorage.getItem("access_token"),
            AsyncStorage.getItem("refresh_token"),
            AsyncStorage.getItem("user"),
          ]);

          // Eğer token ve user varsa, store'a kaydet
          if (accessToken && refreshToken && userStr) {
            const user = JSON.parse(userStr);
            const session = {
              access_token: accessToken,
              refresh_token: refreshToken,
            };

            set({
              user,
              session,
              isAuthenticated: true,
            });
          } else {
            // Token yoksa authenticated değil
            set({
              user: null,
              session: null,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          // Hata durumunda auth bilgilerini temizle
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          });
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
