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
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    // İlk yüklemede auth durumunu kontrol et
    initialize();
  }, []);

  // Auth state değiştiğinde otomatik yönlendirme yap
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inProtectedGroup = segments[0] === "(protected)";

    console.log("Current segments:", segments);
    console.log("isAuthenticated:", isAuthenticated);

    if (!isAuthenticated && inProtectedGroup) {
      // Authenticated değilse ve protected sayfadaysa, login'e yönlendir
      console.log("Redirecting to signin...");
      router.replace("/(auth)/signin");
    } else if (isAuthenticated && inAuthGroup) {
      // Authenticated ise ve auth sayfasındaysa, ana sayfaya yönlendir
      // Role-based routing TanStack Query ile user profile yüklendikten sonra yapılacak
      console.log("✅ Redirecting to protected area...");
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
