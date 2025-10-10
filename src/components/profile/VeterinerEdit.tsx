import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { profileApi } from "../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { User } from "../../hooks/useAuth";
import AvatarDeleteButton from "../AvatarDeleteButton";
import { Feather, AntDesign } from "@expo/vector-icons";

interface VeterinerEditProps {
  user: User | null | undefined;
}

interface FormData {
  full_name: string;
  phone_number: string;
  clinic_name: string;
}

export default function VeterinerEdit({ user }: VeterinerEditProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      full_name: "",
      phone_number: "",
      clinic_name: "",
    },
  });

  useEffect(() => {
    if (user?.profile) {
      reset({
        full_name: user.profile.full_name || "",
        phone_number: user.profile.phone_number || "",
        clinic_name: "", // TODO: Backend'den geldiğinde ekle
      });
    }
  }, [user, reset]);

  const updateMutation = useMutation({
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

  const onSubmit = (data: FormData) => {
    const updateData: any = {};

    if (data.full_name.trim()) {
      updateData.full_name = data.full_name.trim();
    }

    if (data.phone_number.trim()) {
      updateData.phone_number = data.phone_number.trim();
    }

    if (data.clinic_name.trim()) {
      updateData.clinic_name = data.clinic_name.trim();
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
          Veteriner Profil Bilgileri
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
              pattern: {
                value: /^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/,
                message: "Sadece harf girebilirsiniz",
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
        <View className="mb-5">
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

        {/* Klinik Adı - Veteriner'e Özel */}
        <View className="mb-2">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Klinik Adı
          </Text>
          <Controller
            control={control}
            name="clinic_name"
            rules={{
              minLength: {
                value: 2,
                message: "En az 2 karakter olmalıdır",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Klinik adını girin"
                className={`bg-gray-50 border ${
                  errors.clinic_name ? "border-red-500" : "border-gray-200"
                } rounded-xl px-4 py-3.5 text-gray-900 text-base`}
                placeholderTextColor="#9CA3AF"
              />
            )}
          />
          {errors.clinic_name && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.clinic_name.message}
            </Text>
          )}
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
        onPress={handleSubmit(onSubmit)}
        disabled={
          !isDirty || updateMutation.isPending || Object.keys(errors).length > 0
        }
        className={`rounded-xl p-4 flex-row items-center justify-center ${
          isDirty &&
          !updateMutation.isPending &&
          Object.keys(errors).length === 0
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
                isDirty && Object.keys(errors).length === 0
                  ? "text-white"
                  : "text-gray-500"
              }`}
            >
              <Feather
                name="save"
                size={24}
                color={
                  isDirty && Object.keys(errors).length === 0 ? "white" : "gray"
                }
              />
            </Text>
            <Text
              className={`font-bold text-base ${
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
  );
}
