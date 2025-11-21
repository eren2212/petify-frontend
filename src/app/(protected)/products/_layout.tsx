import { Stack } from "expo-router";

export default function ProductsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{ headerShown: true, title: "Ürün Detayı" }}
      />
    </Stack>
  );
}

