// Store exports
export { useAuthStore } from "./authStore";
export { useAppStore } from "./appStore";
export { useCartStore } from "./useCartStore";

// Store types
export type { AuthState, Session, User } from "./authStore";
export type { AppState } from "./appStore";

// Import stores for internal use
import { useAuthStore } from "./authStore";
import { useAppStore } from "./appStore";
import { useCartStore } from "./useCartStore";

// Combined store hook for easy access to all stores
export const useStores = () => ({
  auth: useAuthStore(),
  app: useAppStore(),
  cart: useCartStore(),
});

// Store reset function - useful for logout
export const resetAllStores = () => {
  useAuthStore.getState().reset();
  useAppStore.getState().reset();
  useCartStore.getState().setActiveUser(null); // Cart'ı da temizle
};
