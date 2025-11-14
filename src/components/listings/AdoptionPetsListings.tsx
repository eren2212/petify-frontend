import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNearbyAdoptionPets } from "../../hooks/usePet";
import { useAppStore } from "../../stores";
import { useRouter } from "expo-router";
import { COLORS } from "../../styles/theme/color";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

interface AdoptionPet {
  id: string;
  pet_name: string;
  breed?: string;
  pet_type?: { name_tr: string; name: string };
  adoption_fee: number;
  location_description: string;
  distance?: number;
  image_url?: string;
  gender?: string;
  is_vaccinated?: boolean;
  is_neutered?: boolean;
  good_with_kids?: boolean;
  good_with_pets?: boolean;
}

// Km seçenekleri
const DISTANCE_OPTIONS = [
  { label: "5 km", value: 5000 }, // Backend metre cinsinden bekliyor
  { label: "15 km", value: 15000 },
  { label: "25 km", value: 25000 },
  { label: "35 km", value: 35000 },
  { label: "50 km", value: 50000 },
];

export default function AdoptionPetsListings() {
  const router = useRouter();

  // Zustand store'dan dinamik konumu al
  const { latitude, longitude, isLocationLoading } = useAppStore();

  // Seçili mesafe (default 5km = 5000 metre)
  const [selectedRadius, setSelectedRadius] = useState<number>(5000);

  const { data: adoptionPets = [], isLoading } = useNearbyAdoptionPets(
    latitude || 0,
    longitude || 0,
    selectedRadius
  );

  const renderPetCard = ({ item }: { item: AdoptionPet }) => {
    const imageUrl = item.image_url
      ? `${BASE_URL}/adoptionpet/${item.image_url}`
      : null;

    return (
      <TouchableOpacity
        onPress={() => {
          // TODO: Adoption pet detail sayfası oluşturulacak
          console.log("Adoption pet detail:", item.id);
        }}
        className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm"
        style={{
          flex: 1,
          margin: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View className="relative">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-40"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-40 bg-gray-200 items-center justify-center">
              <Ionicons name="heart" size={40} color="#9CA3AF" />
            </View>
          )}

          <View className="absolute top-2 left-2">
            <View className="bg-red-500 px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">
                {item.adoption_fee === 0 ? "ÜCRETSİZ" : "YUVA ARIYOR"}
              </Text>
            </View>
          </View>

          {item.distance && (
            <View className="absolute top-2 right-2">
              <View className="bg-white px-2 py-1 rounded-full">
                <Text className="text-gray-700 text-xs font-semibold">
                  {item.distance.toFixed(1)} km
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="p-3">
          <Text
            className="text-base font-bold text-gray-900 mb-1"
            numberOfLines={1}
          >
            {item.pet_name}
          </Text>

          {item.breed && (
            <Text className="text-xs text-gray-600 mb-1" numberOfLines={1}>
              {item.breed}
            </Text>
          )}

          {item.pet_type && (
            <Text className="text-xs text-gray-500 mb-1" numberOfLines={1}>
              {item.pet_type.name_tr}
            </Text>
          )}

          <View className="flex-row items-center mt-1">
            <Ionicons name="location-outline" size={14} color="#EF4444" />
            <Text
              className="text-xs text-gray-600 ml-1 flex-1"
              numberOfLines={1}
            >
              {item.location_description}
            </Text>
          </View>

          {/* Sağlık ve özellikler badges */}
          <View className="flex-row flex-wrap gap-1 mt-2">
            {item.is_vaccinated && (
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-green-700 text-xs">Aşılı</Text>
              </View>
            )}
            {item.is_neutered && (
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-700 text-xs">Kısır</Text>
              </View>
            )}
            {item.good_with_kids && (
              <View className="bg-purple-100 px-2 py-1 rounded-full">
                <Text className="text-purple-700 text-xs">Çocuk Dostu</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Konum yükleniyor veya veriler yükleniyor
  if (isLocationLoading || isLoading) {
    return (
      <View className="items-center justify-center py-20">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="text-gray-400 mt-4">
          {isLocationLoading ? "Konum alınıyor..." : "Yükleniyor..."}
        </Text>
      </View>
    );
  }

  // Konum kontrolü
  if (latitude === null || longitude === null) {
    return (
      <View className="items-center justify-center py-20">
        <Ionicons name="location-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-400 mt-4 text-base">
          Konum bilgisi alınamadı
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Mesafe Seçici */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2 px-4">
          Arama Yarıçapı
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          <View className="flex-row gap-2">
            {DISTANCE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedRadius(option.value)}
                className={`px-4 py-2 rounded-full border ${
                  selectedRadius === option.value
                    ? "border-primary"
                    : "border-gray-300"
                }`}
                style={{
                  backgroundColor:
                    selectedRadius === option.value
                      ? COLORS.primary + "20"
                      : "#F9FAFB",
                }}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedRadius === option.value
                      ? "text-primary"
                      : "text-gray-600"
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* İlan Listesi veya Empty State */}
      {adoptionPets.length === 0 ? (
        <View className="items-center justify-center py-20">
          <Ionicons name="heart-outline" size={64} color="#D1D5DB" />
          <Text className="text-gray-400 mt-4 text-base text-center px-6">
            {selectedRadius / 1000} km yarıçapında sahiplendirme ilanı
            bulunmuyor
          </Text>
          <Text className="text-gray-400 mt-2 text-sm text-center px-6">
            Daha geniş bir alan için farklı bir yarıçap seçebilirsiniz
          </Text>
        </View>
      ) : (
        <FlatList
          data={adoptionPets}
          renderItem={renderPetCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10 }}
          numColumns={2}
          columnWrapperStyle={{ gap: 8 }}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}
