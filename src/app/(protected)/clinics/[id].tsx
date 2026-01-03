import React from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  ProfileDetailView,
  BaseProfileData,
} from "@/components/profile/ProfileDetailView";
import { PetifySpinner } from "@/components/PetifySpinner";
import { useClinicDetail } from "@/hooks/useHome";
import { ClinicDoctorsList } from "@/components/clinic/ClinicDoctorsList";
import { ClinicServicesList } from "@/components/clinic/ClinicServicesList";

/**
 * Klinik Detay Sayfası
 * Ana sayfadan veya listeden tıklanınca buraya gelir
 */
export default function ClinicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // API'den klinik detayını çek
  const { data, isLoading, isError } = useClinicDetail(id || "");

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
          Klinik bilgileri yüklenirken bir hata oluştu.
        </Text>
      </View>
    );
  }

  const clinic = data.data;

  // BaseProfileData formatına çevir
  const profileData: BaseProfileData = {
    id: clinic.id,
    name: clinic.clinic_name,
    description: clinic.description || undefined,
    logo_url: clinic.logo_url,
    address: clinic.address,
    latitude: clinic.latitude,
    longitude: clinic.longitude,
    phone_number: clinic.phone_number,
    emergency_phone: clinic.emergency_phone || undefined,
    email: clinic.email || undefined,
    website_url: clinic.website_url || undefined,
    instagram_url: clinic.instagram_url || undefined,
    working_hours: clinic.working_hours || undefined,
  };

  return (
    <ProfileDetailView
      profileType="clinic"
      profileData={profileData}
      editable={false}
      logoImagePath="/home/images/clinic-logo/"
      extraSections={
        <>
          {/* Hizmetler */}
          <ClinicServicesList clinicId={clinic.id} />
          {/* Veteriner Hekimler */}
          <ClinicDoctorsList clinicId={clinic.id} />
        </>
      }
    />
  );
}
