import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { useCurrentUser, getActiveRole } from "../../hooks/useAuth";
import AvatarPicker from "../AvatarPicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { signOut } = useAuthStore();
  const router = useRouter();
  // TanStack Query'den user bilgisini al
  const { data: user, isLoading } = useCurrentUser();

  // Aktif rolü al
  const activeRole = getActiveRole(user);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="text-text mt-4">Yükleniyor...</Text>
      </View>
    );
  }

  // Rol tipini Türkçe'ye çevir
  const getRoleLabel = (roleType: string | undefined) => {
    if (!roleType) return "Kullanıcı";

    const roleMap: Record<string, string> = {
      pet_owner: "Evcil Hayvan Sahibi",
      pet_clinic: "Veteriner Kliniği",
      pet_sitter: "Evcil Hayvan Bakıcısı",
      pet_hotel: "Pet Otel",
      pet_shop: "Pet Shop",
    };
    return roleMap[roleType] || "Kullanıcı";
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ alignItems: "center", paddingVertical: 32 }}
      >
        {/* Avatar */}
        <View className="mb-6">
          <AvatarPicker
            currentAvatarUrl={user?.profile?.avatar_url}
            className="w-36 h-36"
          />
        </View>

        {/* İsim */}
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          {user?.profile?.full_name || "Kullanıcı"}
        </Text>

        {/* Rol */}
        <Text className="text-base text-gray-500 mb-1">
          {getRoleLabel(activeRole?.role_type)}
        </Text>

        {/* E-posta */}
        <Text className="text-sm text-gray-400 mb-8">{user?.email || "-"}</Text>

        {/* Profili Düzenle Butonu */}
        <TouchableOpacity
          onPress={() => router.push("/edit")}
          className="bg-blue-500 px-16 py-4 rounded-full w-11/12 shadow-lg active:bg-blue-600 mb-6"
        >
          <Text className="text-white font-bold text-center text-base">
            Edit Profile
          </Text>
        </TouchableOpacity>

        {/* Çıkış Butonu */}
        <Pressable
          onPress={() => signOut()}
          className="bg-red-500 px-16 py-4 rounded-full w-11/12 shadow-lg active:bg-red-600 mt-4"
        >
          <Text className="text-white font-bold text-center text-base">
            Çıkış Yap
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
