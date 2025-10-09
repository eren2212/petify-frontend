import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useAuthStore } from "../../../../stores/authStore";
import { useCurrentUser, getActiveRole } from "../../../../hooks/useAuth";
import AvatarPicker from "../../../../components/AvatarPicker";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="items-center py-8 px-6"
      >
        {/* Avatar */}
        <View className="mb-6">
          <AvatarPicker
            currentAvatarUrl={user?.profile?.avatar_url}
            className="w-32 h-32"
          />
          <Text className="text-center text-gray-500 text-xs mt-2">
            Tıklayarak değiştir
          </Text>
        </View>

        {/* Profil Bilgileri */}
        <View className="w-full bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-2xl font-bold text-text mb-6 text-center">
            Profil Bilgileri
          </Text>

          <View className="space-y-4">
            <View className="border-b border-gray-100 pb-3">
              <Text className="text-xs text-gray-500 mb-1">İsim Soyisim</Text>
              <Text className="text-base text-text font-medium">
                {user?.profile?.full_name || "-"}
              </Text>
            </View>

            <View className="border-b border-gray-100 pb-3">
              <Text className="text-xs text-gray-500 mb-1">E-posta</Text>
              <Text className="text-base text-text font-medium">
                {user?.email || "-"}
              </Text>
            </View>

            <View className="border-b border-gray-100 pb-3">
              <Text className="text-xs text-gray-500 mb-1">Telefon</Text>
              <Text className="text-base text-text font-medium">
                {user?.profile?.phone_number || "Belirtilmemiş"}
              </Text>
            </View>

            <View className="border-b border-gray-100 pb-3">
              <Text className="text-xs text-gray-500 mb-1">Rol</Text>
              <Text className="text-base text-text font-medium capitalize">
                {activeRole?.role_type?.replace("_", " ") || "Belirtilmemiş"}
              </Text>
            </View>

            <View>
              <Text className="text-xs text-gray-500 mb-1">Durum</Text>
              <View className="flex-row items-center">
                <View
                  className={`w-2 h-2 rounded-full mr-2 ${
                    activeRole?.status === "approved"
                      ? "bg-green-500"
                      : activeRole?.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                  }`}
                />
                <Text className="text-base text-text font-medium capitalize">
                  {activeRole?.status === "approved"
                    ? "Onaylandı"
                    : activeRole?.status === "pending"
                      ? "Onay Bekliyor"
                      : "Belirtilmemiş"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Çıkış Butonu */}
        <Pressable
          onPress={() => signOut()}
          className="bg-red-500 px-12 py-4 rounded-xl w-full max-w-xs shadow-lg active:bg-red-600"
        >
          <Text className="text-white font-bold text-center text-base">
            Çıkış Yap
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
