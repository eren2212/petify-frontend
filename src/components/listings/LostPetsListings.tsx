import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNearbyLostPets } from "../../hooks/useProfile";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

interface LostPet {
  id: string;
  pet_name: string;
  breed?: string;
  pet_type?: { name_tr: string; name: string };
  lost_date: string;
  last_seen_location: string;
  distance?: number;
  image_url?: string;
}

export default function LostPetsListings() {
  // Örnek koordinatlar - gerçek uygulamada kullanıcının konumu alınmalı
  const latitude = 38.009085; // Konya örnek
  const longitude = 32.520991;

  const { data: lostPets = [], isLoading } = useNearbyLostPets(
    latitude,
    longitude
  );

  const renderPetCard = ({ item }: { item: LostPet }) => {
    const imageUrl = item.image_url
      ? `${BASE_URL}/pet/lost/${item.image_url}`
      : null;
    return (
      <TouchableOpacity
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
              <Ionicons name="paw" size={40} color="#9CA3AF" />
            </View>
          )}

          <View className="absolute top-2 left-2">
            <View className="bg-red-500 px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">KAYIP</Text>
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
              {item.last_seen_location}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View className="items-center justify-center py-20">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="text-gray-400 mt-4">Yükleniyor...</Text>
      </View>
    );
  }

  if (lostPets.length === 0) {
    return (
      <View className="items-center justify-center py-20">
        <Ionicons name="search-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-400 mt-4 text-base">
          Kaybolan hayvan ilanı bulunmuyor
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={lostPets}
      renderItem={renderPetCard}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10 }}
      numColumns={2}
      columnWrapperStyle={{ gap: 8 }}
      scrollEnabled={false}
    />
  );
}
