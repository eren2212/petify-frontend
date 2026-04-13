import React from "react";
import { View, Text, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ProfileDetailView,
  BaseProfileData,
} from "@/components/profile/ProfileDetailView";
import { PetifySpinner } from "@/components/PetifySpinner";
import { useShopDetail } from "@/hooks/useHome";
import { PetShopProductList } from "@/components/petshop/PetShopProductList";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { conversationApi } from "@/lib/api";

/**
 * Pet Shop Detay Sayfası
 */
export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

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

  // Mesaj Gönder
  const handleSendMessage = async () => {
    try {
      const targetRoleId = shop.user_role_id;
      if (!targetRoleId) {
        Alert.alert("Hata", "Kullanıcı rol bilgisi bulunamadı.");
        return;
      }
      const response = await conversationApi.startConversation(targetRoleId);
      if (response.data && response.data.conversation_id) {
        router.push(`/(protected)/chat/${response.data.conversation_id}`);
      }
    } catch (error: any) {
      Alert.alert(
        "Hata",
        error.response?.data?.message || "Mesaj başlatılamadı."
      );
    }
  };

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
      onSendMessage={handleSendMessage}
      extraSections={
        <>
          <PetShopProductList shopId={shop.id} />
          <ReviewsSection
            reviewType="pet_shop"
            targetId={shop.id}
            targetName={shop.shop_name}
          />
        </>
      }
    />
  );
}
