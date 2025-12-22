import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useAdoptionPetDetail,
  useMarkAdoptionPetAsAdopted,
  useDeleteAdoptionPet,
} from "../../../hooks/usePet";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPetTypeImageByName } from "../../../constants/petTypes";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "@/styles/theme/color";
import MapView, {
  Callout,
  Circle,
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { PetifySpinner } from "@/components/PetifySpinner";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

export default function AdoptionPetDetailScreen() {
  const { id, source } = useLocalSearchParams();
  const adoptionPetId = Array.isArray(id) ? id[0] : id;
  const sourceParam = Array.isArray(source) ? source[0] : source;
  const router = useRouter();

  // Adoption pet detayını çek
  const {
    data: adoptionPet,
    isLoading,
    error,
  } = useAdoptionPetDetail(adoptionPetId || "");

  // Mutations
  const markAsAdoptedMutation = useMarkAdoptionPetAsAdopted();
  const deleteMutation = useDeleteAdoptionPet();

  // Profil sayfasından mı gelindi?
  const isFromProfile = sourceParam === "profile";

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <PetifySpinner size={180} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !adoptionPet) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-red-500 text-lg text-center font-medium mt-4">
            Sahiplendirme ilanı bilgileri yüklenirken bir hata oluştu
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Tarih formatlama
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Yaş hesaplama
  const calculateAge = (birthdate: string) => {
    const birth = new Date(birthdate);
    const today = new Date();

    const diffTime = today.getTime() - birth.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

    const diffMonths =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth());

    const diffYears = Math.floor(diffMonths / 12);

    // 1 aydan küçük → günlük
    if (diffMonths < 1) {
      return `${diffDays} günlük`;
    }

    // 1 ay - 11 ay arası → aylık
    if (diffMonths < 12) {
      return `${diffMonths} aylık`;
    }

    // 12 ay ve üzeri → yaş
    return `${diffYears} yaş`;
  };

  // Resim kaynağını belirle
  const getImageSource = () => {
    // Backend'den gelen image_url varsa kullan
    if (adoptionPet.id && adoptionPet.id !== "") {
      return { uri: `${API_URL}/adoptionpet/image/${adoptionPet.id}` };
    }
    // Yoksa default pet type resmini kullan
    return getPetTypeImageByName(
      adoptionPet.pet_type?.name_tr || adoptionPet.pet_type?.name
    );
  };

  // Cinsiyet label
  const getGenderLabel = (gender?: string) => {
    const genderMap: Record<string, string> = {
      male: "Erkek",
      female: "Dişi",
      unknown: "Bilinmiyor",
    };
    return genderMap[gender?.toLowerCase() || ""] || "Belirtilmemiş";
  };

  // Cinsiyet ikonu
  const getGenderIcon = (gender?: string) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return "male";
      case "female":
        return "female";
      default:
        return "help-circle-outline";
    }
  };

  const handlePhonePress = async () => {
    const url = `tel:${adoptionPet.contact_phone}`;

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Arama Başarısız", "Cihazınız aramayı desteklemiyor.");
      }
    } catch (error) {
      console.error("Arama hatası:", error);
      Alert.alert("Bir hata oluştu", "Arama başlatılamadı.");
    }
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

  // Sahiplendirildi olarak işaretle
  const handleMarkAsAdopted = () => {
    Alert.alert(
      "Sahiplendirildi mi?",
      "Bu hayvan yuva buldu mu?",
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Evet, Sahiplendirildi",
          style: "default",
          onPress: async () => {
            try {
              await markAsAdoptedMutation.mutateAsync(adoptionPetId);
              Alert.alert(
                "Başarılı!",
                "Hayvan sahiplendirildi olarak işaretlendi."
              );
              router.back();
            } catch (error: any) {
              Alert.alert(
                "Hata",
                error?.response?.data?.message || "İşlem başarısız oldu"
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // İlanı sil
  const handleDelete = () => {
    Alert.alert(
      "İlanı Sil",
      "Bu ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(adoptionPetId);
              Alert.alert("Başarılı!", "İlan başarıyla silindi.");
              router.back();
            } catch (error: any) {
              Alert.alert(
                "Hata",
                error?.response?.data?.message || "İşlem başarısız oldu"
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header - YUVA ARIYOR Badge */}
        <View
          className={`px-6 py-4 rounded-full items-center justify-center mx-2 ${
            adoptionPet.adoption_fee === 0 ? "bg-red-500" : "bg-green-500"
          }`}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="heart" size={24} color="white" />
            <Text className="text-white text-lg font-bold ml-2">
              {adoptionPet.status !== "passive"
                ? adoptionPet.adoption_fee === 0
                  ? "ÜCRETSİZ"
                  : "YUVA ARIYOR"
                : "SAHİPLENDİRİLDİ"}
            </Text>
          </View>
        </View>

        {/* Pet Image & Header */}
        <View className="items-center pt-6 pb-8 px-6">
          <View
            className="w-80 h-80 rounded-2xl overflow-hidden bg-white border-2 border-gray-200"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <Image
              source={getImageSource()}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
              defaultSource={getPetTypeImageByName(
                adoptionPet.pet_type?.name_tr || adoptionPet.pet_type?.name
              )}
            />
          </View>

          {/* İsim */}
          <Text className="text-2xl font-bold text-gray-900 mt-6 tracking-tight">
            {adoptionPet.pet_name}
          </Text>

          {/* Kısa Bilgi */}
          <Text className="text-base text-gray-500 mt-3 text-center leading-relaxed">
            {adoptionPet.breed && `${adoptionPet.breed}`}
            {adoptionPet.breed && adoptionPet.birthdate && " • "}
            {adoptionPet.birthdate && calculateAge(adoptionPet.birthdate)}
          </Text>

          {/* Sağlık Badges */}
          <View className="flex-row flex-wrap gap-2 mt-4 justify-center">
            {adoptionPet.is_vaccinated && (
              <View className="bg-green-100 px-3 py-1.5 rounded-full">
                <Text className="text-green-700 text-sm font-semibold">
                  ✓ Aşılı
                </Text>
              </View>
            )}
            {adoptionPet.is_neutered && (
              <View className="bg-blue-100 px-3 py-1.5 rounded-full">
                <Text className="text-blue-700 text-sm font-semibold">
                  ✓ Kısırlaştırılmış
                </Text>
              </View>
            )}
            {adoptionPet.is_house_trained && (
              <View className="bg-purple-100 px-3 py-1.5 rounded-full">
                <Text className="text-purple-700 text-sm font-semibold">
                  ✓ Ev Eğitimli
                </Text>
              </View>
            )}
            {adoptionPet.good_with_kids && (
              <View className="bg-pink-100 px-3 py-1.5 rounded-full">
                <Text className="text-pink-700 text-sm font-semibold">
                  ✓ Çocuk Dostu
                </Text>
              </View>
            )}
            {adoptionPet.good_with_pets && (
              <View className="bg-orange-100 px-3 py-1.5 rounded-full">
                <Text className="text-orange-700 text-sm font-semibold">
                  ✓ Diğer Hayvanlarla Uyumlu
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Profil sayfasından gelindiyse gösterilecek butonlar */}
        {isFromProfile && (
          <View className="px-5 mb-6">
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-green-500 py-4 rounded-full items-center justify-center"
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
                onPress={handleMarkAsAdopted}
                disabled={
                  markAsAdoptedMutation.isPending ||
                  adoptionPet.status === "passive"
                }
              >
                <View className="flex-row items-center">
                  {markAsAdoptedMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="white"
                      />
                      <Text className="text-white font-bold text-base ml-2">
                        Sahiplendirildi
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-red-500 py-4 px-6 rounded-full items-center justify-center"
                style={{
                  shadowColor: "#EF4444",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
                onPress={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="trash-outline" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Pet Details Section */}
        <View className="px-5 mb-6">
          <View
            className="bg-white rounded-3xl p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <View className="flex-row items-center mb-5">
              <Ionicons name="paw-outline" size={24} color={COLORS.primary} />
              <Text className="text-xl font-bold text-gray-900 ml-2">
                Hayvan Bilgileri
              </Text>
            </View>

            {/* Pet Type */}
            <View className="flex-row justify-between items-center py-3.5">
              <Text className="text-gray-500 text-base">Hayvan Türü</Text>
              <Text className="text-gray-900 font-semibold text-base">
                {adoptionPet.pet_type?.name_tr || "Belirtilmemiş"}
              </Text>
            </View>

            <View className="h-px bg-gray-100 my-1" />

            {/* Breed */}
            {adoptionPet.breed && (
              <>
                <View className="flex-row justify-between items-center py-3.5">
                  <Text className="text-gray-500 text-base">Cins</Text>
                  <Text className="text-gray-900 font-semibold text-base">
                    {adoptionPet.breed}
                  </Text>
                </View>
                <View className="h-px bg-gray-100 my-1" />
              </>
            )}

            {/* Gender */}
            {adoptionPet.gender && (
              <>
                <View className="flex-row justify-between items-center py-3.5">
                  <Text className="text-gray-500 text-base">Cinsiyet</Text>
                  <View className="flex-row items-center">
                    <Ionicons
                      name={getGenderIcon(adoptionPet.gender)}
                      size={18}
                      color={
                        adoptionPet.gender === "male" ? "#3B82F6" : "#EC4899"
                      }
                    />
                    <Text className="text-gray-900 font-semibold text-base ml-2">
                      {getGenderLabel(adoptionPet.gender)}
                    </Text>
                  </View>
                </View>
                <View className="h-px bg-gray-100 my-1" />
              </>
            )}

            {/* Color */}
            {adoptionPet.color && (
              <>
                <View className="flex-row justify-between items-center py-3.5">
                  <Text className="text-gray-500 text-base">Renk</Text>
                  <Text className="text-gray-900 font-semibold text-base">
                    {adoptionPet.color}
                  </Text>
                </View>
                <View className="h-px bg-gray-100 my-1" />
              </>
            )}

            {/* Age */}
            {adoptionPet.birthdate && (
              <View className="flex-row justify-between items-center py-3.5">
                <Text className="text-gray-500 text-base">Yaş</Text>
                <Text className="text-gray-900 font-semibold text-base">
                  {calculateAge(adoptionPet.birthdate)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Description Section */}
        {adoptionPet.description && (
          <View className="px-5 mb-6">
            <View
              className="bg-white rounded-3xl p-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <View className="flex-row items-center mb-4">
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color={COLORS.primary}
                />
                <Text className="text-xl font-bold text-gray-900 ml-2">
                  Açıklama
                </Text>
              </View>
              <Text className="text-gray-700 text-base leading-6">
                {adoptionPet.description}
              </Text>
            </View>
          </View>
        )}

        {/* Requirements Section */}
        {adoptionPet.requirements && (
          <View className="px-5 mb-6">
            <View
              className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-200"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <View className="flex-row items-center mb-4">
                <Ionicons name="alert-circle" size={24} color="#F59E0B" />
                <Text className="text-xl font-bold text-amber-900 ml-2">
                  Sahiplenme Gereksinimleri
                </Text>
              </View>
              <Text className="text-amber-800 text-base leading-6">
                {adoptionPet.requirements}
              </Text>
            </View>
          </View>
        )}

        {/* Adoption Fee Section */}
        <View className="px-5 mb-6">
          <View
            className="bg-white rounded-3xl p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <View className="flex-row items-center mb-4">
              <Ionicons name="cash-outline" size={24} color={COLORS.primary} />
              <Text className="text-xl font-bold text-gray-900 ml-2">
                Sahiplenme Ücreti
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-700 text-base">Ücret:</Text>
              <Text
                className={`text-2xl font-bold ${
                  adoptionPet.adoption_fee === 0
                    ? "text-green-600"
                    : "text-gray-900"
                }`}
              >
                {adoptionPet.adoption_fee === 0
                  ? "ÜCRETSİZ"
                  : `${adoptionPet.adoption_fee} ₺`}
              </Text>
            </View>
          </View>
        </View>

        {/* Location Map */}
        {adoptionPet.latitude && adoptionPet.longitude && (
          <MapView
            style={{
              width: "90%",
              height: 350,
              borderRadius: 12,
              alignSelf: "center",
              marginBottom: 24,
            }}
            initialRegion={{
              latitude: adoptionPet.latitude,
              longitude: adoptionPet.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            provider={PROVIDER_GOOGLE}
          >
            <Marker
              coordinate={{
                latitude: adoptionPet.latitude,
                longitude: adoptionPet.longitude,
              }}
              title={adoptionPet.pet_name}
              description={adoptionPet.location_description || "Konum"}
              opacity={0.8}
              zIndex={1000}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View className="bg-white rounded-full p-3 items-center justify-center">
                <Ionicons name="home" size={24} color={COLORS.primary} />
              </View>
            </Marker>

            <Callout>
              <View className="rounded-3xl p-3 ml-2 mt-2">
                <TouchableOpacity
                  className="bg-white p-4 rounded-full items-center justify-center w-full"
                  onPress={() =>
                    openMaps(
                      adoptionPet.latitude,
                      adoptionPet.longitude,
                      adoptionPet.location_description
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
        )}

        {/* Contact Info Section */}
        <View className="px-5 mb-6">
          <View
            className="rounded-3xl p-6"
            style={{
              backgroundColor: "#F0F9FF",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 5,
              borderWidth: 2,
              borderColor: "#BAE6FD",
            }}
          >
            <View className="flex-row items-center mb-4">
              <Ionicons name="call-outline" size={24} color="#0284C7" />
              <Text className="text-xl font-bold text-sky-900 ml-2">
                İletişim Bilgileri
              </Text>
            </View>
            <Text className="text-sky-700 text-base leading-6 mb-4">
              Bu sevimli dostla tanışmak ve sahiplenmek için lütfen ilan
              sahibiyle iletişime geçin.
            </Text>

            <View className="flex-col items-center justify-between gap-2">
              <TouchableOpacity
                className="bg-text p-4 rounded-full items-center justify-center w-full"
                onPress={handlePhonePress}
              >
                <Text className="text-white text-base text-center font-bold">
                  Tel: {adoptionPet.contact_phone}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-text p-4 rounded-full items-center justify-center w-full">
                <Text className="text-white text-base text-center font-bold">
                  Mesaj Gönder
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Metadata */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center justify-center">
            <Ionicons name="time-outline" size={16} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs ml-2">
              İlan Oluşturulma:{" "}
              {adoptionPet.created_at
                ? formatDate(adoptionPet.created_at)
                : "Bilinmiyor"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
