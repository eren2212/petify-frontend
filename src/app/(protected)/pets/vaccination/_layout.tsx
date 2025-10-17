import { Stack } from "expo-router";

export default function VaccinationLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "",
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          title: "Aşı Detayı",
        }}
      />
    </Stack>
  );
}
