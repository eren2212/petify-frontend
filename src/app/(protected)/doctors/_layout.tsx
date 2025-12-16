import { Stack } from "expo-router";

export default function DoctorsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{ headerShown: true, title: "Veteriner Detayı" }}
      />
    </Stack>
  );
}
