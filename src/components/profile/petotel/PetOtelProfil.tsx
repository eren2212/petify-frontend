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
  usePetOtelProfile,
  useCreatePetOtelProfile,
  useUploadPetOtelLogo,
  useDeletePetOtelLogo,
} from "../../../hooks/usePetOtel";
import { useMyPetOtelServices } from "../../../hooks";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import { COLORS } from "@/styles/theme/color";
import AddPetOtelProfileModal, {
  PetOtelProfileData,
} from "./AddPetOtelProfileModal";
import PetOtelLogoPicker from "@/components/profile/petotel/PetOtelLogoPicker";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Image } from "react-native";

export default function PetOtelProfil() {
  const { signOut } = useAuthStore();
  const router = useRouter();

  // TanStack Query'den user bilgisini al
  const { data: user, isLoading: userLoading } = useCurrentUser();

  // Pet Otel profilini al
  const { data: petOtelProfileResponse, isLoading: profileLoading } =
    usePetOtelProfile();

  // Pet Otel servislerini al
  const { data: servicesData, isLoading: servicesLoading } =
    useMyPetOtelServices();
  const services = servicesData?.data || [];

  // Aktif rolü al
  const activeRole = getActiveRole(user);

  // Mutations
  const createProfileMutation = useCreatePetOtelProfile();
  const uploadLogoMutation = useUploadPetOtelLogo();
  const deleteLogoMutation = useDeletePetOtelLogo();

  // Modal state
  const [isAddProfileModalVisible, setIsAddProfileModalVisible] =
    useState(false);

  // Pet shop profile data
  const petOtelProfile = petOtelProfileResponse?.data?.petOtelProfile;

  // Logo URL oluştur
  const getLogoUrl = () => {
    if (!petOtelProfile?.logo_url) return null;
    return `${process.env.EXPO_PUBLIC_API_URL}/petotel/profile/logo/${petOtelProfile.logo_url}`;
  };

  const openMaps = (lat: number, lng: number, label: string) => {
    const platform = Platform.OS;
    let url = "";
    if (platform === "ios") {
      url = `maps://?daddr=${lat},${lng}&label=${label}`;
    } else {
      url = `google.navigation:q=${lat}+${lng}`;
    }
    Linking.openURL(url).catch((err) =>
      console.error("Harita uygulaması açılamadı:", err)
    );
  };
  // Profil oluşturma handler
  const handleCreateProfile = async (
    profileData: PetOtelProfileData,
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
            "Pet otel profili ve logo başarıyla oluşturuldu!"
          );
        } catch (logoError) {
          Alert.alert(
            "Uyarı",
            "Profil oluşturuldu ancak logo yüklenirken hata oluştu. Logo'yu daha sonra ekleyebilirsiniz."
          );
        }
      } else {
        Alert.alert("Başarılı", "Pet otel profili başarıyla oluşturuldu!");
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

  // Email gönderme
  const handleSendEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  // Website açma
  const handleOpenWebsite = (url: string) => {
    Linking.openURL(url);
  };

  // Instagram açma
  const handleOpenInstagram = (url: string) => {
    Linking.openURL(url);
  };

  if (userLoading || profileLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="text-text mt-4">Yükleniyor...</Text>
      </View>
    );
  }

  // Eğer profil yoksa, profil oluşturma ekranını göster
  if (!petOtelProfile) {
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
            <Ionicons name="storefront" size={64} color={COLORS.primary} />
          </View>

          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Pet Otel Profili Oluştur
          </Text>
          <Text className="text-base text-gray-500 mb-8 text-center">
            Pet otelinizin bilgilerini ekleyerek müşterilerinize ulaşın
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
        <AddPetOtelProfileModal
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
          <PetOtelLogoPicker
            currentLogoUrl={petOtelProfile.logo_url}
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
          {petOtelProfile.hotel_name}
        </Text>

        {/* E-posta */}
        <Text className="text-sm text-gray-400 mb-4">{user?.email || "-"}</Text>

        {/* Profili Düzenle Butonu */}
        <TouchableOpacity
          onPress={() => router.push("/edit")}
          className="bg-primary px-16 py-5 rounded-full shadow-lg mb-6"
        >
          <Text className="text-white font-bold text-center text-base">
            Profili Düzenle
          </Text>
        </TouchableOpacity>

        {/* About Section */}
        {petOtelProfile.description && (
          <View className="w-full px-6 mb-6">
            <View className="bg-white rounded-2xl p-6 shadow-sm">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Hakkında
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                {petOtelProfile.description}
              </Text>
            </View>
          </View>
        )}

        {/* Store Information */}
        <View className="w-full px-6 mb-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Pet Otel Bilgileri
            </Text>

            {/* Çalışma Saatleri */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="time" size={20} color={COLORS.primary} />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  Çalışma Saatleri
                </Text>
              </View>
              {petOtelProfile.working_hours?.map(
                (wh: { day: string; hours: string }, index: number) => (
                  <View
                    key={index}
                    className="flex-row justify-between py-2 border-b border-gray-100"
                  >
                    <Text className="text-sm text-gray-600">{wh.day}</Text>
                    <Text className="text-sm text-gray-900 font-medium">
                      {wh.hours}
                    </Text>
                  </View>
                )
              )}
            </View>

            {/* Adres */}
            <View className="mb-4">
              <View className="flex-row items-start mb-2">
                <Ionicons name="location" size={20} color={COLORS.primary} />
                <View className="flex-1 ml-2">
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Adres
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {petOtelProfile.address}
                  </Text>
                </View>
              </View>
            </View>

            {/* Kapasite */}
            <View className="mb-4">
              <View className="flex-row items-start mb-2">
                <Ionicons name="people" size={20} color={COLORS.primary} />
                <View className="flex-1 ml-2">
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Kapasite
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {petOtelProfile.capacity}
                  </Text>
                </View>
              </View>
            </View>

            {/* Giriş Saati */}
            <View className="mb-4">
              <View className="flex-row items-start mb-2">
                <Ionicons name="time" size={20} color={COLORS.primary} />
                <View className="flex-1 ml-2">
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Check-in Saati
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {petOtelProfile.check_in_time}
                  </Text>
                </View>
              </View>
            </View>

            {/* Çıkış Saati */}
            <View className="mb-4">
              <View className="flex-row items-start mb-2">
                <Ionicons name="time" size={20} color={COLORS.primary} />
                <View className="flex-1 ml-2">
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Check-out Saati
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {petOtelProfile.check_out_time}
                  </Text>
                </View>
              </View>
            </View>

            {/* Telefon */}
            <TouchableOpacity
              onPress={() => handleCallPhone(petOtelProfile.phone_number)}
              className="mb-4"
            >
              <View className="flex-row items-center">
                <Ionicons name="call" size={20} color={COLORS.primary} />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  Telefon
                </Text>
              </View>
              <Text className="text-sm text-blue-600 ml-7">
                {petOtelProfile.phone_number}
              </Text>
            </TouchableOpacity>
            {/* Website */}
            {petOtelProfile.website_url && (
              <TouchableOpacity
                onPress={() => handleOpenWebsite(petOtelProfile.website_url)}
                className="mb-4"
              >
                <View className="flex-row items-center">
                  <Ionicons name="globe" size={20} color={COLORS.primary} />
                  <Text className="text-sm font-semibold text-gray-700 ml-2">
                    Website
                  </Text>
                </View>
                <Text className="text-sm text-blue-600 ml-7" numberOfLines={1}>
                  {petOtelProfile.website_url}
                </Text>
              </TouchableOpacity>
            )}

            {/* Instagram */}
            {petOtelProfile.instagram_url && (
              <TouchableOpacity
                onPress={() =>
                  handleOpenInstagram(petOtelProfile.instagram_url)
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
                  {petOtelProfile.instagram_url}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Services Section */}
        {!servicesLoading && services.length > 0 && (
          <View className="w-full px-6 mb-6">
            <View className="bg-white rounded-2xl p-6 shadow-sm">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                Hizmetlerimiz
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {services.map((service: any) => (
                  <View
                    key={service.id}
                    className="bg-gray-50 rounded-xl p-4 items-center justify-center"
                    style={{
                      width: "47%",
                      aspectRatio: 1,
                    }}
                  >
                    <Image
                      source={{
                        uri: `${process.env.EXPO_PUBLIC_API_URL}/petotelservices/category-icon/${service.pet_hotel_service_categories.icon_url}`,
                      }}
                      style={{
                        width: 60,
                        height: 60,
                        marginBottom: 8,
                      }}
                      resizeMode="contain"
                    />
                    <Text
                      className="text-sm font-semibold text-gray-900 text-center"
                      numberOfLines={2}
                    >
                      {service.pet_hotel_service_categories.name_tr}
                    </Text>
                    {service.is_active && (
                      <View className="bg-green-100 px-2 py-0.5 rounded mt-2">
                        <Text className="text-green-600 text-xs font-bold">
                          Aktif
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Map */}
        {petOtelProfile.latitude && petOtelProfile.longitude && (
          <View className="w-full px-6 mb-6">
            <View className="bg-white rounded-2xl p-6 shadow-sm">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                Konumumuz
              </Text>
              <MapView
                style={{
                  width: "100%",
                  height: 350,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  alignSelf: "center",
                  marginBottom: 24,
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                }}
                initialRegion={{
                  latitude: petOtelProfile.latitude,
                  longitude: petOtelProfile.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                provider={PROVIDER_GOOGLE}
              >
                <Marker
                  coordinate={{
                    latitude: petOtelProfile.latitude,
                    longitude: petOtelProfile.longitude,
                  }}
                  title={petOtelProfile.hotel_name}
                  description={petOtelProfile.address}
                >
                  <View className="bg-orange-100 rounded-full p-3 items-center justify-center">
                    <Ionicons name="bed" size={24} color={COLORS.primary} />
                  </View>
                </Marker>

                <Callout>
                  <View className=" rounded-3xl p-3 ml-2 mt-2">
                    <TouchableOpacity
                      className="bg-white p-4 rounded-full items-center justify-center w-full"
                      onPress={() =>
                        openMaps(
                          petOtelProfile.latitude,
                          petOtelProfile.longitude,
                          petOtelProfile.address
                        )
                      }
                    >
                      <Ionicons
                        name="trail-sign"
                        size={24}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </Callout>
              </MapView>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
