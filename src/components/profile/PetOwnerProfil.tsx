import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useCurrentUser, getActiveRole } from "../../hooks/useAuth";
import { useMyPets } from "../../hooks/useProfile";
import AvatarPicker from "../AvatarPicker";
import AddPetModal from "../pet/AddPetModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Pet } from "../../types/type";

export default function ProfileScreen() {
  const { signOut } = useAuthStore();
  const router = useRouter();

  // TanStack Query'den user bilgisini al
  const { data: user, isLoading } = useCurrentUser();

  // Aktif rolü al
  const activeRole = getActiveRole(user);

  // Pet listesini al
  const { data: pets = [], isLoading: petsLoading } = useMyPets();

  // Modal state
  const [isAddPetModalVisible, setIsAddPetModalVisible] = useState(false);

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
            Profili Düzenle
          </Text>
        </TouchableOpacity>

        {/* My Pets Başlık */}
        <View className="w-full px-6 mt-4 mb-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold text-gray-900">Hayvanlarım</Text>
            <TouchableOpacity
              onPress={() => setIsAddPetModalVisible(true)}
              className="bg-green-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">+ Hayvan Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Pets Liste */}
        {petsLoading ? (
          <ActivityIndicator size="small" color="#8B5CF6" />
        ) : pets.length > 0 ? (
          <FlatList
            horizontal
            data={pets}
            keyExtractor={(item: Pet) => item.id}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            renderItem={({ item }: { item: Pet }) => (
              <TouchableOpacity
                onPress={() => console.log("Pet detail:", item.id)}
                className="bg-white rounded-2xl p-4 mb-4 mr-4 shadow-sm"
                style={{ width: 160, height: 160 }}
              >
                <View className="flex-1 items-center justify-center bg-gray-100 rounded-xl mb-2">
                  <Text className="text-4xl">🐾</Text>
                </View>
                <Text className="text-base font-bold text-gray-900 text-center">
                  {item.name}
                </Text>
                <Text className="text-xs text-gray-500 text-center">
                  {item.breed || "Unknown"}
                </Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View className="w-11/12 py-8 px-6 bg-gray-100 rounded-xl">
            <Text className="text-gray-500 text-center">
              Henüz hayvan eklenmemiş
            </Text>
          </View>
        )}

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

      {/* Add Pet Modal */}
      <AddPetModal
        visible={isAddPetModalVisible}
        onClose={() => setIsAddPetModalVisible(false)}
      />
    </SafeAreaView>
  );
}
