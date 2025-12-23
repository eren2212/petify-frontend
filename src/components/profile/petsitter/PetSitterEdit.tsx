import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { profileApi, petShopApi, petSitterApi } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { User } from "@/hooks/useAuth";
import AvatarDeleteButton from "@/components/AvatarDeleteButton";
import { Feather, AntDesign, Ionicons } from "@expo/vector-icons";
import { usePetShopProfile, usePetSitterProfile } from "@/hooks/useProfile";
import { COLORS } from "@/styles/theme/color";
import MapLocationPicker from "@/components/map/MapLocationPicker";

interface PetSitterEditProfileProps {
  user: User | null | undefined;
}

interface FormData {
  full_name: string;
  display_name: string;
  experience_years: number;
  phone_number: string;
  bio: string;
  instagram_url: string;
}

export default function PetSitterEditProfile({
  user,
}: PetSitterEditProfileProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Pet Siter profilini getir
  const { data: petSitterProfileResponse } = usePetSitterProfile();
  const petSitterProfile = petSitterProfileResponse?.data?.petSitterProfile;

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      full_name: "",
      phone_number: "",
      display_name: "",
      experience_years: 0,
      bio: "",
      instagram_url: "",
    },
  });

  useEffect(() => {
    if (user?.profile && petSitterProfile) {
      // Çalışma saatlerini parse et
      reset({
        full_name: user.profile.full_name || "",
        phone_number: user.profile.phone_number || "",
        display_name: petSitterProfile.display_name || "",
        experience_years: petSitterProfile.experience_years || 0,
        bio: petSitterProfile.bio || "",
        instagram_url: petSitterProfile.instagram_url || "",
      });
    }
  }, [user, petSitterProfile, reset]);

  const updateUserMutation = useMutation({
    mutationFn: profileApi.updateInformation,
    onSuccess: (response) => {
      const updatedProfile = response.data.profile;

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

      queryClient.invalidateQueries({ queryKey: ["auth", "currentUser"] });
    },
  });

  const updatePetSitterProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await petSitterApi.updatePetSitterProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petsitter", "profile"] });
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Kullanıcı bilgilerini güncelle
      const userUpdateData: { full_name?: string; phone_number?: string } = {};

      if (data.full_name.trim()) {
        userUpdateData.full_name = data.full_name.trim();
      }

      if (data.phone_number.trim()) {
        userUpdateData.phone_number = data.phone_number.trim();
      }

      await updateUserMutation.mutateAsync(userUpdateData);

      // Pet Shop profil bilgilerini güncelle
      const petSitterUpdateData = {
        display_name: data.display_name.trim(),
        bio: data.bio.trim(),
        experience_years: data.experience_years,
        phone_number: data.phone_number.trim(),
        instagram_url: data.instagram_url.trim() || undefined,
      };

      await updatePetSitterProfileMutation.mutateAsync(petSitterUpdateData);

      Alert.alert("Başarılı", "Pet Siter bilgileriniz güncellendi", [
        {
          text: "Tamam",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Hata",
        error.response?.data?.message ||
          "Mağaza bilgileri güncellenirken bir hata oluştu"
      );
    }
  };

  const isLoading =
    updateUserMutation.isPending || updatePetSitterProfileMutation.isPending;

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Kullanıcı Bilgileri Kartı */}
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-6">
            Kişisel Bilgiler
          </Text>

          {/* İsim Soyisim */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              İsim Soyisim
            </Text>
            <Controller
              control={control}
              name="full_name"
              rules={{
                required: "İsim soyisim zorunludur",
                minLength: {
                  value: 3,
                  message: "En az 3 karakter olmalıdır",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Adınızı ve soyadınızı girin"
                  className={`bg-gray-50 border ${
                    errors.full_name ? "border-red-500" : "border-gray-200"
                  } rounded-xl px-4 py-3.5 text-gray-900 text-base`}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
            {errors.full_name && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.full_name.message}
              </Text>
            )}
          </View>

          {/* Telefon Numarası */}
          <View className="mb-2">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Telefon Numarası
            </Text>
            <Controller
              control={control}
              name="phone_number"
              rules={{
                required: "Telefon numarası zorunludur",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Geçerli bir 10 haneli telefon numarası girin",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, "");
                    onChange(numericValue);
                  }}
                  placeholder="Telefon numaranızı girin"
                  keyboardType="phone-pad"
                  maxLength={10}
                  className={`bg-gray-50 border ${
                    errors.phone_number ? "border-red-500" : "border-gray-200"
                  } rounded-xl px-4 py-3.5 text-gray-900 text-base`}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
            {errors.phone_number && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.phone_number.message}
              </Text>
            )}
          </View>
        </View>

        {/* Pet Siter Bilgileri Kartı */}
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-6">
            Pet Siter Bilgileri
          </Text>

          {/* Mağaza Adı */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Pet Siter Adı *
            </Text>
            <Controller
              control={control}
              name="display_name"
              rules={{ required: "Pet Siter adı zorunludur" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Mağaza adını girin"
                  className={`bg-gray-50 border ${
                    errors.display_name ? "border-red-500" : "border-gray-200"
                  } rounded-xl px-4 py-3.5 text-gray-900 text-base`}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
            {errors.display_name && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.display_name.message}
              </Text>
            )}
          </View>

          {/* Açıklama */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </Text>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Pet Siteriniz hakkında kısa bir açıklama"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-base"
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
          </View>

          {/* Pet Siter Telefonu */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Pet Siter Telefonu *
            </Text>
            <Controller
              control={control}
              name="phone_number"
              rules={{
                required: "Pet Siter telefonu zorunludur",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Geçerli bir 10 haneli telefon numarası girin",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, "");
                    onChange(numericValue);
                  }}
                  placeholder="5xxxxxxxxx"
                  keyboardType="phone-pad"
                  maxLength={10}
                  className={`bg-gray-50 border ${
                    errors.phone_number ? "border-red-500" : "border-gray-200"
                  } rounded-xl px-4 py-3.5 text-gray-900 text-base`}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
            {errors.phone_number && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.phone_number.message}
              </Text>
            )}
          </View>

          {/* Instagram */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Instagram (Opsiyonel)
            </Text>
            <Controller
              control={control}
              name="instagram_url"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="https://instagram.com/kullaniciadi"
                  keyboardType="url"
                  autoCapitalize="none"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-base"
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
          </View>
        </View>

        {/* E-posta (Değiştirilemez) */}
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Kullanıcı E-posta Adresi
          </Text>
          <View className="bg-gray-100 rounded-xl px-4 py-3.5 flex-row items-center justify-between">
            <Text className="text-gray-500 text-base">{user?.email}</Text>
            <AntDesign name="lock" size={24} color="black" />
          </View>
          <Text className="text-xs text-gray-400 mt-2">
            E-posta adresi değiştirilemez
          </Text>
        </View>

        {/* Güncelle Butonu */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={!isDirty || isLoading || Object.keys(errors).length > 0}
          className={`rounded-xl p-4 flex-row items-center justify-center ${
            isDirty && !isLoading && Object.keys(errors).length === 0
              ? "bg-blue-500"
              : "bg-gray-300"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Feather
                name="save"
                size={24}
                color={
                  isDirty && Object.keys(errors).length === 0 ? "white" : "gray"
                }
              />
              <Text
                className={`font-bold text-base ml-2 ${
                  isDirty && Object.keys(errors).length === 0
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                Güncelle
              </Text>
            </>
          )}
        </TouchableOpacity>

        {!isDirty && (
          <Text className="text-center text-gray-400 text-xs mt-3">
            Değişiklik yapmadınız
          </Text>
        )}

        {Object.keys(errors).length > 0 && (
          <Text className="text-center text-red-500 text-xs mt-3">
            Lütfen hataları düzeltin
          </Text>
        )}
      </ScrollView>
    </>
  );
}
