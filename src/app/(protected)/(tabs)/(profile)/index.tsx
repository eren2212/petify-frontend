import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useAuthStore } from "../../../../stores/authStore";
import { useCurrentUser, getActiveRole } from "../../../../hooks/useAuth";

export default function ProfileScreen() {
  const { signOut } = useAuthStore();

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

  return (
    <View className="flex-1 justify-center items-center bg-background">
      <Text className="text-text text-2xl font-bold mb-4">Profil</Text>

      <Text className="text-text mb-2">Email: {user?.email}</Text>
      <Text className="text-text mb-2">İsim: {user?.profile?.full_name}</Text>
      <Text className="text-text mb-2">
        Telefon: {user?.profile?.phone_number || "Yok"}
      </Text>
      <Text className="text-text mb-4">
        Rol: {activeRole?.role_type || "Yok"}
      </Text>
      <Text className="text-text mb-8">
        Durum: {activeRole?.status || "Yok"}
      </Text>

      <Pressable
        onPress={() => signOut()}
        className="bg-red-500 px-8 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Çıkış Yap</Text>
      </Pressable>
    </View>
  );
}
