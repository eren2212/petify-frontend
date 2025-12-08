import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PetSitterServiceList } from "../../../components/petsitterservice";
import { useCurrentUser, getActiveRole } from "../../../hooks/useAuth";
import { COLORS } from "../../../styles/theme/color";
import { Ionicons } from "@expo/vector-icons";

export default function Services() {
  const { data: user, isLoading } = useCurrentUser();
  const activeRole = getActiveRole(user);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="text-gray-500 mt-4">Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No active role or role not approved
  if (!activeRole || activeRole.status !== "approved") {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={80} color="#D1D5DB" />
          <Text className="text-gray-900 font-bold text-xl mt-4 text-center">
            Hizmet Ekleme Yetkisi Yok
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            Hizmet ekleyebilmek için onaylanmış bir rol'e sahip olmanız
            gerekmektedir.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render based on role type
  const renderServiceList = () => {
    switch (activeRole.role_type) {
      case "pet_sitter":
        return <PetSitterServiceList />;

      case "pet_hotel":
        // TODO: Pet Hotel Service List component
        return (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="business-outline" size={80} color="#D1D5DB" />
            <Text className="text-gray-900 font-bold text-xl mt-4">
              Pet Hotel Hizmetleri
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              Pet Hotel hizmet yönetimi yakında eklenecek
            </Text>
          </View>
        );

      case "pet_clinic":
        // TODO: Pet Clinic Service List component
        return (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="medical-outline" size={80} color="#D1D5DB" />
            <Text className="text-gray-900 font-bold text-xl mt-4">
              Veteriner Hizmetleri
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              Veteriner hizmet yönetimi yakında eklenecek
            </Text>
          </View>
        );

      default:
        return (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="alert-circle-outline" size={80} color="#D1D5DB" />
            <Text className="text-gray-900 font-bold text-xl mt-4 text-center">
              Bu rol için hizmet yönetimi desteklenmiyor
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              {activeRole.role_type} rolü için hizmet ekleme özelliği
              bulunmamaktadır.
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {renderServiceList()}
    </SafeAreaView>
  );
}

