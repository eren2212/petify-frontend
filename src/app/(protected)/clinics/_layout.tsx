import { Stack } from "expo-router";

export default function ClinicsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "Klinik Detayı",
        }}
      />
    </Stack>
  );
}
