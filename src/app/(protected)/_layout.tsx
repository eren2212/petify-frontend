import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../stores";

export default function ProtectedLayout() {
  // Zustand store'dan auth durumunu al
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/signin" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="pets"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
