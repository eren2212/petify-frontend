import { useAppStore } from "../stores";

// Theme hook
export const useTheme = () => {
  const { isDarkMode, toggleDarkMode } = useAppStore();
  return { isDarkMode, toggleDarkMode };
};

// Language hook
export const useLanguage = () => {
  const { language, setLanguage } = useAppStore();
  return { language, setLanguage };
};

// Onboarding hook
export const useOnboarding = () => {
  const {
    isFirstLaunch,
    isOnboardingCompleted,
    setFirstLaunch,
    setOnboardingCompleted,
  } = useAppStore();
  return {
    isFirstLaunch,
    isOnboardingCompleted,
    setFirstLaunch,
    setOnboardingCompleted,
  };
};

// App loading hook
export const useAppLoading = () => {
  const { isAppLoading, setAppLoading } = useAppStore();
  return { isAppLoading, setAppLoading };
};

// Combined app hook for convenience
export const useAppFull = () => {
  const {
    isDarkMode,
    language,
    isFirstLaunch,
    isOnboardingCompleted,
    isAppLoading,
    toggleDarkMode,
    setLanguage,
    setFirstLaunch,
    setOnboardingCompleted,
    setAppLoading,
  } = useAppStore();

  return {
    // State
    isDarkMode,
    language,
    isFirstLaunch,
    isOnboardingCompleted,
    isAppLoading,
    // Actions
    toggleDarkMode,
    setLanguage,
    setFirstLaunch,
    setOnboardingCompleted,
    setAppLoading,
  };
};
