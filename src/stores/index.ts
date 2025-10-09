// Store exports
export { useAuthStore } from "./authStore";
export { useAppStore } from "./appStore";

// Store types
export type { AuthState, Session } from "./authStore";
export type { AppState } from "./appStore";

// Import stores for internal use
import { useAuthStore } from "./authStore";
import { useAppStore } from "./appStore";

// Combined store hook for easy access to all stores
export const useStores = () => ({
  auth: useAuthStore(),
  app: useAppStore(),
});

// Store reset function - useful for logout
export const resetAllStores = () => {
  useAuthStore.getState().reset();
  useAppStore.getState().reset();
};
