import { Stack } from "expo-router";

export default function ShopsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "Mağaza Detayı",
        }}
      />
    </Stack>
  );
}
