import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../styles/theme/color";
import { useMyDoctors, useDeleteDoctor } from "../../../hooks";
import AddDoctorModal from "../../../components/doctor/AddDoctorModal";
import EditDoctorModal from "../../../components/doctor/EditDoctorModal";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { PetifySpinner } from "@/components/PetifySpinner";

export default function Doctors() {
  const [selectedGender, setSelectedGender] = useState<
    "all" | "male" | "female"
  >("all");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  // Gender filtresine göre veri çek
  const genderFilter =
    selectedGender === "all"
      ? undefined
      : (selectedGender as "male" | "female");
  const {
    data: doctors = [],
    isLoading,
    refetch,
    isRefetching,
  } = useMyDoctors(genderFilter);
  const { mutate: deleteDoctor, isPending: isDeleting } = useDeleteDoctor();

  // Filter options
  const filterOptions = [
    { value: "all", label: "Tümü", icon: "people" },
    { value: "male", label: "Erkek", icon: "male" },
    { value: "female", label: "Kadın", icon: "female" },
  ];

  // Doktor silme fonksiyonu
  const handleDeleteDoctor = (doctor: any) => {
    Alert.alert(
      "Doktoru Sil",
      `${doctor.first_name} ${doctor.last_name} isimli doktoru silmek istediğinize emin misiniz?`,
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            deleteDoctor(doctor.id, {
              onSuccess: () => {
                Toast.show({
                  type: "success",
                  text1: "Doktor başarıyla silindi!",
                  bottomOffset: 40,
                });
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

  // Doktor düzenleme fonksiyonu
  const handleEditDoctor = (doctor: any) => {
    setSelectedDoctor(doctor);
    setEditModalVisible(true);
  };

  // Header render fonksiyonu
  const renderHeader = () => (
    <View className="px-6 py-4 border-b border-gray-200">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-3xl font-bold text-text">Veterinerler</Text>
        <TouchableOpacity
          onPress={() => setAddModalVisible(true)}
          className="bg-primary rounded-full p-3"
          style={{
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Gender Filter */}
      <View className="flex-row">
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setSelectedGender(option.value as any)}
            className={`flex-1 py-3 rounded-xl mr-2 flex-row items-center justify-center ${
              selectedGender === option.value ? "bg-primary" : "bg-gray-100"
            }`}
          >
            <Ionicons
              name={option.icon as any}
              size={18}
              color={selectedGender === option.value ? "white" : "#6B7280"}
            />
            <Text
              className={`ml-2 font-semibold ${
                selectedGender === option.value ? "text-white" : "text-gray-600"
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Doktor sayısı */}
      {doctors.length > 0 && (
        <View className="pt-4">
          <Text className="text-gray-600 text-base items-center justify-center font-bold">
            Toplam {doctors.length} Veteriner Hekim Bulundu
          </Text>
        </View>
      )}
    </View>
  );

  // Empty state render fonksiyonu
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <PetifySpinner size={180} />
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-20 px-8">
        <View
          className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center mb-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Ionicons name="medkit-outline" size={64} color="#9CA3AF" />
        </View>
        <Text className="text-gray-900 text-xl font-bold mb-2 text-center">
          {selectedGender === "all"
            ? "Henüz Veteriner Bulunamadı"
            : selectedGender === "male"
              ? "Erkek Veteriner Bulunamadı"
              : "Kadın Veteriner Bulunamadı"}
        </Text>
        <Text className="text-gray-500 text-base text-center leading-6 mb-6">
          {selectedGender === "all"
            ? "Kliniğinize veteriner ekleyerek hizmet kalitesini artırın"
            : "Bu kategoride veteriner bulunmamaktadır"}
        </Text>
        {selectedGender === "all" && (
          <TouchableOpacity
            onPress={() => setAddModalVisible(true)}
            className="bg-primary px-8 py-4 rounded-full flex-row items-center"
            style={{
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Ionicons name="add-circle-outline" size={24} color="white" />
            <Text className="text-white font-bold text-base ml-2">
              İlk Veterineri Ekle
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Doktor kartı render fonksiyonu
  const renderDoctorCard = ({ item }: { item: any }) => {
    const photoUrl = item.photo_url
      ? `${process.env.EXPO_PUBLIC_API_URL}/petclinicdoctors/image/${item.photo_url}`
      : null;

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl p-4 mx-4 my-2  shadow-sm"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={() => router.push(`/(protected)/doctors/${item.id}`)}
      >
        <View className="flex-row items-center">
          {/* Doktor Fotoğrafı */}
          <View className="mr-4">
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                className="w-20 h-20 rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center">
                <Ionicons name="person" size={40} color="#9CA3AF" />
              </View>
            )}
          </View>

          {/* Doktor Bilgileri */}
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">
              {item.first_name} {item.last_name}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              {item.specialization}
            </Text>
            <View className="flex-row items-center mt-2">
              <Ionicons
                name={item.gender === "male" ? "male" : "female"}
                size={16}
                color={item.gender === "male" ? "#3B82F6" : "#EC4899"}
              />
              <Text className="text-sm text-gray-500 ml-1">
                {item.gender === "male" ? "Erkek" : "Kadın"}
              </Text>
              <Text className="text-sm text-gray-400 mx-2">•</Text>
              <Text className="text-sm text-gray-500">
                {item.experience_years} yıl deneyim
              </Text>
            </View>
          </View>

          {/* Aksiyonlar */}
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => handleEditDoctor(item)}
              className="w-10 h-10 items-center justify-center mr-2"
            >
              <Ionicons name="pencil" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteDoctor(item)}
              className="w-10 h-10 items-center justify-center"
              disabled={isDeleting}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Doctor List with FlatList */}
      <FlatList
        data={doctors}
        renderItem={renderDoctorCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />

      {/* Add Doctor Modal */}
      <AddDoctorModal
        visible={addModalVisible}
        onClose={() => {
          setAddModalVisible(false);
        }}
      />

      {/* Edit Doctor Modal */}
      {selectedDoctor && (
        <EditDoctorModal
          visible={editModalVisible}
          onClose={() => {
            setEditModalVisible(false);
            setSelectedDoctor(null);
          }}
          doctor={selectedDoctor}
        />
      )}
    </SafeAreaView>
  );
}
