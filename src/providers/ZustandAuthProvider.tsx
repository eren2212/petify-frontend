import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../stores";

interface ZustandAuthProviderProps {
  children: React.ReactNode;
}

export const ZustandAuthProvider: React.FC<ZustandAuthProviderProps> = ({
  children,
}) => {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize auth store when app starts
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
};
