import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSittersForHome } from "@/hooks/useHome";
import { AntDesign, Ionicons } from "@expo/vector-icons";

export const HomeSitterCard = () => {
  const { data, isLoading, isError } = useSittersForHome();

  // Resim URL'i oluştur
  const getSitterImageUrl = (filename: string) => {
    const baseUrl =
      process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
    return `${baseUrl}/home/images/sitter-profile/${filename}`;
  };

  // Hepsini Gör butonuna tıklama
  const handleViewAll = () => {
    try {
      // TODO: Tüm klinikler listesi sayfası oluşturulacak
      router.push("/(protected)/(tabs)/map");
    } catch (e) {
      console.log("Navigation context missing (Sitter View All):", e);
    }
  };

  // Kart tıklama - Klinik detay sayfasına git
  const handleCardPress = (id: string) => {
    try {
      router.push(`/(protected)/sitters/${id}`);
    } catch (e) {
      console.log("Navigation context missing (Sitter Card Press):", e);
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

  const sitters = data.data;

  return (
    <View className="py-2">
      {/* Header */}
      <View className="px-6 flex-row items-center justify-between mb-5">
        <View className="flex-row items-center">
          <Text className="text-xl font-black text-gray-900 tracking-tight">
            Bakıcılar
          </Text>
          <View className="bg-purple-100 px-2 py-0.5 rounded-full ml-2">
            <Text className="text-[10px] font-bold text-purple-600">
              Güvenilir
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
        {sitters.map((sitter) => (
          <TouchableOpacity
            key={sitter.id}
            onPress={() => handleCardPress(sitter.id)}
            activeOpacity={0.8}
            className="bg-white rounded-[24px] shadow-sm shadow-gray-200 border border-gray-100 p-3 flex-row items-center"
          >
            {/* Sitter Image */}
            <View className="w-20 h-20 bg-gray-50 rounded-2xl p-1 shadow-inner border border-gray-50">
              {sitter.logo_url ? (
                <Image
                  source={{ uri: getSitterImageUrl(sitter.logo_url) }}
                  className="w-full h-full rounded-xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center bg-white rounded-xl">
                  <Ionicons name="person" size={28} color="#E5E7EB" />
                </View>
              )}
            </View>

            {/* Sitter Info */}
            <View className="flex-1 ml-4 justify-center py-1">
              <View className="flex-row items-start justify-between mb-1">
                <Text
                  className="text-lg font-bold text-gray-900 leading-6 flex-1 mr-2"
                  numberOfLines={1}
                >
                  {sitter.display_name}
                </Text>
                <Ionicons name="shield-checkmark" size={16} color="#9333EA" />
              </View>

              <Text
                className="text-sm text-gray-500 font-medium mb-2"
                numberOfLines={1}
              >
                {sitter.experience_years} yıllık deneyim
              </Text>

              <View className="flex-row items-center">
                <View className="bg-amber-50 px-2 py-1 rounded-lg flex-row items-center mr-2 border border-amber-100">
                  <AntDesign name="star" size={12} color="#F59E0B" />
                  <Text className="text-xs text-amber-700 font-bold ml-1">
                    4.9
                  </Text>
                </View>
                <View className="bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                  <Text className="text-[10px] font-bold text-purple-600">
                    Onaylı
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
