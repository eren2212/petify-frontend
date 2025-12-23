import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../styles/theme/color";
import { useDoctorDetail, useDeleteDoctor } from "../../../hooks";
import EditDoctorModal from "../../../components/doctor/EditDoctorModal";
import Toast from "react-native-toast-message";
import { PetifySpinner } from "@/components/PetifySpinner";

export default function DoctorDetail() {
  const { id } = useLocalSearchParams();
  const doctorId = Array.isArray(id) ? id[0] : id;

  const { data: doctor, isLoading, refetch } = useDoctorDetail(doctorId);
  const { mutate: deleteDoctor, isPending: isDeleting } = useDeleteDoctor();
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Doktor silme fonksiyonu
  const handleDeleteDoctor = () => {
    Alert.alert(
      "Doktoru Sil",
      `${doctor?.first_name} ${doctor?.last_name} isimli doktoru silmek istediğinize emin misiniz?`,
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            deleteDoctor(doctorId, {
              onSuccess: () => {
                Toast.show({
                  type: "success",
                  text1: "Doktor başarıyla silindi!",
                  bottomOffset: 40,
                });
                router.back();
              },
              onError: (error: any) => {
                Toast.show({
                  type: "error",
                  text1:
                    error?.response?.data?.message ||
                    "Doktor silinirken bir hata oluştu",
                  bottomOffset: 40,
                });
              },
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <PetifySpinner size={180} />
        </View>
      </SafeAreaView>
    );
  }

  if (!doctor) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Ionicons name="person-outline" size={64} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg mt-4">Doktor bulunamadı</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-primary px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const photoUrl = doctor.photo_url
    ? `${process.env.EXPO_PUBLIC_API_URL}/petclinicdoctors/image/${doctor.photo_url}`
    : null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Hero Section - Photo & Basic Info */}
        <View className="px-6 pt-8 pb-6 bg-white">
          {/* Profile Photo with soft shadow */}
          <View className="items-center mb-6">
            {photoUrl ? (
              <View
                className="rounded-3xl overflow-hidden"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.1,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Image
                  source={{ uri: photoUrl }}
                  className="w-40 h-40"
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View
                className="w-40 h-40 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.1,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Ionicons name="person" size={72} color="#9CA3AF" />
              </View>
            )}
          </View>

          {/* Name & Title */}
          <View className="items-center">
            <Text className="text-3xl font-bold text-gray-900 text-center">
              {doctor.first_name} {doctor.last_name}
            </Text>
            <View className="bg-primary/10 px-4 py-2 rounded-full mt-3">
              <Text
                className="text-base font-semibold"
                style={{ color: COLORS.primary }}
              >
                {doctor.specialization}
              </Text>
            </View>
          </View>
        </View>

        {/* Bio Section */}
        {doctor.bio && (
          <View
            className="bg-white mx-6 mt-6 rounded-3xl p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
                <Ionicons name="document-text" size={20} color="#8B5CF6" />
              </View>
              <Text className="text-lg font-bold text-gray-900">Hakkında</Text>
            </View>
            <Text className="text-base text-gray-700 leading-7">
              {doctor.bio}
            </Text>
          </View>
        )}

        {/* Info Cards Grid */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Detaylı Bilgiler
          </Text>

          <View className="flex-row flex-wrap -mx-2">
            {/* Name Card */}
            <View className="w-1/2 px-2 mb-4">
              <View
                className="bg-white rounded-2xl p-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mb-3">
                  <Ionicons name="person-outline" size={20} color="#3B82F6" />
                </View>
                <Text className="text-xs text-gray-500 mb-1">İsim Soyisim</Text>
                <Text
                  className="text-sm font-bold text-gray-900"
                  numberOfLines={2}
                >
                  {doctor.first_name} {doctor.last_name}
                </Text>
              </View>
            </View>

            {/* Specialization Card */}
            <View className="w-1/2 px-2 mb-4">
              <View
                className="bg-white rounded-2xl p-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="w-10 h-10 bg-red-100 rounded-xl items-center justify-center mb-3">
                  <Ionicons name="medical" size={20} color="#EF4444" />
                </View>
                <Text className="text-xs text-gray-500 mb-1">Uzmanlık</Text>
                <Text
                  className="text-sm font-bold text-gray-900"
                  numberOfLines={2}
                >
                  {doctor.specialization}
                </Text>
              </View>
            </View>

            {/* Experience Card */}
            <View className="w-1/2 px-2 mb-4">
              <View
                className="bg-white rounded-2xl p-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="w-10 h-10 bg-green-100 rounded-xl items-center justify-center mb-3">
                  <Ionicons name="briefcase" size={20} color="#10B981" />
                </View>
                <Text className="text-xs text-gray-500 mb-1">Deneyim</Text>
                <Text className="text-sm font-bold text-gray-900">
                  {doctor.experience_years} Yıl
                </Text>
              </View>
            </View>

            {/* Gender Card */}
            <View className="w-1/2 px-2 mb-4">
              <View
                className="bg-white rounded-2xl p-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center mb-3 ${
                    doctor.gender === "male" ? "bg-blue-100" : "bg-pink-100"
                  }`}
                >
                  <Ionicons
                    name={doctor.gender === "male" ? "male" : "female"}
                    size={20}
                    color={doctor.gender === "male" ? "#3B82F6" : "#EC4899"}
                  />
                </View>
                <Text className="text-xs text-gray-500 mb-1">Cinsiyet</Text>
                <Text className="text-sm font-bold text-gray-900">
                  {doctor.gender === "male" ? "Erkek" : "Kadın"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-6 mt-6">
          <View className="flex-row space-x-3 gap-4">
            {/* Edit Button */}
            <TouchableOpacity
              onPress={() => setEditModalVisible(true)}
              className="flex-1 bg-primary/10 border border-primary rounded-2xl py-4 flex-row items-center justify-center"
              style={{
                borderColor: COLORS.primary,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Ionicons name="pencil" size={20} color={COLORS.primary} />
              <Text
                className="font-bold text-base ml-2"
                style={{ color: COLORS.primary }}
              >
                Düzenle
              </Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              onPress={handleDeleteDoctor}
              disabled={isDeleting}
              className="flex-1 bg-red-50 border border-red-500 rounded-2xl py-4 flex-row items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {isDeleting ? (
                <ActivityIndicator color="#EF4444" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  <Text className="text-red-500 font-bold text-base ml-2">
                    Sil
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Doctor Modal */}
      {doctor && (
        <EditDoctorModal
          visible={editModalVisible}
          onClose={() => {
            setEditModalVisible(false);
            refetch();
          }}
          doctor={doctor}
        />
      )}
    </SafeAreaView>
  );
}
