import { Stack } from "expo-router";

export default function HotelsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "Otel Detayı",
        }}
      />
    </Stack>
  );
}
