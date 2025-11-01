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
import { useLocalSearchParams } from "expo-router";
import { useLostPetDetail } from "../../../hooks/usePet";
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

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

export default function LostPetDetailScreen() {
  const { id } = useLocalSearchParams();
  const lostPetId = Array.isArray(id) ? id[0] : id;

  // Lost pet detayını çek
  const { data: lostPet, isLoading, error } = useLostPetDetail(lostPetId || "");

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

  if (error || !lostPet) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-red-500 text-lg text-center font-medium mt-4">
            Kayıp hayvan bilgileri yüklenirken bir hata oluştu
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

  // Resim kaynağını belirle
  const getImageSource = () => {
    // Backend image endpoint'i kullan
    if (lostPetId) {
      return { uri: `${API_URL}/lostpet/image/${lostPetId}` };
    }
    // Yoksa default pet type resmini kullan
    return getPetTypeImageByName(
      lostPet.pet_type?.name_tr || lostPet.pet_type?.name
    );
  };

  // Status badge rengi
  const getStatusBadgeStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "missing":
        return "bg-red-500";
      case "found":
        return "bg-green-500";
      case "reunited":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  // Status label
  const getStatusLabel = (status?: string) => {
    const statusMap: Record<string, string> = {
      missing: "Kayıp",
      found: "Bulundu",
      reunited: "Kavuştu",
    };
    return statusMap[status?.toLowerCase() || ""] || "Bilinmiyor";
  };

  const handlePhonePress = async () => {
    // 2. 'tel:' ön ekini kullanarak arama URL'sini oluştur
    const url = `tel:${lostPet.contact_phone}`;

    try {
      // 3. Cihazın bu URL'i açıp açamayacağını kontrol et
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        // 4. Cihaz destekliyorsa, yerel arama ekranını aç
        await Linking.openURL(url);
      } else {
        // Desteklemiyorsa (örn. bir tablet veya simülatör) hata göster
        Alert.alert("Arama Başarısız", "Cihazınız aramayı desteklemiyor.");
      }
    } catch (error) {
      console.error("Arama hatası:", error);
      Alert.alert("Bir hata oluştu", "Arama başlatılamadı.");
    }
  };

  const openMaps = (lat: number, lng: number, label: string) => {
    // Cihazın platformunu (iOS veya Android) kontrol et
    const platform = Platform.OS;

    let url = "";

    if (platform === "ios") {
      // Apple Haritalar için URL şeması
      // saddr (source address) boş bırakılırsa, mevcut konumu kullanır.
      url = `maps://?daddr=${lat},${lng}&label=${label}`;
    } else {
      // Android (Google Haritalar) için URL şeması
      // 'q' parametresi hedefi belirler. Navigasyonu başlatır.
      url = `google.navigation:q=${lat}+${lng}`;

      // Alternatif olarak, sadece konumu göstermek için:
      // url = `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
    }

    // Oluşturulan URL'yi açmayı dene
    Linking.openURL(url).catch((err) =>
      console.error("Harita uygulaması açılamadı:", err)
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header - KAYIP Badge */}
        <View className="bg-red-500 px-6 py-4 rounded-full items-center justify-center mx-2">
          <View className="flex-row items-center justify-center">
            <Ionicons name="alert-circle" size={24} color="white" />
            <Text className="text-white text-lg font-bold ml-2">KAYIP</Text>
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
                lostPet.pet_type?.name_tr || lostPet.pet_type?.name
              )}
            />
          </View>

          {/* İsim */}
          <Text className="text-2xl font-bold text-gray-900 mt-6 tracking-tight">
            {lostPet.pet_name}
          </Text>

          {/* Kısa Bilgi */}
          <Text className="text-base text-gray-500 mt-3 text-center leading-relaxed">
            {lostPet.breed && `${lostPet.breed}`}
          </Text>
        </View>

        {/* Lost Information Section */}
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
              <Ionicons
                name="information-circle"
                size={24}
                color={COLORS.primary}
              />
              <Text className="text-xl font-bold text-gray-900 ml-2">
                Kayıp Bilgileri
              </Text>
            </View>

            {/* Kayıp Tarihi */}
            <View className="flex-row justify-between items-center py-3.5">
              <View className="flex-row items-center flex-1">
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text className="text-gray-500 text-base ml-2">
                  Kayıp Tarihi
                </Text>
              </View>
              <Text className="text-gray-900 font-semibold text-base">
                {lostPet.lost_date
                  ? formatDate(lostPet.lost_date)
                  : "Belirtilmemiş"}
              </Text>
            </View>

            <View className="h-px bg-gray-100 my-1" />

            {/* Son Görüldüğü Yer */}
            <View className="py-3.5">
              <View className="flex-row items-center mb-2">
                <Ionicons name="location-outline" size={20} color="#6B7280" />
                <Text className="text-gray-500 text-base ml-2">
                  Son Görüldüğü Yer
                </Text>
              </View>
              <Text className="text-gray-900 font-semibold text-base mt-1 ml-1">
                {lostPet.last_seen_location || "Belirtilmemiş"}
              </Text>
            </View>
          </View>
        </View>

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
                {lostPet.pet_type?.name_tr || "Belirtilmemiş"}
              </Text>
            </View>

            <View className="h-px bg-gray-100 my-1" />

            {/* Breed */}
            {lostPet.breed && (
              <>
                <View className="flex-row justify-between items-center py-3.5">
                  <Text className="text-gray-500 text-base">Cins</Text>
                  <Text className="text-gray-900 font-semibold text-base">
                    {lostPet.breed}
                  </Text>
                </View>
                <View className="h-px bg-gray-100 my-1" />
              </>
            )}

            {/* Color */}
            {lostPet.color && (
              <>
                <View className="flex-row justify-between items-center py-3.5">
                  <Text className="text-gray-500 text-base">Renk</Text>
                  <Text className="text-gray-900 font-semibold text-base">
                    {lostPet.color}
                  </Text>
                </View>
                <View className="h-px bg-gray-100 my-1" />
              </>
            )}

            {/* Size */}
            {lostPet.size && (
              <>
                <View className="flex-row justify-between items-center py-3.5">
                  <Text className="text-gray-500 text-base">Boyut</Text>
                  <Text className="text-gray-900 font-semibold text-base">
                    {lostPet.size}
                  </Text>
                </View>
                <View className="h-px bg-gray-100 my-1" />
              </>
            )}

            {/* Age */}
            {lostPet.birthdate && (
              <View className="flex-row justify-between items-center py-3.5">
                <Text className="text-gray-500 text-base">Doğum Tarihi</Text>
                <Text className="text-gray-900 font-semibold text-base">
                  {formatDate(lostPet.birthdate)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Description Section */}
        {lostPet.description && (
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
                {lostPet.description}
              </Text>
            </View>
          </View>
        )}

        <MapView
          style={{
            width: "90%",
            height: 350,
            borderRadius: 12,
            alignSelf: "center",
            marginBottom: 24,
          }}
          initialRegion={{
            latitude: lostPet.last_seen_latitude || 0,
            longitude: lostPet.last_seen_longitude || 0,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          provider={PROVIDER_GOOGLE}
        >
          <Marker
            coordinate={{
              latitude: lostPet.last_seen_latitude || 0,
              longitude: lostPet.last_seen_longitude || 0,
            }}
            title="Son Görüldüğü Yer"
            description={lostPet.last_seen_location || "Belirtilmemiş"}
            opacity={0.8}
            zIndex={1000}
            anchor={{ x: 0.5, y: 0.5 }}
            rotation={0}
          >
            <View className="bg-white rounded-full p-3 items-center justify-center">
              <MaterialIcons name="pets" size={24} color={COLORS.primary} />
            </View>
          </Marker>
          <Circle
            center={{
              latitude: lostPet.last_seen_latitude,
              longitude: lostPet.last_seen_longitude,
            }}
            radius={500} // <-- 1 kilometre = 1000 metre
            strokeColor="rgba(239, 83, 80, 0.8)"
            strokeWidth={2}
            fillColor="rgba(239, 83, 80, 0.2)"
          />

          <Callout>
            <View className=" rounded-3xl p-3 ml-2 mt-2">
              <TouchableOpacity
                className="bg-white p-4 rounded-full items-center justify-center w-full"
                onPress={() =>
                  openMaps(
                    lostPet.last_seen_latitude,
                    lostPet.last_seen_longitude,
                    lostPet.last_seen_location
                  )
                }
              >
                <Ionicons name="trail-sign" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </Callout>
        </MapView>

        {/* Contact Info Section */}
        <View className="px-5 mb-6">
          <View
            className="rounded-3xl p-6"
            style={{
              backgroundColor: "#FEF2F2",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 5,
              borderWidth: 2,
              borderColor: "#FECACA",
            }}
          >
            <View className="flex-row items-center mb-4">
              <Ionicons name="call-outline" size={24} color="#EF4444" />
              <Text className="text-xl font-bold text-red-900 ml-2">
                Bilgi için İletişime Geçin
              </Text>
            </View>
            <Text className="text-red-700 text-base leading-6">
              Bu hayvanı görürseniz veya hakkında bilginiz varsa, lütfen ilan
              sahibiyle iletişime geçin.
            </Text>

            <View className="flex-col items-center justify-between gap-2 mt-4">
              <TouchableOpacity
                className="bg-text  p-4 rounded-full items-center justify-center w-full"
                onPress={handlePhonePress}
              >
                <Text className="text-white text-base text-center font-bold ">
                  Tel : {lostPet.contact_phone}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-text p-4 rounded-full items-center justify-center w-full">
                <Text className="text-white text-base text-center font-bold ">
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
              {lostPet.created_at
                ? formatDate(lostPet.created_at)
                : "Bilinmiyor"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
