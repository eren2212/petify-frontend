import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import AddProductModal from "../../../components/product/AddProductModal";
import { COLORS } from "../../../styles/theme/color";

export default function Products() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-3xl font-bold text-text">Ürünler</Text>

          {/* Add Product Button */}
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="bg-primary rounded-full w-14 h-14 items-center justify-center"
            style={{
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <Text className="text-base text-text/60">
          Ürün listesi burada gösterilecek
        </Text>
      </View>

      {/* Add Product Modal */}
      <AddProductModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </SafeAreaView>
  );
}
