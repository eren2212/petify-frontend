import React from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  ProfileDetailView,
  BaseProfileData,
} from "@/components/profile/ProfileDetailView";
import { PetifySpinner } from "@/components/PetifySpinner";
import { useShopDetail } from "@/hooks/useHome";
import { PetShopProductList } from "@/components/petshop/PetShopProductList";

/**
 * Pet Shop Detay Sayfası
 */
export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // API'den shop detayını çek
  const { data, isLoading, isError } = useShopDetail(id || "");

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <PetifySpinner size={180} />
      </View>
    );
  }

  // Error state
  if (isError || !data?.data) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-lg text-gray-600 text-center">
          Mağaza bilgileri yüklenirken bir hata oluştu.
        </Text>
      </View>
    );
  }

  const shop = data.data;

  // BaseProfileData formatına çevir
  const profileData: BaseProfileData = {
    id: shop.id,
    name: shop.shop_name,
    description: shop.description || undefined,
    logo_url: shop.logo_url,
    address: shop.address,
    latitude: shop.latitude,
    longitude: shop.longitude,
    phone_number: shop.phone_number,
    email: shop.email || undefined,
    website_url: shop.website_url || undefined,
    instagram_url: shop.instagram_url || undefined,
    working_hours: shop.working_hours || undefined,
  };

  return (
    <ProfileDetailView
      profileType="shop"
      profileData={profileData}
      editable={false}
      logoImagePath="/home/images/shop-logo/"
      extraSections={<PetShopProductList shopId={shop.id} />}
    />
  );
}
