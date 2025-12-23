import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { useState } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { useCurrentUser, getActiveRole } from "../../../hooks/useAuth";
import {
  usePetShopProfile,
  useCreatePetShopProfile,
  useUploadPetShopLogo,
  useDeletePetShopLogo,
  usePetSitterProfile,
  useCreatePetSitterProfile,
  useUploadPetSitterLogo,
  useDeletePetSitterLogo,
} from "../../../hooks/useProfile";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import { COLORS } from "@/styles/theme/color";
import AddPetSitterProfileModal, {
  PetSitterProfileData,
} from "@/components/profile/petsitter/AddPetSitterProfileModal";
import PetSitterLogoPicker from "@/components/profile/petsitter/PetSitterLogoPicker";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { PetifySpinner } from "@/components/PetifySpinner";

export default function PetSitterProfil() {
  const { signOut } = useAuthStore();
  const router = useRouter();

  // TanStack Query'den user bilgisini al
  const { data: user, isLoading: userLoading } = useCurrentUser();

  // Pet Shop profilini al
  const { data: petSitterProfileResponse, isLoading: profileLoading } =
    usePetSitterProfile();

  // Aktif rolü al
  const activeRole = getActiveRole(user);

  // Mutations
  const createProfileMutation = useCreatePetSitterProfile();
  const uploadLogoMutation = useUploadPetSitterLogo();
  const deleteLogoMutation = useDeletePetSitterLogo();

  // Modal state
  const [isAddProfileModalVisible, setIsAddProfileModalVisible] =
    useState(false);

  // Pet shop profile data
  const petSitterProfile = petSitterProfileResponse?.data?.petSitterProfile;

  // Logo URL oluştur
  const getLogoUrl = () => {
    if (!petSitterProfile?.profile_image_url) return null;
    return `${process.env.EXPO_PUBLIC_API_URL}/petsitter/profile/image/${petSitterProfile.profile_image_url}`;
  };

  // Profil oluşturma handler
  const handleCreateProfile = async (
    profileData: PetSitterProfileData,
    logoUri: string | null
  ) => {
    try {
      // 1. Profili oluştur
      const response = await createProfileMutation.mutateAsync(profileData);

      // 2. Eğer logo seçilmişse, logo'yu yükle
      if (logoUri) {
        try {
          await uploadLogoMutation.mutateAsync(logoUri);
          Alert.alert(
            "Başarılı",
            "Pet sitter profili ve logo başarıyla oluşturuldu!"
          );
        } catch (logoError) {
          Alert.alert(
            "Uyarı",
            "Profil oluşturuldu ancak logo yüklenirken hata oluştu. Logo'yu daha sonra ekleyebilirsiniz."
          );
        }
      } else {
        Alert.alert("Başarılı", "Pet sitter profili başarıyla oluşturuldu!");
      }

      setIsAddProfileModalVisible(false);
    } catch (error: any) {
      Alert.alert(
        "Hata",
        error.response?.data?.message || "Profil oluşturulurken bir hata oluştu"
      );
    }
  };

  // Logo silme handler
  const handleDeleteLogo = () => {
    Alert.alert("Logo Sil", "Logo'yu silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteLogoMutation.mutateAsync();
            Alert.alert("Başarılı", "Logo başarıyla silindi");
          } catch (error: any) {
            Alert.alert(
              "Hata",
              error.response?.data?.message || "Logo silinirken bir hata oluştu"
            );
          }
        },
      },
    ]);
  };

  // Telefon arama
  const handleCallPhone = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };
  // Instagram açma
  const handleOpenInstagram = (url: string) => {
    Linking.openURL(url);
  };

  if (userLoading || profileLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <PetifySpinner size={180} />
      </View>
    );
  }

  // Eğer profil yoksa, profil oluşturma ekranını göster
  if (!petSitterProfile) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {/* Logout Button */}
        <View
          className="absolute top-12 right-5 z-10"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Pressable
            onPress={() => signOut()}
            className="bg-white w-12 h-12 rounded-full items-center justify-center"
          >
            <MaterialIcons name="logout" size={24} color={COLORS.primary} />
          </Pressable>
        </View>

        {/* Content */}
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-32 h-32 bg-orange-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="person" size={64} color={COLORS.primary} />
          </View>

          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Pet Siter Profili Oluştur
          </Text>
          <Text className="text-base text-gray-500 mb-8 text-center">
            Pet siterinizin bilgilerini ekleyerek müşterilerinize ulaşın
          </Text>

          <TouchableOpacity
            onPress={() => setIsAddProfileModalVisible(true)}
            className="bg-primary px-16 py-4 rounded-full shadow-lg"
          >
            <Text className="text-white font-bold text-center text-base">
              Profil Oluştur
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Profile Modal */}
        <AddPetSitterProfileModal
          visible={isAddProfileModalVisible}
          onClose={() => setIsAddProfileModalVisible(false)}
          onSubmit={handleCreateProfile}
          isLoading={createProfileMutation.isPending}
        />
      </SafeAreaView>
    );
  }

  // Profil varsa, profil detaylarını göster
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ alignItems: "center", paddingVertical: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logout Button */}
        <View
          className="absolute top-4 right-5 z-10"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Pressable
            onPress={() => signOut()}
            className="bg-white w-12 h-12 rounded-full items-center justify-center"
          >
            <MaterialIcons name="logout" size={24} color={COLORS.primary} />
          </Pressable>
        </View>
        {/* Logo - Tıklanabilir Logo Picker */}
        <View className="mb-4 relative">
          <PetSitterLogoPicker
            currentLogoUrl={petSitterProfile.profile_image_url}
            className="w-36 h-36"
          />

          {/* Logo Sil Butonu */}
          {getLogoUrl() && (
            <TouchableOpacity
              onPress={handleDeleteLogo}
              className="absolute -bottom-0.5 -right-0.5 bg-red-500 w-10 h-10 rounded-full items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="trash" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Mağaza Adı */}
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          {petSitterProfile.display_name}
        </Text>

        {/* E-posta */}
        <Text className="text-sm text-gray-400 mb-4">{user?.email || "-"}</Text>

        {/* Profili Düzenle Butonu */}
        <TouchableOpacity
          onPress={() => router.push("/edit")}
          className="bg-primary/10 px-16 py-5 rounded-2xl shadow-lg border-2 border-primary mb-6"
        >
          <Text className="text-primary font-bold text-center text-base">
            Profili Düzenle
          </Text>
        </TouchableOpacity>

        {/* About Section */}
        {petSitterProfile.bio && (
          <View className="w-full px-6 mb-6">
            <View className="bg-white rounded-2xl p-6 shadow-sm">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Hakkında
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                {petSitterProfile.bio}
              </Text>
            </View>
          </View>
        )}

        {/* Store Information */}
        <View className="w-full px-6 mb-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Pet Siter Bilgileri
            </Text>

            {/* Telefon */}
            <TouchableOpacity
              onPress={() => handleCallPhone(petSitterProfile.phone_number)}
              className="mb-4"
            >
              <View className="flex-row items-center">
                <Ionicons name="call" size={20} color={COLORS.primary} />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  Telefon
                </Text>
              </View>
              <Text className="text-sm text-blue-600 ml-7">
                {petSitterProfile.phone_number}
              </Text>
            </TouchableOpacity>

            {/* Instagram */}
            {petSitterProfile.instagram_url && (
              <TouchableOpacity
                onPress={() =>
                  handleOpenInstagram(petSitterProfile.instagram_url)
                }
              >
                <View className="flex-row items-center">
                  <FontAwesome
                    name="instagram"
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text className="text-sm font-semibold text-gray-700 ml-2">
                    Instagram
                  </Text>
                </View>
                <Text className="text-sm text-blue-600 ml-7" numberOfLines={1}>
                  {petSitterProfile.instagram_url}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
