import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import { useShopProducts } from "@/hooks/useHome";
import { router } from "expo-router";

interface PetShopProductListProps {
  shopId: string;
}

/**
 * Pet Shop detay sayfasında ürünleri listeleyen component
 */
export const PetShopProductList: React.FC<PetShopProductListProps> = ({
  shopId,
}) => {
  const { data, isLoading, isError } = useShopProducts(shopId);

  // Loading state
  if (isLoading) {
    return (
      <View className="w-full px-5 mb-6">
        <View className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
          <ActivityIndicator size="small" color="#4ECDC4" />
        </View>
      </View>
    );
  }

  // Error state veya ürün yoksa gösterme
  if (isError || !data?.data || data.data.length === 0) {
    return null;
  }

  const products = data.data;

  // Fiyat formatlama
  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ₺`;
  };

  // Yaş grubu çevirisi
  const getAgeGroupLabel = (ageGroup: string | null) => {
    if (!ageGroup) return null;
    switch (ageGroup.toLowerCase()) {
      case "puppy":
      case "kitten":
        return "Yavru";
      case "adult":
        return "Yetişkin";
      case "senior":
        return "Yaşlı";
      case "all_ages":
        return "Tüm Yaşlar";
      default:
        return ageGroup;
    }
  };

  // Ürün detayına git
  const handleProductPress = (productId: string) => {
    try {
      router.push(`/(protected)/products/${productId}` as any);
    } catch (error) {
      console.log("Navigation error:", error);
    }
  };

  return (
    <View className="w-full px-5 mb-8">
      <View className="bg-white rounded-[32px] p-6 shadow-lg shadow-gray-200/50">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <View className="w-12 h-12 rounded-2xl bg-teal-50 items-center justify-center mr-4 border border-teal-100">
            <Ionicons name="cube" size={24} color="#4ECDC4" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 tracking-tight">
              Ürünlerimiz
            </Text>
            <Text className="text-xs text-gray-400 mt-1 font-medium">
              Kaliteli Evcil Hayvan Ürünleri
            </Text>
          </View>
          <View className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100/50">
            <Text className="text-xs font-bold text-gray-500">
              {products.length} Ürün
            </Text>
          </View>
        </View>

        {/* Ürünler Listesi - Grid Layout */}
        <View className="flex-row flex-wrap -mx-2">
          {products.map((product, index) => (
            <View
              key={product.id}
              className="w-1/2 px-2"
              style={{
                marginBottom: 16,
              }}
            >
              <TouchableOpacity
                onPress={() => handleProductPress(product.id)}
                activeOpacity={0.8}
                className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm h-[300px] flex-col"
              >
                {/* Ürün Resmi */}
                <View className="w-full aspect-square bg-gray-50 items-center justify-center relative">
                  {product.image_url ? (
                    <Image
                      source={{
                        uri: `${process.env.EXPO_PUBLIC_API_URL}/home/images/product/${product.image_url}`,
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full items-center justify-center bg-gray-100">
                      <Ionicons
                        name="image-outline"
                        size={40}
                        color="#D1D5DB"
                      />
                    </View>
                  )}

                  {/* Favori Butonu (Kalp) */}
                  <TouchableOpacity
                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm z-10"
                    onPress={(e: GestureResponderEvent) => {
                      e.stopPropagation(); // Karta tıklanmasını engelle
                      console.log("Favorilere eklendi:", product.id);
                    }}
                  >
                    <Ionicons name="heart-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>

                  {/* Featured Badge */}
                  {product.is_featured && (
                    <View className="absolute top-2 left-2 bg-amber-500 px-2 py-1 rounded-full shadow-md">
                      <Text className="text-[9px] font-black text-white tracking-wide">
                        ⭐ ÖNE ÇIKAN
                      </Text>
                    </View>
                  )}

                  {/* Stok Durumu Badge */}
                  {product.stock_quantity === 0 ? (
                    <View className="absolute inset-0 bg-black/60 items-center justify-center">
                      <View className="bg-red-500 px-3 py-1.5 rounded-full shadow-lg">
                        <Text className="text-xs font-black text-white">
                          TÜKENDİ
                        </Text>
                      </View>
                    </View>
                  ) : product.low_stock_threshold &&
                    product.stock_quantity <= product.low_stock_threshold ? (
                    <View className="absolute top-4 left-1  bg-orange-500/70 px-2 py-1 rounded-full shadow-md">
                      <Text className="text-[9px] font-black text-white">
                        SON {product.stock_quantity}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Ürün Bilgileri */}
                <View className="p-3 flex-1 flex-col">
                  {/* Kategori ve Pet Type */}
                  <View className="flex-row items-center  justify-start mb-2 flex-wrap gap-1">
                    <View className="bg-teal-50  py-0.5 rounded-md">
                      <Text className="text-[9px] font-bold text-teal-600 uppercase tracking-wide">
                        {product.product_categories.name_tr}
                      </Text>
                    </View>
                  </View>

                  {/* Ürün Adı */}
                  <Text
                    className="text-sm font-bold text-gray-900 mb-2 leading-4 text-start"
                    numberOfLines={2}
                  >
                    {product.name}
                  </Text>

                  {/* Fiyat ve Aksiyonlar - En alta sabitlendi */}
                  <View className="flex-row items-center justify-between pt-2 border-t border-gray-100 mt-auto ">
                    <View>
                      <Text className="text-lg font-black text-teal-600">
                        {formatPrice(product.price)}
                      </Text>
                      {/* Stok bilgisi ufak şekilde fiyatın altında kalsın veya yanında */}
                      {product.stock_quantity > 0 && (
                        <Text className="text-[9px] text-gray-400 font-medium">
                          Stok: {product.stock_quantity}
                        </Text>
                      )}
                    </View>

                    {/* Sepete Ekle Butonu */}
                    <TouchableOpacity
                      className="bg-teal-500 rounded-full w-8 h-8 items-center justify-center shadow-sm shadow-teal-200"
                      onPress={(e: GestureResponderEvent) => {
                        e.stopPropagation();
                        console.log("Sepete eklendi:", product.id);
                      }}
                    >
                      <Fontisto
                        name="shopping-basket-add"
                        size={16}
                        color="white"
                        className="p-1"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Tüm Ürünleri Gör Butonu (opsiyonel) */}
        {products.length > 6 && (
          <TouchableOpacity
            className="mt-4 bg-teal-50 py-3 px-4 rounded-2xl flex-row items-center justify-center border border-teal-100"
            activeOpacity={0.8}
            onPress={() => {
              // TODO: Tüm ürünler sayfasına git
              console.log("Tüm ürünleri göster");
            }}
          >
            <Ionicons name="grid-outline" size={18} color="#4ECDC4" />
            <Text className="text-sm font-bold text-teal-600 ml-2">
              Tüm Ürünleri Gör
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
