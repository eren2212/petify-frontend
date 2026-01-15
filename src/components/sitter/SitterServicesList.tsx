import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import { SitterService, useSitterServices } from "@/hooks/useHome";
import { useCartHandler } from "@/hooks/useCartHandler";
import Toast from "react-native-toast-message";

interface SitterServicesListProps {
  sitterId: string;
}

/**
 * Sitter detay sayfasında hizmetleri listeleyen component
 */
export const SitterServicesList: React.FC<SitterServicesListProps> = ({
  sitterId,
}) => {
  const { data, isLoading, isError } = useSitterServices(sitterId);
  const { safeAddToCart } = useCartHandler();
  const handleAddToCart = (service: SitterService) => {
    if (!service) return;
    safeAddToCart({
      id: service.id,
      name: service.pet_sitter_service_categories.name_tr,
      price: service.price ?? 0,
      type: "service",
      image: service.pet_sitter_service_categories.icon_url,
      providerId: sitterId,
      priceType: service.price_type || "",
    });
    Toast.show({
      type: "success",
      text1: "Hizmet sepete eklendi!",
      bottomOffset: 40,
    });
  };
  // Loading state
  if (isLoading) {
    return (
      <View className="w-full px-5 mb-6">
        <View className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
          <ActivityIndicator size="small" color="#F59E0B" />
        </View>
      </View>
    );
  }

  // Error state veya hizmet yoksa gösterme
  if (isError || !data?.data || data.data.length === 0) {
    return null;
  }

  const services = data.data;

  // Fiyat formatlama
  const formatPrice = (price: number | null) => {
    if (!price) return "Fiyat Belirtilmemiş";
    return `${price.toFixed(2)} ₺`;
  };
  const getPriceTypeLabel = (priceType: string) => {
    switch (priceType) {
      case "hourly":
        return "Saatlik";
      case "daily":
        return "Günlük";
      default:
        return priceType;
    }
  };

  return (
    <View className="w-full px-5 mb-8">
      <View className="bg-white rounded-[32px] p-6 shadow-lg shadow-gray-200/50">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <View className="w-12 h-12 rounded-2xl bg-amber-50 items-center justify-center mr-4 border border-amber-100">
            <Ionicons name="paw" size={24} color="#F59E0B" />
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900 tracking-tight">
              Hizmetlerimiz
            </Text>
            <Text className="text-xs text-gray-400 mt-1 font-medium">
              Profesyonel Bakım Seçenekleri
            </Text>
          </View>
          <View className="ml-auto bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100/50">
            <Text className="text-xs font-bold text-gray-500">
              {services.length} Hizmet
            </Text>
          </View>
        </View>

        {/* Hizmetler Listesi */}
        <View>
          {services.map((service, index) => (
            <View
              key={service.id}
              className="bg-gray-50 rounded-3xl p-4 border border-gray-100"
              style={{
                marginBottom: index < services.length - 1 ? 16 : 0,
              }}
            >
              <View className="flex-row items-center">
                {/* Sol: Icon */}
                <View className="mr-4">
                  {service.pet_sitter_service_categories.icon_url ? (
                    <Image
                      source={{
                        uri: `${process.env.EXPO_PUBLIC_API_URL}/petsitterservices/category-icon/${service.pet_sitter_service_categories.icon_url}`,
                      }}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 20,
                      }}
                      resizeMode="contain"
                    />
                  ) : (
                    <View className="w-14 h-14 rounded-2xl bg-white items-center justify-center shadow-sm">
                      <Ionicons name="heart" size={26} color="#F59E0B" />
                    </View>
                  )}
                </View>

                {/* Orta: Hizmet Bilgileri */}
                <View className="flex-1">
                  {/* Hizmet Adı ve Badge */}
                  <View className="flex-row items-start justify-between mb-1">
                    <Text
                      className="text-base font-bold text-gray-900 flex-1 mr-2"
                      numberOfLines={1}
                    >
                      {service.pet_sitter_service_categories.name_tr}
                    </Text>
                  </View>

                  {/* Tip ve Fiyat Satırı */}
                  <View className="flex-row items-center mb-2">
                    {service.price_type && (
                      <View className="bg-indigo-50 px-2.5 py-1 rounded-lg mr-2 self-start">
                        <Text className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">
                          {getPriceTypeLabel(service.price_type)}
                        </Text>
                      </View>
                    )}

                    <Text className="text-lg font-black text-gray-900">
                      {formatPrice(service.price)}
                    </Text>
                  </View>

                  {/* Açıklama */}
                  {service.pet_sitter_service_categories.description && (
                    <Text
                      className="text-xs text-gray-500 leading-4"
                      numberOfLines={2}
                    >
                      {service.pet_sitter_service_categories.description}
                    </Text>
                  )}
                </View>

                {/* Sağ: Sepet İkonu */}
                <TouchableOpacity
                  className="w-12 h-12 rounded-full bg-amber-500 items-center justify-center ml-3 shadow-md shadow-amber-200"
                  activeOpacity={0.8}
                  onPress={() => {
                    // TODO: Sepete ekleme işlemi
                    handleAddToCart(service);
                  }}
                >
                  <Fontisto
                    name="shopping-basket-add"
                    size={18}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
