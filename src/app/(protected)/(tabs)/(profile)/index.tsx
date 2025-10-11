import { View, ActivityIndicator } from "react-native";
import { useCurrentUser, getActiveRole } from "../../../../hooks/useAuth";

// Rol bazlı profil component'lerini import et
import PetOwnerProfil from "../../../../components/profile/PetOwnerProfil";
// TODO: Diğer rol component'leri eklenecek
// import VeterinerProfil from "../../../../components/profile/VeterinerProfil";
// import PetSitterProfil from "../../../../components/profile/PetSitterProfil";
// import PetOtelProfil from "../../../../components/profile/PetOtelProfil";
// import PetShopProfil from "../../../../components/profile/PetShopProfil";

export default function ProfileScreen() {
  const { data: user, isLoading } = useCurrentUser();
  const activeRole = getActiveRole(user);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  // Rol bazlı profil component'ini render et
  const renderProfileComponent = () => {
    switch (activeRole?.role_type) {
      case "pet_owner":
        return <PetOwnerProfil />;
      // TODO: Diğer roller için component'ler eklenecek
      // case "pet_clinic":
      //   return <VeterinerProfil />;
      // case "pet_sitter":
      //   return <PetSitterProfil />;
      // case "pet_hotel":
      //   return <PetOtelProfil />;
      // case "pet_shop":
      //   return <PetShopProfil />;
      default:
        // Geçici olarak PetOwnerProfil göster (fallback)
        return <PetOwnerProfil />;
    }
  };

  return renderProfileComponent();
}
