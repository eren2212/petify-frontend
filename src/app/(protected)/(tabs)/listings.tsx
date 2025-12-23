import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/styles/theme/color";
import AddLostPetModal from "../../../components/pet/AddLostPetModal";
import AddAdoptionPetModal from "../../../components/pet/AddAdoptionPetModal";
import LostPetsListings from "@/components/listings/LostPetsListings";
import AdoptionPetsListings from "@/components/listings/AdoptionPetsListings";

export default function ListingsScreen() {
  const [showAddLostPetModal, setShowAddLostPetModal] = useState(false);
  const [showAddAdoptionPetModal, setShowAddAdoptionPetModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"lost" | "adoption">("lost");

  return (
    <SafeAreaView className="flex-1 ">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 20 }}
      >
        {/* Header */}
        <Text className="text-3xl font-bold text-gray-900 mb-8 text-center font-sans ">
          Hayvan İlanları
        </Text>

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
            onPress={() => setShowAddAdoptionPetModal(true)}
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

        {/* Kategori Seçimi */}
        <View className="flex-row gap-4 mb-6 justify-around items-start">
          <TouchableOpacity
            className={`p-4 rounded-2xl items-center justify-center w-2/5 ${
              activeTab === "lost"
                ? "bg-primary"
                : "bg-white border border-primary"
            }`}
            onPress={() => setActiveTab("lost")}
          >
            <Text
              className={`text-center flex-1 font-bold ${
                activeTab === "lost" ? "text-white" : "text-primary"
              }`}
            >
              Kayıp
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`p-4 rounded-2xl items-center justify-center w-2/5 ${
              activeTab === "adoption"
                ? "bg-primary"
                : "bg-white border border-primary"
            }`}
            onPress={() => setActiveTab("adoption")}
          >
            <Text
              className={`text-center flex-1 font-bold ${
                activeTab === "adoption" ? "text-white" : "text-primary"
              }`}
            >
              Yuva Bekleyen
            </Text>
          </TouchableOpacity>
        </View>

        {/* Liste Render */}
        {activeTab === "lost" ? (
          <LostPetsListings mode="nearby" />
        ) : (
          <AdoptionPetsListings mode="nearby" />
        )}
      </ScrollView>

      {/* Add Lost Pet Modal */}
      <AddLostPetModal
        visible={showAddLostPetModal}
        onClose={() => setShowAddLostPetModal(false)}
      />

      {/* Add Adoption Pet Modal */}
      <AddAdoptionPetModal
        visible={showAddAdoptionPetModal}
        onClose={() => setShowAddAdoptionPetModal(false)}
      />
    </SafeAreaView>
  );
}
