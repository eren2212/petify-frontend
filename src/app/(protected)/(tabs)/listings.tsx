import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/styles/theme/color";
import AddLostPetModal from "../../../components/pet/AddLostPetModal";

export default function ListingsScreen() {
  const [showAddLostPetModal, setShowAddLostPetModal] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 20 }}
      >
        {/* Header */}
        <Text className="text-3xl font-bold text-gray-900 mb-8">İlanlar</Text>

        {/* Action Cards */}
        <View className="flex-row gap-4 mb-6">
          {/* Add Lost Pet Card */}
          <TouchableOpacity
            className="flex-1 bg-white rounded-3xl p-8 items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 5,
            }}
            onPress={() => setShowAddLostPetModal(true)}
          >
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: COLORS.primary + "20" }}
            >
              <Ionicons name="search" size={32} color={COLORS.primary} />
            </View>
            <Text className="text-gray-900 font-bold text-base text-center">
              Kaybolmuş Hayvan İlanı
            </Text>
          </TouchableOpacity>

          {/* Adopt a Pet Card */}
          <TouchableOpacity
            className="flex-1 bg-white rounded-3xl p-8 items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 5,
            }}
            onPress={() => {
              // TODO: Adopt a Pet modal
            }}
          >
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: "#EF444420" }}
            >
              <Ionicons name="heart" size={32} color="#EF4444" />
            </View>
            <Text className="text-gray-900 font-bold text-base text-center">
              Sahiplendirme Hayvan İlanı
            </Text>
          </TouchableOpacity>
        </View>

        {/* TODO: İlanlar listesi buraya gelecek */}
        <View className="py-20 items-center">
          <Ionicons name="list" size={64} color="#D1D5DB" />
          <Text className="text-gray-400 mt-4 text-base">
            Henüz ilan bulunmuyor
          </Text>
        </View>
      </ScrollView>

      {/* Add Lost Pet Modal */}
      <AddLostPetModal
        visible={showAddLostPetModal}
        onClose={() => setShowAddLostPetModal(false)}
      />
    </SafeAreaView>
  );
}
