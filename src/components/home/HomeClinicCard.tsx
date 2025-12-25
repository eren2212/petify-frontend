import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useClinicsForHome } from "@/hooks/useHome";
import { AntDesign, Ionicons } from "@expo/vector-icons";

export const HomeClinicCard = () => {
  const { data, isLoading, isError } = useClinicsForHome();

  // Resim URL'i oluştur
  const getClinicImageUrl = (filename: string) => {
    const baseUrl =
      process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
    return `${baseUrl}/home/images/clinic-logo/${filename}`;
  };

  // Hepsini Gör butonuna tıklama
  const handleViewAll = () => {
    // TODO: Tüm klinikler listesi sayfası oluşturulacak
    router.push("/(protected)/(tabs)/map");
  };

  // Kart tıklama - Klinik detay sayfasına git
  const handleCardPress = (id: string) => {
    router.push(`/(protected)/clinics/${id}` as any);
  };

  // Loading state
  if (isLoading) {
    return (
      <View className="px-6 py-4">
        <View className="bg-white rounded-3xl p-4 shadow-sm">
          <ActivityIndicator size="large" color="gray" />
        </View>
      </View>
    );
  }

  // Error state veya veri yoksa gösterme
  if (isError || !data?.data || data.data.length === 0) {
    return null;
  }

  const clinics = data.data;

  return (
    <View className="py-4">
      {/* Header */}
      <View className="px-6 flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-bold text-gray-800">Klinikler</Text>
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
        {clinics.map((clinic) => (
          <TouchableOpacity
            key={clinic.id}
            onPress={() => handleCardPress(clinic.id)}
            activeOpacity={0.7}
            className="bg-white/95 rounded-2xl shadow-sm overflow-hidden flex-row border border-gray-200"
          >
            {/* Pet Image */}
            <View className="w-24 h-24 p-3 ">
              {clinic.logo_url ? (
                <Image
                  source={{ uri: getClinicImageUrl(clinic.logo_url) }}
                  className="w-full h-full rounded-2xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center bg-gray-100">
                  <Ionicons name="medkit" size={32} color="#9CA3AF" />
                </View>
              )}
            </View>

            {/* Pet Info */}
            <View className="flex-1 p-3 justify-between">
              <View>
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-base font-bold text-gray-800">
                    {clinic.clinic_name}
                  </Text>
                </View>
                <Text className="text-sm text-gray-600 mb-1">
                  {clinic.address}
                </Text>
              </View>

              <View className="flex-row items-center gap-1 justify-start">
                <View className="flex-row items-center gap-1 justify-start ">
                  <AntDesign name="star" size={14} color="#FFD700" />
                  <Text className="text-xs text-gray-500 font-bold">4.8</Text>
                </View>
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
