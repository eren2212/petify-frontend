import { TouchableOpacity, Text, ActivityIndicator, Alert } from "react-native";
import { useDeletePetImage } from "../../hooks/useProfile";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

interface PetAvatarDeleteButtonProps {
  petId: string;
  hasImage: boolean;
}

export default function PetAvatarDeleteButton({
  petId,
  hasImage,
}: PetAvatarDeleteButtonProps) {
  const deletePetImageMutation = useDeletePetImage(petId);

  const handleDelete = () => {
    if (!hasImage) {
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
            deletePetImageMutation.mutate(undefined, {
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
      className="bg-white border-2 border-red-500 rounded-xl p-4 mb-4 flex-row items-center justify-center active:bg-red-50"
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
