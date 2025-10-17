import { Stack } from "expo-router";
export default function PetsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "",
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "Hayvan Detayı",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          headerShown: true,
          title: "Hayvan Profilini Düzenleme",
        }}
      />
      <Stack.Screen
        name="vaccination"
        options={{
          headerShown: true,
          title: "Aşı Detayı",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
    </Stack>
  );
}
