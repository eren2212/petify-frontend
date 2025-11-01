import { Stack } from "expo-router";

export default function LostPetsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{ headerShown: true, title: "Kayıp Hayvan Detayı" }}
      />
    </Stack>
  );
}
