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
import { profileApi, petShopApi } from "../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { User } from "../../hooks/useAuth";
import AvatarDeleteButton from "../AvatarDeleteButton";
import { Feather, AntDesign, Ionicons } from "@expo/vector-icons";
import { usePetShopProfile } from "../../hooks/useProfile";
import { COLORS } from "../../styles/theme/color";
import MapLocationPicker from "../map/MapLocationPicker";

interface PetShopEditProfileProps {
  user: User | null | undefined;
}

interface FormData {
  full_name: string;
  phone_number: string;
  shop_name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  shop_phone_number: string;
  shop_email: string;
  website_url: string;
  instagram_url: string;
  working_hours: { day: string; start: string; end: string; closed: boolean }[];
}

const DAYS_OF_WEEK = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

export default function PetShopEditProfile({ user }: PetShopEditProfileProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Pet Shop profilini getir
  const { data: petShopProfileResponse } = usePetShopProfile();
  const petShopProfile = petShopProfileResponse?.data?.petShopProfile;

  const DEFAULT_LAT = 41.0082;
  const DEFAULT_LNG = 28.9784;
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [latitude, setLatitude] = useState(petShopProfile?.latitude || 41.0082);
  const [longitude, setLongitude] = useState(
    petShopProfile?.longitude || 28.9784
  );

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
      shop_name: "",
      description: "",
      address: "",
      latitude: DEFAULT_LAT,
      longitude: DEFAULT_LNG,
      shop_phone_number: "",
      shop_email: "",
      website_url: "",
      instagram_url: "",
      working_hours: DAYS_OF_WEEK.map((day) => ({
        day,
        start: "09:00",
        end: "18:00",
        closed: false,
      })),
    },
  });

  const address = watch("address");
  const workingHours = watch("working_hours");
  const latitudeValue = watch("latitude");
  const longitudeValue = watch("longitude");

  useEffect(() => {
    if (user?.profile && petShopProfile) {
      // Çalışma saatlerini parse et
      let parsedHours = DAYS_OF_WEEK.map((day) => ({
        day,
        start: "09:00",
        end: "18:00",
        closed: false,
      }));

      if (petShopProfile.working_hours) {
        parsedHours = petShopProfile.working_hours.map((wh: any) => {
          if (wh.hours === "Kapalı") {
            return {
              day: wh.day,
              start: "09:00",
              end: "18:00",
              closed: true,
            };
          }
          const [start, end] = wh.hours.split("-");
          return {
            day: wh.day,
            start: start || "09:00",
            end: end || "18:00",
            closed: false,
          };
        });
      }

      reset({
        full_name: user.profile.full_name || "",
        phone_number: user.profile.phone_number || "",
        shop_name: petShopProfile.shop_name || "",
        description: petShopProfile.description || "",
        address: petShopProfile.address || "",
        shop_phone_number: petShopProfile.phone_number || "",
        shop_email: petShopProfile.email || "",
        website_url: petShopProfile.website_url || "",
        instagram_url: petShopProfile.instagram_url || "",
        latitude: petShopProfile.latitude || DEFAULT_LAT, // ✅ Eklendi
        longitude: petShopProfile.longitude || DEFAULT_LNG,
        working_hours: parsedHours, // ✅ Form'a çalışma saatlerini ekliyoruz
      });

      setLatitude(petShopProfile.latitude || 41.0082);
      setLongitude(petShopProfile.longitude || 28.9784);
    }
  }, [user, petShopProfile, reset]);

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

  const updatePetShopMutation = useMutation({
    mutationFn: async (data: any) => {
      return await petShopApi.updatePetShopProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petshop", "profile"] });
    },
  });
  const isLocationSelected =
    latitude !== DEFAULT_LAT || longitude !== DEFAULT_LNG;

  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setValue("latitude", lat, { shouldDirty: true });
    setValue("longitude", lng, { shouldDirty: true });
  };

  const updateWorkingHour = (
    index: number,
    field: "start" | "end" | "closed",
    value: string | boolean
  ) => {
    const currentWorkingHours = workingHours || [];
    const newWorkingHours = [...currentWorkingHours];

    if (field === "closed") {
      newWorkingHours[index].closed = value as boolean;
    } else {
      newWorkingHours[index][field] = value as string;
    }

    // ✅ setValue ile form state'ini güncelliyoruz, shouldDirty: true ile isDirty aktif oluyor
    setValue("working_hours", newWorkingHours, { shouldDirty: true });
  };

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
      const formattedWorkingHours = workingHours.map((wh) => ({
        day: wh.day,
        hours: wh.closed ? "Kapalı" : `${wh.start}-${wh.end}`,
      }));

      const petShopUpdateData = {
        shop_name: data.shop_name.trim(),
        description: data.description.trim(),
        address: data.address.trim(),
        latitude: data.latitude,
        longitude: data.longitude,
        phone_number: data.shop_phone_number.trim(),
        email: data.shop_email.trim(),
        website_url: data.website_url.trim() || undefined,
        instagram_url: data.instagram_url.trim() || undefined,
        working_hours: formattedWorkingHours,
      };

      await updatePetShopMutation.mutateAsync(petShopUpdateData);

      Alert.alert("Başarılı", "Mağaza bilgileriniz güncellendi", [
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
    updateUserMutation.isPending || updatePetShopMutation.isPending;

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

        {/* Pet Shop Bilgileri Kartı */}
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-6">
            Mağaza Bilgileri
          </Text>

          {/* Mağaza Adı */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Mağaza Adı *
            </Text>
            <Controller
              control={control}
              name="shop_name"
              rules={{ required: "Mağaza adı zorunludur" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Mağaza adını girin"
                  className={`bg-gray-50 border ${
                    errors.shop_name ? "border-red-500" : "border-gray-200"
                  } rounded-xl px-4 py-3.5 text-gray-900 text-base`}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
            {errors.shop_name && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.shop_name.message}
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
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Mağazanız hakkında kısa bir açıklama"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-base"
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
          </View>

          {/* Konum */}
          <TouchableOpacity
            onPress={() => setShowMapPicker(true)}
            className="border border-gray-200 rounded-xl px-4 py-3 bg-white flex-row justify-between items-center"
          >
            <Text
              className={
                isLocationSelected
                  ? "text-green-600 font-semibold"
                  : "text-gray-400"
              }
              numberOfLines={1}
            >
              {isLocationSelected ? "✓ Konum Seçildi" : "Haritadan konum seçin"}
            </Text>
            <Ionicons name="location" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Adres *
            </Text>
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Adresinizi girin"
                  className={`bg-gray-50 border ${
                    errors.address ? "border-red-500" : "border-gray-200"
                  } rounded-xl px-4 py-3.5 text-gray-900 text-base`}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
            {errors.address && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.address.message}
              </Text>
            )}
          </View>

          {/* Mağaza Telefonu */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Mağaza Telefonu *
            </Text>
            <Controller
              control={control}
              name="shop_phone_number"
              rules={{
                required: "Mağaza telefonu zorunludur",
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
                    errors.shop_phone_number
                      ? "border-red-500"
                      : "border-gray-200"
                  } rounded-xl px-4 py-3.5 text-gray-900 text-base`}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
            {errors.shop_phone_number && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.shop_phone_number.message}
              </Text>
            )}
          </View>

          {/* Mağaza E-postası */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Mağaza E-postası *
            </Text>
            <Controller
              control={control}
              name="shop_email"
              rules={{
                required: "E-posta zorunludur",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Geçerli bir e-posta adresi girin",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="ornek@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className={`bg-gray-50 border ${
                    errors.shop_email ? "border-red-500" : "border-gray-200"
                  } rounded-xl px-4 py-3.5 text-gray-900 text-base`}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
            {errors.shop_email && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.shop_email.message}
              </Text>
            )}
          </View>

          {/* Website */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Website (Opsiyonel)
            </Text>
            <Controller
              control={control}
              name="website_url"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="https://www.ornek.com"
                  keyboardType="url"
                  autoCapitalize="none"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-base"
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
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

          {/* Çalışma Saatleri */}
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Çalışma Saatleri
            </Text>
            {workingHours.map((wh, index) => (
              <View key={wh.day} className="mb-3 bg-gray-50 rounded-xl p-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-medium text-gray-700 w-24">
                    {wh.day}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      updateWorkingHour(index, "closed", !wh.closed)
                    }
                    className={`px-3 py-1 rounded-lg ${
                      wh.closed ? "bg-red-100" : "bg-green-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        wh.closed ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {wh.closed ? "Kapalı" : "Açık"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {!wh.closed && (
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      value={wh.start}
                      onChangeText={(value) =>
                        updateWorkingHour(index, "start", value)
                      }
                      placeholder="09:00"
                      placeholderTextColor="#9CA3AF"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 bg-white text-center"
                    />
                    <Text className="text-gray-500">-</Text>
                    <TextInput
                      value={wh.end}
                      onChangeText={(value) =>
                        updateWorkingHour(index, "end", value)
                      }
                      placeholder="18:00"
                      placeholderTextColor="#9CA3AF"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 bg-white text-center"
                    />
                  </View>
                )}
              </View>
            ))}
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

        {/* Avatar Silme Butonu */}

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

      {/* Map Location Picker */}
      <MapLocationPicker
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLatitude={latitude}
        initialLongitude={longitude}
        initialAddress={address || ""}
      />
    </>
  );
}
