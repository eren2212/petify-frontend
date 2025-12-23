import { TouchableOpacity, Text, ActivityIndicator, Alert } from "react-native";
import { useDeletePetImage, usePetImages } from "../../hooks/usePet";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

interface PetAvatarDeleteButtonProps {
  petId: string;
}

export default function PetAvatarDeleteButton({
  petId,
}: PetAvatarDeleteButtonProps) {
  const { data: petImages = [] } = usePetImages(petId);
  const deletePetImageMutation = useDeletePetImage(petId);

  // İlk resmi al (varsa) - Bu profil resmi olarak kabul ediliyor
  const firstImage = petImages.length > 0 ? petImages[0] : null;
  const hasImage = !!firstImage;

  const handleDelete = () => {
    if (!hasImage || !firstImage) {
      Alert.alert("Uyarı", "Silinecek resim bulunamadı");
      return;
    }

    Alert.alert(
      "Resmi Sil",
      "Bu hayvanın profil resmini silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            // İlk resmin ID'sini gönder
            deletePetImageMutation.mutate(firstImage.id, {
              onSuccess: () => {
                Toast.show({
                  type: "success",
                  text1: "Resim başarıyla silindi",
                  bottomOffset: 40,
                });
              },
              onError: (error: any) => {
                Toast.show({
                  type: "error",
                  text1:
                    error?.response?.data?.message ||
                    "Resim silinirken bir hata oluştu",
                  bottomOffset: 40,
                });
              },
            });
          },
        },
      ]
    );
  };

  if (!hasImage) return null;

  return (
    <TouchableOpacity
      onPress={handleDelete}
      disabled={deletePetImageMutation.isPending}
      className="bg-red-50 border border-red-500 rounded-xl p-4 mb-4 flex-row items-center justify-center active:bg-red-50"
    >
      {deletePetImageMutation.isPending ? (
        <ActivityIndicator size="small" color="#EF4444" />
      ) : (
        <>
          <Feather name="trash-2" size={20} color="#EF4444" />
          <Text className="text-red-500 font-semibold text-base ml-2">
            Profil Resmini Sil
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
