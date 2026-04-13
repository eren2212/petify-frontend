import React from "react";
import { View, Text, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ProfileDetailView,
  BaseProfileData,
} from "@/components/profile/ProfileDetailView";
import { PetifySpinner } from "@/components/PetifySpinner";
import { useSitterDetail } from "@/hooks/useHome";
import { SitterServicesList } from "@/components/sitter/SitterServicesList";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { conversationApi } from "@/lib/api";

/**
 * Pet Sitter Detay Sayfası
 */
export default function SitterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // API'den sitter detayını çek
  const { data, isLoading, isError } = useSitterDetail(id || "");

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
          Bakıcı bilgileri yüklenirken bir hata oluştu.
        </Text>
      </View>
    );
  }

  const sitter = data.data;

  // Mesaj Gönder
  const handleSendMessage = async () => {
    try {
      const targetRoleId = sitter.user_role_id;
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
    id: sitter.id,
    name: sitter.display_name,
    description: sitter.bio || undefined,
    logo_url: sitter.logo_url,
    address: "", // Sitter'da address yok, boş bırakıyoruz
    latitude: 0, // Sitter'da konum yok
    longitude: 0,
    phone_number: sitter.phone_number,
    instagram_url: sitter.instagram_url || undefined,
    working_hours: undefined, // Sitter'da working_hours yok
  };

  return (
    <ProfileDetailView
      profileType="sitter"
      profileData={profileData}
      editable={false}
      logoImagePath="/home/images/sitter-profile/"
      onSendMessage={handleSendMessage}
      extraSections={
        <>
          <SitterServicesList sitterId={sitter.id} />
          <ReviewsSection
            reviewType="pet_sitter"
            targetId={sitter.id}
            targetName={sitter.display_name}
          />
        </>
      }
    />
  );
}
