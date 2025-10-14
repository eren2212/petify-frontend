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
    </Stack>
  );
}
