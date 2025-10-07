import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Products() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-6">
        <Text className="text-3xl font-bold text-text mb-4">Ürünler</Text>
        <Text className="text-base text-text/60">
          Ürün listesi burada gösterilecek
        </Text>
      </View>
    </SafeAreaView>
  );
}

