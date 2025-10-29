import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AdoptionPetsListings() {
  return (
    <View className="items-center justify-center py-20">
      <Ionicons name="heart-outline" size={64} color="#D1D5DB" />
      <Text className="text-gray-400 mt-4 text-base">
        Sahiplendirme ilanları yakında
      </Text>
    </View>
  );
}



