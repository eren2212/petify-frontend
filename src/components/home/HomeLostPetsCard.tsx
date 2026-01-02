import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useLostPetsForHome } from "@/hooks/useLostPets";
import { Ionicons } from "@expo/vector-icons";

export const HomeLostPetsCard = () => {
  const { data, isLoading, isError } = useLostPetsForHome();

  // Resim URL'i oluştur
  const getLostPetImageUrl = (filename: string) => {
    const baseUrl =
      process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
    return `${baseUrl}/home/images/lost-pet/${filename}`;
  };

  // Tarihi formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Bugün";
    if (diffDays === 1) return "Dün";
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return `${Math.floor(diffDays / 30)} ay önce`;
  };

  // Hepsini Gör butonuna tıklama
  const handleViewAll = () => {
    try {
      router.push("/(protected)/(tabs)/listings");
    } catch (e) {
      console.log("Navigation context missing (Lost Pets View All):", e);
    }
    console.log("Navigating to: /(protected)/(tabs)/listings");
  };

  // Kart tıklama
  const handleCardPress = (id: string) => {
    try {
      router.push(`/(protected)/lostpets/${id}` as any);
    } catch (e) {
      console.log("Navigation context missing (Lost Pet Card Press):", e);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View className="px-5 py-4">
        {[1, 2].map((i) => (
          <View
            key={i}
            className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 mb-3 flex-row items-center h-28"
          >
            <View className="w-20 h-20 bg-gray-50 rounded-2xl" />
            <View className="flex-1 ml-4 space-y-2">
              <View className="h-4 bg-gray-50 rounded w-3/4" />
              <View className="h-3 bg-gray-50 rounded w-1/2" />
            </View>
          </View>
        ))}
      </View>
    );
  }

  // Error state veya veri yoksa gösterme
  if (isError || !data?.data || data.data.length === 0) {
    return null;
  }

  const lostPets = data.data;

  return (
    <View className="py-2">
      {/* Header */}
      <View className="px-6 flex-row items-center justify-between mb-5">
        <View className="flex-row items-center">
          <Text className="text-xl font-black text-gray-900 tracking-tight">
            Kayıp İlanları
          </Text>
          <View className="bg-red-50 px-2 py-0.5 rounded-full ml-2 border border-red-100">
            <Text className="text-[10px] font-bold text-red-500">
              ACİL DURUM
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleViewAll}
          className="flex-row items-center py-1 px-2 -mr-2"
        >
          <Text className="text-gray-500 font-bold text-sm mr-1">
            Tümünü Gör
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Cards */}
      <View className="px-5 gap-4">
        {lostPets.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            onPress={() => handleCardPress(pet.id)}
            activeOpacity={0.8}
            className="bg-white rounded-[24px] shadow-sm shadow-gray-200 border border-gray-100 p-3 flex-row items-center"
          >
            {/* Pet Image */}
            <View className="w-20 h-20 bg-gray-50 rounded-2xl p-1 shadow-inner border border-gray-50">
              {pet.image_url ? (
                <Image
                  source={{ uri: getLostPetImageUrl(pet.image_url) }}
                  className="w-full h-full rounded-xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center bg-white rounded-xl">
                  <Ionicons name="paw" size={28} color="#E5E7EB" />
                </View>
              )}
            </View>

            {/* Pet Info */}
            <View className="flex-1 ml-4 justify-center py-1">
              <View className="flex-row items-start justify-between mb-1">
                <Text
                  className="text-lg font-bold text-gray-900 leading-6 flex-1 mr-2"
                  numberOfLines={1}
                >
                  {pet.pet_name}
                </Text>
                <View className="bg-red-500 px-2 py-0.5 rounded-md self-start">
                  <Text className="text-[10px] font-bold text-white uppercase">
                    KAYIP
                  </Text>
                </View>
              </View>

              <Text
                className="text-sm text-gray-500 font-medium mb-2"
                numberOfLines={1}
              >
                {pet.pet_type.name_tr} {pet.breed ? `• ${pet.breed}` : ""}
              </Text>

              <View className="flex-row items-center">
                <View className="bg-gray-50 px-2 py-1 rounded-lg flex-row items-center border border-gray-100">
                  <Ionicons name="time-outline" size={12} color="#6B7280" />
                  <Text className="text-xs text-gray-500 font-medium ml-1">
                    {formatDate(pet.lost_date)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Arrow */}
            <View className="ml-2 bg-gray-50 w-10 h-10 rounded-full items-center justify-center border border-gray-100">
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
