import React from "react";
import { View, Text, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ProfileDetailView,
  BaseProfileData,
} from "@/components/profile/ProfileDetailView";
import { PetifySpinner } from "@/components/PetifySpinner";
import { useHotelDetail } from "@/hooks/useHome";
import { HotelServicesList } from "@/components/hotel/HotelServicesList";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { conversationApi } from "@/lib/api";

/**
 * Pet Otel Detay Sayfası
 */
export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // API'den otel detayını çek
  const { data, isLoading, isError } = useHotelDetail(id || "");

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
          Otel bilgileri yüklenirken bir hata oluştu.
        </Text>
      </View>
    );
  }

  const hotel = data.data;

  // Mesaj Gönder
  const handleSendMessage = async () => {
    try {
      const targetRoleId = hotel.user_role_id;
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
    id: hotel.id,
    name: hotel.hotel_name,
    description: hotel.description || undefined,
    logo_url: hotel.logo_url,
    address: hotel.address,
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    phone_number: hotel.phone_number,
    emergency_phone: hotel.emergency_phone || undefined,
    email: hotel.email || undefined,
    website_url: hotel.website_url || undefined,
    instagram_url: hotel.instagram_url || undefined,
    working_hours: hotel.working_hours || undefined,
  };

  return (
    <ProfileDetailView
      profileType="hotel"
      profileData={profileData}
      editable={false}
      logoImagePath="/home/images/hotel-logo/"
      onSendMessage={handleSendMessage}
      extraSections={
        <>
          <HotelServicesList hotelId={hotel.id} />
          <ReviewsSection
            reviewType="pet_hotel"
            targetId={hotel.id}
            targetName={hotel.hotel_name}
          />
        </>
      }
    />
  );
}
