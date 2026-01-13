import { Stack } from "expo-router";

export default function SittersLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "Bakıcı Detayı",
        }}
      />
    </Stack>
  );
}
