import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  usePetDetail,
  useUpdatePet,
  usePetImages,
} from "../../../hooks/useProfile";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import PetAvatarDeleteButton from "../../../components/pet/PetAvatarDeleteButton";
import PetImagePicker from "../../../components/pet/PetImagePicker";

interface FormData {
  name: string;
  weight_kg: string;
  description: string;
}

export default function PetEditScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const petId = Array.isArray(id) ? id[0] : id;

  // Pet detayını çek
  const { data: pet, isLoading: isPetLoading } = usePetDetail(petId);

  // Pet resimlerini çek
  const { data: petImages = [] } = usePetImages(petId);

  // Update mutation
  const updateMutation = useUpdatePet(petId);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      weight_kg: "",
      description: "",
    },
  });

  // Pet verisi geldiğinde form'u doldur
  useEffect(() => {
    if (pet) {
      reset({
        name: pet.name || "",
        weight_kg: pet.weight_kg ? pet.weight_kg.toString() : "",
        description: pet.description || "",
      });
    }
  }, [pet, reset]);

  const onSubmit = (data: FormData) => {
    const updateData: {
      name?: string;
      weight_kg?: number;
      description?: string;
    } = {};

    // İsim (zorunlu)
    if (data.name.trim()) {
      updateData.name = data.name.trim();
    }

    // Kilo (opsiyonel)
    if (data.weight_kg.trim()) {
      updateData.weight_kg = parseFloat(data.weight_kg);
    }

    // Açıklama (opsiyonel)
    if (data.description.trim()) {
      updateData.description = data.description.trim();
    }

    updateMutation.mutate(updateData, {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Hayvan bilgileri başarıyla güncellendi",
          bottomOffset: 40,
        });
        router.back();
      },
      onError: (error: any) => {
        Toast.show({
          type: "error",
          text1:
            error?.response?.data?.message ||
            "Bilgiler güncellenirken bir hata oluştu",
          bottomOffset: 40,
        });
      },
    });
  };

  if (isPetLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="text-gray-600 mt-4 font-medium">Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-500 text-lg text-center font-medium">
            Hayvan bilgileri yüklenemedi
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profil Resmi Değiştirme */}
        <PetImagePicker
          petId={petId}
          currentImageUrl={
            petImages.length > 0
              ? `${process.env.EXPO_PUBLIC_API_URL}/profile/pet/image/${petImages[0].image_url}`
              : null
          }
        />

        {/* Pet Resmi Silme Butonu */}
        <PetAvatarDeleteButton petId={petId} />

        {/* Form Kartı */}
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-6">
            Hayvan Bilgileri
          </Text>

          {/* İsim */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Hayvan Adı
            </Text>
            <Controller
              control={control}
              name="name"
              rules={{
                required: "Hayvan adı zorunludur",
                minLength: {
                  value: 2,
                  message: "En az 2 karakter olmalıdır",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Hayvan adını girin"
                  className={`bg-gray-50 border ${
                    errors.name ? "border-red-500" : "border-gray-200"
                  } rounded-xl px-4 py-3.5 text-gray-900 text-base`}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
            {errors.name && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.name.message}
              </Text>
            )}
          </View>

          {/* Kilo */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Kilo (kg)
            </Text>
            <Controller
              control={control}
              name="weight_kg"
              rules={{
                pattern: {
                  value: /^[0-9]+\.?[0-9]*$/,
                  message: "Geçerli bir kilo değeri girin (örn: 5.5)",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={(text) => {
                    // Sadece sayı ve nokta girişine izin ver
                    const numericValue = text.replace(/[^0-9.]/g, "");
                    onChange(numericValue);
                  }}
                  placeholder="Kilosunu girin (örn: 5.5)"
                  keyboardType="decimal-pad"
                  className={`bg-gray-50 border ${
                    errors.weight_kg ? "border-red-500" : "border-gray-200"
                  } rounded-xl px-4 py-3.5 text-gray-900 text-base`}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
            {errors.weight_kg && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.weight_kg.message}
              </Text>
            )}
          </View>

          {/* Açıklama */}
          <View className="mb-2">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Açıklama / Notlar
            </Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Hayvanınız hakkında notlar ekleyin..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className={`bg-gray-50 border ${
                    errors.description ? "border-red-500" : "border-gray-200"
                  } rounded-xl px-4 py-3.5 text-gray-900 text-base`}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
            {errors.description && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </Text>
            )}
          </View>
        </View>

        {/* Güncelle Butonu */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={
            !isDirty ||
            updateMutation.isPending ||
            Object.keys(errors).length > 0
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
              <Text className="text-xl mr-2">
                <Feather
                  name="save"
                  size={24}
                  color={
                    isDirty && Object.keys(errors).length === 0
                      ? "white"
                      : "gray"
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
    </SafeAreaView>
  );
}
