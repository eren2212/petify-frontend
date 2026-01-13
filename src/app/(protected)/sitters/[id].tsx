import React from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  ProfileDetailView,
  BaseProfileData,
} from "@/components/profile/ProfileDetailView";
import { PetifySpinner } from "@/components/PetifySpinner";
import { useSitterDetail } from "@/hooks/useHome";
import { SitterServicesList } from "@/components/sitter/SitterServicesList";

/**
 * Pet Sitter Detay Sayfası
 */
export default function SitterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

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
      extraSections={
        <>
          <SitterServicesList sitterId={sitter.id} />
        </>
      }
    />
  );
}
