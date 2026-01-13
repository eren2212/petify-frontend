import React from "react";
import { View, Text, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHotelServices } from "@/hooks/useHome";

interface HotelServicesListProps {
  hotelId: string;
}

/**
 * Hotel detay sayfasında hizmetleri listeleyen component
 */
export const HotelServicesList: React.FC<HotelServicesListProps> = ({
  hotelId,
}) => {
  const { data, isLoading, isError } = useHotelServices(hotelId);

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

  return (
    <View className="w-full px-6 mb-6">
      <View className="bg-white rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
            <Ionicons name="bed" size={20} color="blue" />
          </View>
          <Text className="text-lg font-bold text-gray-900">Hizmetlerimiz</Text>
          <View className="ml-auto bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-xs font-semibold text-blue-600">
              {services.length}
            </Text>
          </View>
        </View>

        {/* Hizmetler Grid */}
        <View className="flex-row flex-wrap -mx-1 justify-center items-center">
          {services.map((service) => (
            <View key={service.id} className="w-1/2 px-1 mb-3 ">
              <View className="bg-gray-50 rounded-xl p-4 border border-gray-100 items-center justify-center h-44">
                {/* Icon */}
                <Image
                  source={{
                    uri: `${process.env.EXPO_PUBLIC_API_URL}/petotelservices/category-icon/${service.pet_hotel_service_categories.icon_url}`,
                  }}
                  style={{
                    width: 60,
                    height: 60,
                    marginBottom: 8,
                  }}
                  resizeMode="contain"
                />

                {/* Hizmet Adı */}
                <Text
                  className="text-sm font-bold text-gray-900 mb-1 text-center"
                  numberOfLines={2}
                >
                  {service.pet_hotel_service_categories.name_tr}
                </Text>

                {/* Açıklama (varsa) */}
                {service.pet_hotel_service_categories.description && (
                  <Text
                    className="text-xs text-gray-500 text-center"
                    numberOfLines={2}
                  >
                    {service.pet_hotel_service_categories.description}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
