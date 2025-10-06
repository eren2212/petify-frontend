import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../stores";

export default function AuthLayout() {
  // Zustand store'dan auth durumunu al
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Redirect href="/(protected)/" />;
  }

  return (
    <Stack>
      <Stack.Screen name="signin" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
}
