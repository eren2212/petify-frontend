import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { View } from "react-native";
import { useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";

type User = {
  id: string;
  email: string;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  checkAuth: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Auth durumunu kontrol et
  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const userStr = await AsyncStorage.getItem("user");

      if (token && userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // İlk yüklemede auth durumunu kontrol et
    checkAuth();

    // App state değişikliklerini dinle (background'dan döndüğünde kontrol et)
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkAuth();
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

    console.log("Current segments:", segments);
    console.log("isAuthenticated:", isAuthenticated);
    console.log("inAuthGroup:", inAuthGroup);
    console.log("inProtectedGroup:", inProtectedGroup);

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

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
