import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useClinicDoctors } from "@/hooks/useHome";

interface ClinicDoctorsListProps {
  clinicId: string;
}

/**
 * Klinik detay sayfasında veterinerleri listeleyen component
 */
export const ClinicDoctorsList: React.FC<ClinicDoctorsListProps> = ({
  clinicId,
}) => {
  const { data, isLoading, isError } = useClinicDoctors(clinicId);

  // Doktor fotoğrafı URL'i oluştur
  const getDoctorPhotoUrl = (photoUrl: string | null) => {
    if (!photoUrl) return null;
    return `${process.env.EXPO_PUBLIC_API_URL}/petclinicdoctors/image/${photoUrl}`;
  };

  // Doktor kartına tıklama
  const handleDoctorPress = (doctorId: string) => {
    router.push(`/(protected)/doctors/${doctorId}?clinicId=${clinicId}` as any);
  };

  // Loading state
  if (isLoading) {
    return (
      <View className="w-full px-6 mb-6">
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <ActivityIndicator size="small" color="#9333EA" />
        </View>
      </View>
    );
  }

  // Error state veya doktor yoksa gösterme
  if (isError || !data?.data || data.data.length === 0) {
    return null;
  }

  const doctors = data.data;

  return (
    <View className="w-full px-6 mb-6">
      <View className="bg-white rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
            <Ionicons name="people" size={20} color="#8B5CF6" />
          </View>
          <Text className="text-lg font-bold text-gray-900">
            Veteriner Hekimlerimiz
          </Text>
          <View className="ml-auto bg-purple-100 px-3 py-1 rounded-full">
            <Text className="text-xs font-semibold text-purple-600">
              {doctors.length}
            </Text>
          </View>
        </View>

        {/* Doktorlar Listesi */}
        <View className="space-y-3">
          {doctors.map((doctor, index) => (
            <TouchableOpacity
              key={doctor.id}
              onPress={() => handleDoctorPress(doctor.id)}
              activeOpacity={0.7}
              className={`flex-row items-center p-4 rounded-xl border border-gray-100 ${
                index < doctors.length - 1 ? "mb-3" : ""
              }`}
            >
              {/* Doktor Fotoğrafı */}
              {getDoctorPhotoUrl(doctor.photo_url) ? (
                <Image
                  source={{ uri: getDoctorPhotoUrl(doctor.photo_url)! }}
                  className="w-16 h-16 rounded-2xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center">
                  <Ionicons name="person" size={28} color="#9CA3AF" />
                </View>
              )}

              {/* Doktor Bilgileri */}
              <View className="flex-1 ml-4">
                <Text className="text-base font-bold text-gray-900">
                  {doctor.first_name} {doctor.last_name}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  {doctor.specialization}
                </Text>
                <View className="flex-row items-center mt-2">
                  <Ionicons name="briefcase" size={14} color="#6B7280" />
                  <Text className="text-xs text-gray-500 ml-1">
                    {doctor.experience_years} yıl deneyim
                  </Text>
                  <View
                    className={`ml-3 px-2 py-0.5 rounded-full ${
                      doctor.gender === "male" ? "bg-blue-100" : "bg-pink-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        doctor.gender === "male"
                          ? "text-blue-600"
                          : "text-pink-600"
                      }`}
                    >
                      {doctor.gender === "male" ? "Erkek" : "Kadın"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Arrow */}
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};
