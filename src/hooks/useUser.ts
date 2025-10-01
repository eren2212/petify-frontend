import { useUserStore, useAuthStore } from "../stores";

// User profile hook
export const useUserProfile = () => {
  const { profile, isProfileLoading } = useUserStore();
  return { profile, isProfileLoading };
};

// User actions hook
export const useUserActions = () => {
  const { setProfile, updateProfile, fetchProfile } = useUserStore();
  return { setProfile, updateProfile, fetchProfile };
};

// Combined user hook for convenience
export const useUserFull = () => {
  const { profile, isProfileLoading } = useUserStore();
  const { setProfile, updateProfile, fetchProfile } = useUserStore();

  return {
    // State
    profile,
    isProfileLoading,
    // Actions
    setProfile,
    updateProfile,
    fetchProfile,
  };
};

// Combined auth + user hook for common use cases
export const useAuthUser = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { profile } = useUserStore();

  return {
    user,
    profile,
    isAuthenticated,
    fullUser: user && profile ? { ...user, ...profile } : null,
  };
};
