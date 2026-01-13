import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAllProducts } from "@/hooks/useHome";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { PetifySpinner } from "@/components/PetifySpinner";

export default function AllProductsScreen() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useAllProducts();

  // Ürün resim URL'i oluştur
  const getProductImageUrl = (imageUrl: string) => {
    const baseUrl =
      process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
    return `${baseUrl}/home/images/product/${imageUrl}`;
  };

  // Kart tıklama - Ürün detay sayfasına git
  const handleCardPress = (productId: string) => {
    router.push(`/(protected)/products/${productId}` as any);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Tüm sayfalardan ürünleri birleştir
  const allProducts = data?.pages.flatMap((page) => page.data) || [];

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <PetifySpinner size={180} />
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text className="text-gray-900 font-bold text-xl mt-4">
            Bir Hata Oluştu
          </Text>
          <Text className="text-gray-500 text-center mt-2 mb-6">
            Ürünler yüklenirken bir sorun oluştu.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-black px-8 py-4 rounded-full"
          >
            <Text className="text-white font-semibold">Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (allProducts.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cube-outline" size={64} color="#9CA3AF" />
          <Text className="text-gray-900 font-bold text-xl mt-4">
            Ürün Bulunamadı
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            Henüz listelenmiş ürün bulunmamaktadır.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render footer (load more indicator)
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View className="py-6">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  };

  // Render product item
  const renderProductItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleCardPress(item.id)}
      activeOpacity={0.8}
      className="w-[48%] mb-4"
    >
      <View className="bg-white rounded-3xl shadow-sm shadow-gray-200 border border-gray-100 overflow-hidden">
        {/* Product Image */}
        <View className="w-full h-44 bg-gray-50">
          {item.image_url ? (
            <Image
              source={{ uri: getProductImageUrl(item.image_url) }}
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
            numberOfLines={1}
          >
            {item.name}
          </Text>

          {/* Rating & Price Row */}
          <View className="flex-row items-center justify-between mb-3">
            {/* Price */}
            <View>
              <Text className="text-sm font-black text-gray-600">
                ₺{item.price.toFixed(2)}
              </Text>
            </View>
            {/* Rating */}
            <View className="flex-row items-center border border-amber-100 rounded-lg p-1 bg-amber-50">
              <AntDesign name="star" size={11} color="#F59E0B" />
              <Text className="text-xs text-amber-700 font-bold ml-1">4.8</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-center">
        <View className="bg-orange-100 px-3 py-1.5 rounded-full">
          <Text className="text-xs font-bold text-orange-500">
            {data?.pages[0]?.pagination?.total || 0} Ürün
          </Text>
        </View>
      </View>

      {/* Products Grid */}
      <FlatList
        data={allProducts}
        renderItem={renderProductItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#F97316"
            colors={["#F97316"]}
          />
        }
      />
    </SafeAreaView>
  );
}
