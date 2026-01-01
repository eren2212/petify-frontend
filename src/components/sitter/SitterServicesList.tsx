import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSitterServices } from "@/hooks/useHome";

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

  // Loading state
  if (isLoading) {
    return (
      <View className="w-full px-6 mb-6">
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <ActivityIndicator size="small" color="gray" />
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
    <View className="w-full px-6 mb-6">
      <View className="bg-white rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
            <Ionicons name="paw" size={20} color="#F59E0B" />
          </View>
          <Text className="text-lg font-bold text-gray-900">Hizmetlerimiz</Text>
          <View className="ml-auto bg-amber-100 px-3 py-1 rounded-full">
            <Text className="text-xs font-semibold text-amber-600">
              {services.length}
            </Text>
          </View>
        </View>

        {/* Hizmetler Listesi - Alt Alta Dikdörtgen */}
        <View>
          {services.map((service, index) => (
            <View
              key={service.id}
              className="bg-amber-50 rounded-xl p-4 border border-amber-100"
              style={{
                marginBottom: index < services.length - 1 ? 12 : 0,
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
                        width: 50,
                        height: 50,
                      }}
                      resizeMode="contain"
                    />
                  ) : (
                    <View className="w-12 h-12 rounded-full bg-amber-200 items-center justify-center">
                      <Ionicons name="heart" size={24} color="#F59E0B" />
                    </View>
                  )}
                </View>

                {/* Orta: Hizmet Bilgileri */}
                <View className="flex-1">
                  {/* Hizmet Adı */}
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-base font-bold text-gray-900 mb-1"
                      numberOfLines={1}
                    >
                      {service.pet_sitter_service_categories.name_tr}
                    </Text>
                    {service.price_type && (
                      <View className="bg-red-500 px-2 py-1 rounded-full ml-2">
                        <Text className="text-xs font-semibold text-white">
                          {getPriceTypeLabel(service.price_type)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Açıklama (varsa) */}
                  {service.pet_sitter_service_categories.description && (
                    <Text
                      className="text-xs text-gray-500 mb-2"
                      numberOfLines={2}
                    >
                      {service.pet_sitter_service_categories.description}
                    </Text>
                  )}

                  {/* Fiyat */}
                  <View className="flex-row items-center">
                    <Ionicons name="cash-outline" size={14} color="#F59E0B" />
                    <Text className="text-sm font-semibold text-amber-600 ml-1 ">
                      {formatPrice(service.price)}
                    </Text>
                  </View>
                </View>

                {/* Sağ: Sepet İkonu */}
                <TouchableOpacity
                  className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center ml-3"
                  activeOpacity={0.7}
                  onPress={() => {
                    // TODO: Sepete ekleme işlemi
                    console.log("Sepete eklendi:", service.id);
                  }}
                >
                  <Ionicons name="cart-outline" size={20} color="#F59E0B" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
