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

// Backend'den dönen user tipi (minimal - tam bilgi TanStack Query'de)
export interface User {
  id: string;
  email: string;
  full_name?: string;
  role_type?: string;
  role_status?: string;
}

export interface AuthState {
  // State - Sadece auth bilgileri (user profile TanStack Query'de yönetilecek)
  session: Session | null;
  user: User | null; // ⭐ User bilgisi eklendi
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setSession: (session: Session | null, user?: User | null) => void;
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
      user: null, // ⭐ User state başlangıç değeri
      isAuthenticated: false,
      isLoading: true,

      // Actions
      setSession: (session, user = null) => {
        set({
          session,
          user,
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
            // ⭐ Session VE user bilgilerini store'a kaydet
            const user: User = {
              id: response.data.user.id,
              email: response.data.user.email,
              full_name: response.data.user.full_name,
              role_type: response.data.userRole?.role_type,
              role_status: response.data.userRole?.status,
            };

            set({
              session: response.data.session,
              user,
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

          // ⭐ Register sonrası da session ve user bilgilerini kaydet
          if (response?.data?.session && response?.data?.user) {
            const user: User = {
              id: response.data.user.id,
              email: response.data.user.email,
              full_name: response.data.user.full_name,
              role_type: registerData.roleType,
              role_status: response.data.roleStatus || "pending",
            };

            set({
              session: response.data.session,
              user,
              isAuthenticated: true,
            });
          }

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

          // ⭐ Cart Store'u da temizle (import dinamik olarak yapılacak)
          try {
            const { useCartStore } = await import("./useCartStore");
            const cartStore = useCartStore.getState();
            cartStore.setActiveUser(null); // Aktif kullanıcıyı temizle
          } catch (error) {
            console.error("Cart temizleme hatası:", error);
          }

          // Store'u temizle (AsyncStorage dahil)
          await get().reset();
        } catch (error) {
          console.error("Sign out error:", error);

          // ✅ Hata olsa bile cache'i temizle
          queryClient.clear();

          // ⭐ Hata olsa bile cart'ı temizle
          try {
            const { useCartStore } = await import("./useCartStore");
            const cartStore = useCartStore.getState();
            cartStore.setActiveUser(null);
          } catch (cartError) {
            console.error("Cart temizleme hatası:", cartError);
          }

          // Hata olsa bile store'u temizle (client-side logout)
          await get().reset();
        } finally {
          set({ isLoading: false });
        }
      },

      initialize: async () => {
        try {
          set({ isLoading: true });

          // ⭐ AsyncStorage'dan token VE user bilgilerini oku
          const [accessToken, refreshToken, userString] = await Promise.all([
            AsyncStorage.getItem("access_token"),
            AsyncStorage.getItem("refresh_token"),
            AsyncStorage.getItem("user"),
          ]);

          // Eğer token varsa, store'a kaydet
          if (accessToken && refreshToken) {
            const session = {
              access_token: accessToken,
              refresh_token: refreshToken,
            };

            // User bilgisini parse et
            let user: User | null = null;
            if (userString) {
              try {
                user = JSON.parse(userString);
              } catch (error) {
                console.error("User parse hatası:", error);
              }
            }

            set({
              session,
              user,
              isAuthenticated: true,
            });
          } else {
            // Token yoksa authenticated değil
            set({
              session: null,
              user: null,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          // Hata durumunda auth bilgilerini temizle
          set({
            session: null,
            user: null,
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
          user: null, // ⭐ User bilgisini de temizle
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist session and user, not loading states
      partialize: (state) => ({
        session: state.session,
        user: state.user, // ⭐ User'ı da persist et
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
