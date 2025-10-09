import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Tab bar'ı profile stack'ine girerken gizle
        presentation: "card",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="edit"
        options={{
          // Edit sayfası modal gibi açılsın istersen
          presentation: "formSheet",
        }}
      />
    </Stack>
  );
}
