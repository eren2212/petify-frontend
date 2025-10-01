import {
  useAuthStore,
  useAppStore,
  useUserStore,
  resetAllStores,
} from "../stores";

// Combined store hook for easy access to all stores
export const useStores = () => ({
  auth: useAuthStore(),
  app: useAppStore(),
  user: useUserStore(),
});

// Store reset hook
export const useStoreReset = () => {
  return {
    resetAllStores,
    resetAuth: () => useAuthStore.getState().reset(),
    resetApp: () => useAppStore.getState().reset(),
    resetUser: () => useUserStore.getState().reset(),
  };
};
