// components/AvatarDeleteButton.tsx
import { TouchableOpacity, Text, ActivityIndicator, Alert } from "react-native";
import { useDeleteAvatar } from "../hooks/useProfile";
import { Feather } from "@expo/vector-icons";

interface AvatarDeleteButtonProps {
  hasAvatar: boolean;
}

export default function AvatarDeleteButton({
  hasAvatar,
}: AvatarDeleteButtonProps) {
  const deleteAvatarMutation = useDeleteAvatar();

  const handleDelete = () => {
    if (!hasAvatar) {
      Alert.alert("Uyarı", "Silinecek profil resmi bulunamadı");
      return;
    }

    Alert.alert(
      "Profil Resmini Sil",
      "Profil resminizi silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => deleteAvatarMutation.mutate(),
        },
      ]
    );
  };

  if (!hasAvatar) return null;

  return (
    <TouchableOpacity
      onPress={handleDelete}
      disabled={deleteAvatarMutation.isPending}
      className="bg-white border-2 border-red-500 rounded-xl p-4 mb-4 flex-row items-center justify-center active:bg-red-50"
    >
      {deleteAvatarMutation.isPending ? (
        <ActivityIndicator size="small" color="#EF4444" />
      ) : (
        <>
          <Feather name="trash-2" size={24} color="black" />
          <Text className="text-red-500 font-semibold text-base">
            Profil Resmini Sil
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
