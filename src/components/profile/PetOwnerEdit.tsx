import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { profileApi } from "../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { User } from "../../hooks/useAuth";
import AvatarDeleteButton from "../AvatarDeleteButton";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";

interface PetOwnerEditProps {
  user: User | null | undefined;
}

export default function PetOwnerEdit({ user }: PetOwnerEditProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [initialFullName, setInitialFullName] = useState("");
  const [initialPhoneNumber, setInitialPhoneNumber] = useState("");

  // User verisi geldiğinde state'leri başlat
  useEffect(() => {
    if (user?.profile) {
      const name = user.profile.full_name || "";
      const phone = user.profile.phone_number || "";
      setFullName(name);
      setPhoneNumber(phone);
      setInitialFullName(name);
      setInitialPhoneNumber(phone);
    }
  }, [user]);

  // Değişiklik kontrolü
  const hasChanges =
    fullName.trim() !== initialFullName ||
    phoneNumber.trim() !== initialPhoneNumber;

  // Profil güncelleme mutation
  const updateMutation = useMutation({
    mutationFn: profileApi.updateInformation,
    onSuccess: (response) => {
      // Backend'den gelen güncel profil verisini al
      const updatedProfile = response.data.profile;

      // Cache'i DOĞRUDAN güncelle (anında yansıma için)
      queryClient.setQueryData(["auth", "currentUser"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          profile: {
            ...oldData.profile,
            ...updatedProfile,
          },
        };
      });

      // Ek güvence için invalidate et
      queryClient.invalidateQueries({ queryKey: ["auth", "currentUser"] });

      Alert.alert("Başarılı", "Profil bilgileriniz güncellendi", [
        {
          text: "Tamam",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert(
        "Hata",
        error.response?.data?.message || "Profil güncellenirken bir hata oluştu"
      );
    },
  });

  const handleUpdate = () => {
    if (!hasChanges) return;

    const updateData: { full_name?: string; phone_number?: string } = {};

    if (fullName.trim() !== initialFullName) {
      updateData.full_name = fullName.trim();
    }

    if (phoneNumber.trim() !== initialPhoneNumber) {
      updateData.phone_number = phoneNumber.trim();
    }

    updateMutation.mutate(updateData);
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Kullanıcı Bilgileri Kartı */}
      <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <Text className="text-lg font-bold text-gray-900 mb-6">
          Profil Bilgileri
        </Text>

        {/* İsim Soyisim */}
        <View className="mb-5">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            İsim Soyisim
          </Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Adınızı ve soyadınızı girin"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-base"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Telefon Numarası */}
        <View className="mb-2">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Telefon Numarası
          </Text>
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Telefon numaranızı girin"
            keyboardType="phone-pad"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-base"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* E-posta (Değiştirilemez) */}
      <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          E-posta Adresi
        </Text>
        <View className="bg-gray-100 rounded-xl px-4 py-3.5 flex-row items-center justify-between">
          <Text className="text-gray-500 text-base">{user?.email}</Text>
          <AntDesign name="lock" size={24} color="black" />
        </View>
        <Text className="text-xs text-gray-400 mt-2">
          E-posta adresi değiştirilemez
        </Text>
      </View>

      {/* Avatar Silme Butonu (Ortak Component) */}
      <AvatarDeleteButton hasAvatar={!!user?.profile?.avatar_url} />

      {/* Güncelle Butonu */}
      <TouchableOpacity
        onPress={handleUpdate}
        disabled={!hasChanges || updateMutation.isPending}
        className={`rounded-xl p-4 flex-row items-center justify-center ${
          hasChanges && !updateMutation.isPending
            ? "bg-blue-500"
            : "bg-gray-300"
        }`}
      >
        {updateMutation.isPending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Text
              className={`text-xl mr-2 ${
                hasChanges ? "text-white" : "text-gray-500"
              }`}
            >
              <Feather name="save" size={24} color="black" />
            </Text>
            <Text
              className={`font-bold text-base ${
                hasChanges ? "text-white" : "text-gray-500"
              }`}
            >
              Güncelle
            </Text>
          </>
        )}
      </TouchableOpacity>

      {!hasChanges && (
        <Text className="text-center text-gray-400 text-xs mt-3">
          Değişiklik yapmadınız
        </Text>
      )}
    </ScrollView>
  );
}
