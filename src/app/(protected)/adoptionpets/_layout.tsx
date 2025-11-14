import { Stack } from "expo-router";

export default function LostPetsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{ headerShown: true, title: "Sahiplenme Hayvan Detayı" }}
      />
    </Stack>
  );
}
