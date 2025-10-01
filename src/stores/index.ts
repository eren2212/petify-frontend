// Store exports
export { useAuthStore } from "./authStore";
export { useAppStore } from "./appStore";
export { useUserStore } from "./userStore";

// Store types
export type { AuthState } from "./authStore";
export type { AppState } from "./appStore";
export type { UserState, UserProfile } from "./userStore";

// Import stores for internal use
import { useAuthStore } from "./authStore";
import { useAppStore } from "./appStore";
import { useUserStore } from "./userStore";

// Combined store hook for easy access to all stores
export const useStores = () => ({
  auth: useAuthStore(),
  app: useAppStore(),
  user: useUserStore(),
});

// Store reset function - useful for logout
export const resetAllStores = () => {
  useAuthStore.getState().reset();
  useAppStore.getState().reset();
  useUserStore.getState().reset();
};
