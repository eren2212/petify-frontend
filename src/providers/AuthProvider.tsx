import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { AppState } from "react-native";
import { useAuthStore } from "../stores";
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const segments = useSegments();

  // Zustand store'dan auth state'i al
  const { user, isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    // İlk yüklemede auth durumunu kontrol et
    initialize();

    // App state değişikliklerini dinle (background'dan döndüğünde kontrol et)
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        initialize();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Auth state değiştiğinde otomatik yönlendirme yap
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inProtectedGroup = segments[0] === "(protected)";

    console.log("isAuthenticated:", isAuthenticated);
    console.log("User role:", user?.role_type);

    if (!isAuthenticated && inProtectedGroup) {
      // Authenticated değilse ve protected sayfadaysa, login'e yönlendir
      console.log("Redirecting to signin...");
      router.replace("/(auth)/signin");
    } else if (isAuthenticated && inAuthGroup) {
      // Authenticated ise ve auth sayfasındaysa, tabs'a yönlendir
      console.log("Redirecting to tabs...");
      router.replace("/(protected)/(tabs)");
    }
  }, [isAuthenticated, segments, isLoading]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return <>{children}</>;
};
