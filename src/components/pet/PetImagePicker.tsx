import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { pickImageFromLibrary } from "../../utils/imagePicker";
import { petApi } from "../../lib/api";
import Toast from "react-native-toast-message";
import { useQueryClient } from "@tanstack/react-query";

interface PetImagePickerProps {
  petId: string;
  currentImageUrl?: string | null;
}

export default function PetImagePicker({
  petId,
  currentImageUrl,
}: PetImagePickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const handlePickImage = async () => {
    try {
      // Resim seç (kare format)
      const imageUri = await pickImageFromLibrary([1, 1]);
      if (!imageUri) return;

      setIsUploading(true);

      // Backend'e yükle (eski resmi otomatik siler)
      await petApi.uploadPetImage(petId, imageUri);

      // Cache'i yenile
      queryClient.invalidateQueries({ queryKey: ["pets", "detail", petId] });
      queryClient.invalidateQueries({ queryKey: ["pets", "images", petId] });
      queryClient.invalidateQueries({ queryKey: ["pets", "myPets"] });

      Toast.show({
        type: "success",
        text1: "Resim başarıyla güncellendi",
        bottomOffset: 40,
      });
    } catch (error: any) {
      console.error("Resim yükleme hatası:", error);
      Toast.show({
        type: "error",
        text1:
          error?.response?.data?.message || "Resim yüklenirken hata oluştu",
        bottomOffset: 40,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
      <Text className="text-lg font-bold text-gray-900 mb-4">
        Hayvan Profil Resmi
      </Text>

      <View className="items-center">
        {/* Resim Önizleme */}
        <View className="w-32 h-32 rounded-2xl bg-gray-100 mb-4 overflow-hidden border-2 border-gray-200">
          {currentImageUrl ? (
            <Image
              source={{ uri: currentImageUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Feather name="camera" size={40} color="#9CA3AF" />
            </View>
          )}
        </View>

        {/* Değiştir Butonu */}
        <TouchableOpacity
          onPress={handlePickImage}
          disabled={isUploading}
          className={`rounded-xl px-6 py-3 flex-row items-center ${
            isUploading ? "bg-gray-300" : "bg-blue-500"
          }`}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Feather
                name={currentImageUrl ? "edit-2" : "upload"}
                size={18}
                color="white"
              />
              <Text className="text-white font-semibold text-base ml-2">
                {currentImageUrl ? "Resmi Değiştir" : "Resim Yükle"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text className="text-xs text-gray-400 mt-2 text-center">
          {currentImageUrl
            ? "Yeni resim seçtiğinizde eski resim otomatik silinir"
            : "Hayvanınızın profil resmini yükleyin"}
        </Text>
      </View>
    </View>
  );
}
