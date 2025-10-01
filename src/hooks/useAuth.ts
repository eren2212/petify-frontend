import { useAuthStore } from "../stores";

// Auth state hook - specific selectors for better performance
export const useAuth = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  return { user, isAuthenticated, isLoading };
};

// Auth actions hook
export const useAuthActions = () => {
  const { signIn, signUp, signOut, initialize } = useAuthStore();
  return { signIn, signUp, signOut, initialize };
};

// Combined auth hook for convenience
export const useAuthFull = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { signIn, signUp, signOut, initialize } = useAuthStore();

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    // Actions
    signIn,
    signUp,
    signOut,
    initialize,
  };
};
