import { View, Text, ScrollView, ActivityIndicator, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePetDetail, usePetImages } from "../../../hooks/useProfile";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPetTypeImageByName } from "../../../constants/petTypes";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const petId = Array.isArray(id) ? id[0] : id;

  // Pet detayını çek
  const { data: pet, isLoading, error } = usePetDetail(petId);

  // Pet resimlerini çek
  const { data: petImages = [] } = usePetImages(petId);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="text-gray-600 mt-4 font-medium">Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !pet) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-500 text-lg text-center font-medium">
            Hayvan bilgileri yüklenirken bir hata oluştu
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Cinsiyet çevirisi
  const getGenderLabel = (gender?: string) => {
    const genderMap: Record<string, string> = {
      male: "Erkek",
      female: "Dişi",
      unknown: "Bilinmiyor",
    };
    return genderMap[gender || "unknown"] || "Bilinmiyor";
  };

  // Resim kaynağını belirle
  const getImageSource = () => {
    // Eğer kullanıcının yüklediği resim varsa onu kullan
    if (petImages.length > 0 && petImages[0].image_url) {
      const filename = petImages[0].image_url;
      // Eğer zaten tam URL ise olduğu gibi kullan
      if (filename.startsWith("http")) {
        return { uri: filename };
      }
      // Filename ise backend download endpoint'ini kullan
      return { uri: `${API_URL}/profile/pet/image/${filename}` };
    }
    // Yoksa default pet type resmini kullan
    return getPetTypeImageByName(pet.pet_type?.name_tr || pet.pet_type?.name);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Pet Image & Header */}
        <View className="items-center pt-4 pb-8 px-6">
          <View
            className="w-44 h-44 rounded-full overflow-hidden bg-white"
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
            />
          </View>

          {/* İsim */}
          <Text className="text-4xl font-bold text-gray-900 mt-6 tracking-tight">
            {pet.name}
          </Text>

          {/* Kısa Bilgi */}
          <Text className="text-base text-gray-500 mt-3 text-center leading-relaxed">
            {pet.pet_type?.name_tr || "Hayvan"}
            {pet.gender && ` • ${getGenderLabel(pet.gender)} • `}
            {pet.age_display}
          </Text>
        </View>

        {/* About Section */}
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
            <Text className="text-xl font-bold text-gray-900 mb-5">
              Hakkında
            </Text>

            {/* Breed */}
            <View className="flex-row justify-between items-center py-3.5">
              <Text className="text-gray-500 text-base">Cins</Text>
              <Text className="text-gray-900 font-semibold text-base">
                {pet.breed || "Belirtilmemiş"}
              </Text>
            </View>

            <View className="h-px bg-gray-100 my-1" />

            {/* Age */}
            <View className="flex-row justify-between items-center py-3.5">
              <Text className="text-gray-500 text-base">Yaş</Text>
              <Text className="text-gray-900 font-semibold text-base">
                {pet.age_unit == "months" || pet.age_unit == "days"
                  ? pet.age_display
                  : pet.age}
              </Text>
            </View>

            <View className="h-px bg-gray-100 my-1" />

            {/* Gender */}
            <View className="flex-row justify-between items-center py-3.5">
              <Text className="text-gray-500 text-base">Cinsiyet</Text>
              <Text className="text-gray-900 font-semibold text-base">
                {getGenderLabel(pet.gender)}
              </Text>
            </View>

            {/* Weight */}
            {pet.weight_kg && (
              <>
                <View className="h-px bg-gray-100 my-1" />
                <View className="flex-row justify-between items-center py-3.5">
                  <Text className="text-gray-500 text-base">Kilo</Text>
                  <Text className="text-gray-900 font-semibold text-base">
                    {pet.weight_kg} kg
                  </Text>
                </View>
              </>
            )}

            {/* Color */}
            {pet.color && (
              <>
                <View className="h-px bg-gray-100 my-1" />
                <View className="flex-row justify-between items-center py-3.5">
                  <Text className="text-gray-500 text-base">Renk</Text>
                  <Text className="text-gray-900 font-semibold text-base">
                    {pet.color}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Medical History Section */}
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
            <Text className="text-xl font-bold text-gray-900 mb-5">
              Sağlık Geçmişi
            </Text>

            {/* Vaccinations */}
            <View className="flex-row justify-between items-center py-3.5">
              <Text className="text-gray-500 text-base">Aşılar</Text>
              <Text className="text-green-600 font-semibold text-base">
                Güncel
              </Text>
            </View>

            <View className="h-px bg-gray-100 my-1" />

            {/* Allergies */}
            <View className="flex-row justify-between items-center py-3.5">
              <Text className="text-gray-500 text-base">Alerjiler</Text>
              <Text className="text-gray-900 font-semibold text-base">Yok</Text>
            </View>
          </View>
        </View>

        {/* Dietary Needs Section */}
        <View className="px-5">
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
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Beslenme İhtiyaçları
            </Text>
            {pet.description ? (
              <Text className="text-gray-600 leading-7 text-base">
                {pet.description}
              </Text>
            ) : (
              <Text className="text-gray-400 italic text-base">
                Henüz beslenme bilgisi eklenmemiş.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
