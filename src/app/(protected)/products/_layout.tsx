import { Stack } from "expo-router";

export default function ProductsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="all"
        options={{
          headerShown: true,
          title: "Tüm Ürünler",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "Ürün Detayı",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
    </Stack>
  );
}
