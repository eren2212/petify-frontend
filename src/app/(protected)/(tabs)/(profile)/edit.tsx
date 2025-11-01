// app/(protected)/(tabs)/(profile)/edit.tsx
import { View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCurrentUser, getActiveRole } from "../../../../hooks/useAuth";
import BackHeader from "../../../../components/BackHeader";

// Component'leri import et
import PetOwnerEdit from "../../../../components/profile/PetOwnerEdit";
import VeterinerEdit from "../../../../components/profile/VeterinerEdit";
import PetSitterEdit from "../../../../components/profile/PetSitterEdit";
import PetOtelEdit from "../../../../components/profile/PetOtelEdit";
import PetShopEdit from "../../../../components/profile/PetShopEdit";

export default function Edit() {
  const { data: user, isLoading } = useCurrentUser();
  const activeRole = getActiveRole(user);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Rol bazlı component render
  const renderEditForm = () => {
    switch (activeRole?.role_type) {
      case "pet_owner":
        return <PetOwnerEdit user={user} />;
      case "pet_clinic":
        return <VeterinerEdit user={user} />;
      case "pet_sitter":
        return <PetSitterEdit user={user} />;
      case "pet_hotel":
        return <PetOtelEdit user={user} />;
      case "pet_shop":
        return <PetShopEdit user={user} />;
      default:
        return <PetOwnerEdit user={user} />; // Fallback
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {renderEditForm()}
    </SafeAreaView>
  );
}
