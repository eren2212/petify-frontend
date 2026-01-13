import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useFeaturedProducts } from "@/hooks/useHome";
import { AntDesign, Ionicons } from "@expo/vector-icons";

export const HomeFeaturedProducts = () => {
  const { data, isLoading, isError } = useFeaturedProducts();

  // Ürün resim URL'i oluştur
  const getProductImageUrl = (imageUrl: string) => {
    const baseUrl =
      process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
    return `${baseUrl}/home/images/product/${imageUrl}`;
  };

  // Hepsini Gör butonuna tıklama
  const handleViewAll = () => {
    // Tüm ürünler sayfasına git (pagination ile)
    router.push("/(protected)/products/all");
  };

  // Kart tıklama - Ürün detay sayfasına git
  const handleCardPress = (productId: string) => {
    router.push(`/(protected)/products/${productId}` as any);
  };

  // Loading state
  if (isLoading) {
    return (
      <View className="py-4">
        <View className="px-6 mb-4">
          <View className="h-6 w-32 bg-gray-100 rounded-lg" />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className="w-40 h-56 bg-white rounded-2xl mr-3 shadow-sm border border-gray-100"
            >
              <View className="w-full h-36 bg-gray-50 rounded-t-2xl" />
              <View className="p-3 space-y-2">
                <View className="h-4 bg-gray-50 rounded w-3/4" />
                <View className="h-3 bg-gray-50 rounded w-1/2" />
                <View className="h-4 bg-gray-50 rounded w-full" />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Error state veya veri yoksa gösterme
  if (isError || !data?.data || data.data.length === 0) {
    return null;
  }

  const products = data.data;

  return (
    <View className="py-2">
      {/* Header */}
      <View className="px-6 flex-row items-center justify-between mb-5">
        <View className="flex-row items-center">
          <Text className="text-xl font-black text-gray-900 tracking-tight">
            En Çok Satanlar
          </Text>
          <View className="bg-orange-100 px-2 py-0.5 rounded-full ml-2">
            <Text className="text-[10px] font-bold text-orange-500">
              Popüler
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

      {/* Horizontal Scroll - Products */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            onPress={() => handleCardPress(product.id)}
            activeOpacity={0.8}
            className="w-44 mr-4"
          >
            {/* Card Container */}
            <View className="bg-white rounded-3xl shadow-sm shadow-gray-200 border border-gray-100 overflow-hidden">
              {/* Product Image */}
              <View className="w-full h-44 bg-gray-50">
                {product.image_url ? (
                  <Image
                    source={{ uri: getProductImageUrl(product.image_url) }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Ionicons name="image-outline" size={48} color="#D1D5DB" />
                  </View>
                )}
              </View>

              {/* Product Info */}
              <View className="p-4 border-t border-gray-100">
                {/* Product Name */}
                <Text
                  className="text-base font-bold text-gray-900 mb-2"
                  numberOfLines={2}
                >
                  {product.name}
                </Text>

                {/* Rating & Shop */}
                <View className="flex-row items-center justify-between mb-3">
                  {/* Price & Stock */}
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-black text-gray-600">
                      ₺{product.price.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row items-center border border-amber-100 rounded-lg p-1 bg-amber-50">
                    <AntDesign name="star" size={11} color="#F59E0B" />
                    <Text className="text-xs text-amber-700 font-bold ml-1">
                      4.8
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
