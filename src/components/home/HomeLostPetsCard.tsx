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
    router.push("/(protected)/(tabs)/listings");
  };

  // Kart tıklama
  const handleCardPress = (id: string) => {
    router.push(`/(protected)/lostpets/${id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <View className="px-6 py-4">
        <View className="bg-white rounded-3xl p-4 shadow-sm">
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      </View>
    );
  }

  // Error state veya veri yoksa gösterme
  if (isError || !data?.data || data.data.length === 0) {
    return null;
  }

  const lostPets = data.data;

  return (
    <View className="py-4">
      {/* Header */}
      <View className="px-6 flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-bold text-gray-800">
            Kayıp Hayvanlar
          </Text>
          <View className="w-2 h-2 rounded-full bg-red-500" />
        </View>
        <TouchableOpacity
          onPress={handleViewAll}
          className="flex-row items-center gap-1"
        >
          <Text className="text-gray-400 font-semibold">Hepsini Gör</Text>
          <Ionicons name="chevron-forward" size={16} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Cards */}
      <View className="px-6 gap-3">
        {lostPets.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            onPress={() => handleCardPress(pet.id)}
            activeOpacity={0.7}
            className="bg-white/95 rounded-2xl shadow-sm overflow-hidden flex-row border border-gray-200"
          >
            {/* Pet Image */}
            <View className="w-24 h-24 p-3 ">
              {pet.image_url ? (
                <Image
                  source={{ uri: getLostPetImageUrl(pet.image_url) }}
                  className="w-full h-full rounded-2xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center bg-gray-100">
                  <Ionicons name="paw" size={32} color="#9CA3AF" />
                </View>
              )}
            </View>

            {/* Pet Info */}
            <View className="flex-1 p-3 justify-between">
              <View>
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-base font-bold text-gray-800">
                    {pet.pet_name}
                  </Text>
                  <View className="bg-red-100 px-2 py-1 rounded-full">
                    <Text className="text-red-600 text-xs font-semibold">
                      ACİL
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-gray-600 mb-1">
                  {pet.pet_type.name_tr}
                  {pet.breed ? ` • ${pet.breed}` : ""}
                </Text>
              </View>

              <View className="flex-row items-center gap-1">
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text className="text-xs text-gray-500">
                  Son görülme: {formatDate(pet.lost_date)}
                </Text>
              </View>
            </View>

            {/* Arrow */}
            <View className="items-center justify-center pr-3">
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9CA3AF"
                className="bg-gray-100 rounded-full p-2"
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
