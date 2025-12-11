import { TouchableOpacity, Alert, ActivityIndicator, View } from "react-native";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../styles/theme/color";
import { pickImageFromLibrary } from "@/utils/imagePicker";
import { useUploadPetOtelLogo } from "@/hooks/usePetOtel";

interface PetOtelLogoPickerProps {
  currentLogoUrl?: string | null;
  className?: string;
}

export default function PetOtelLogoPicker({
  currentLogoUrl,
  className = "w-36 h-36",
}: PetOtelLogoPickerProps) {
  const uploadLogoMutation = useUploadPetOtelLogo();

  const handlePickLogo = async () => {
    try {
      // Resim seç
      const imageUri = await pickImageFromLibrary([1, 1]); // Kare format

      if (!imageUri) return;

      // Onay al
      Alert.alert(
        "Logo Değiştir",
        "Logo'yu değiştirmek istediğinize emin misiniz?",
        [
          {
            text: "İptal",
            style: "cancel",
          },
          {
            text: "Değiştir",
            onPress: async () => {
              try {
                await uploadLogoMutation.mutateAsync(imageUri);
                Alert.alert("Başarılı", "Logo başarıyla güncellendi");
              } catch (error: any) {
                Alert.alert(
                  "Hata",
                  error.response?.data?.message ||
                    "Logo yüklenirken bir hata oluştu"
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Logo seçme hatası:", error);
      Alert.alert("Hata", "Resim seçilirken bir hata oluştu");
    }
  };

  const getLogoUrl = () => {
    if (!currentLogoUrl) return null;
    return `${process.env.EXPO_PUBLIC_API_URL}/petotel/profile/logo/${currentLogoUrl}`;
  };

  return (
    <TouchableOpacity
      onPress={handlePickLogo}
      disabled={uploadLogoMutation.isPending}
      className={`relative ${className}`}
    >
      <View
        className={`${className} rounded-full bg-orange-100 items-center justify-center overflow-hidden`}
      >
        {uploadLogoMutation.isPending ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : getLogoUrl() ? (
          <Image
            source={{ uri: getLogoUrl()! }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="storefront" size={64} color={COLORS.primary} />
        )}
      </View>

      {/* Kamera ikonu overlay */}
      {!uploadLogoMutation.isPending && (
        <View className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full items-center justify-center border-4 border-white">
          <Ionicons name="camera" size={20} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );
}
