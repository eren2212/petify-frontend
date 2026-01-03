import React, { ReactNode } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { COLORS } from "@/styles/theme/color";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

/**
 * Ortak profil alanları - Tüm profil tiplerinde ortak olan alanlar
 */
export interface BaseProfileData {
  id: string;
  name: string; // clinic_name, shop_name, hotel_name, sitter_name
  description?: string;
  logo_url?: string | null;
  address: string;
  latitude: number;
  longitude: number;
  phone_number: string;
  emergency_phone?: string;
  email?: string;
  website_url?: string;
  instagram_url?: string;
  working_hours?: Array<{ day: string; hours: string }>;
  created_at?: string;
}

/**
 * Profil tipi - Her profil türü için farklı stil ve davranış
 */
export type ProfileType = "clinic" | "hotel" | "shop" | "sitter";

/**
 * ProfileDetailView Props
 */
interface ProfileDetailViewProps {
  profileType: ProfileType;
  profileData: BaseProfileData;
  isLoading?: boolean;
  editable?: boolean; // Kullanıcı kendi profilini mi görüyor?
  onEdit?: () => void; // Edit butonuna basıldığında
  extraSections?: ReactNode; // Profil tipine özel ekstra içerik (doktorlar, servisler, vs.)
  logoImagePath?: string; // Logo için API path (örn: /petclinic/profile/logo/)
}

/**
 * Profil tipine göre icon ve renk ayarları
 */
const profileConfig: Record<
  ProfileType,
  { icon: keyof typeof Ionicons.glyphMap; color: string; title: string }
> = {
  clinic: { icon: "medkit", color: COLORS.primary, title: "Veteriner Kliniği" },
  hotel: { icon: "home", color: "#FF6B6B", title: "Pet Otel" },
  shop: { icon: "storefront", color: "#4ECDC4", title: "Pet Shop" },
  sitter: { icon: "person", color: "#95E1D3", title: "Pet Sitter" },
};

/**
 * Ortak Profil Detay Component
 * Tüm profil tipleri için kullanılabilir base component
 */
export const ProfileDetailView: React.FC<ProfileDetailViewProps> = ({
  profileType,
  profileData,
  isLoading = false,
  editable = false,
  onEdit,
  extraSections,
  logoImagePath,
}) => {
  const config = profileConfig[profileType];

  // Logo URL oluştur
  const getLogoUrl = () => {
    if (!profileData.logo_url || !logoImagePath) return null;
    return `${process.env.EXPO_PUBLIC_API_URL}${logoImagePath}${profileData.logo_url}`;
  };

  // Harita açma
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: "center",
          paddingVertical: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Hero Section */}
        <View className="items-center mb-8 px-4 w-full">
          {/* Logo / Avatar Container */}
          <View className="mb-5 relative shadow-xl shadow-gray-200">
            <View className="bg-white p-1 rounded-3xl">
              {getLogoUrl() ? (
                <Image
                  source={{ uri: getLogoUrl()! }}
                  className="w-32 h-32 rounded-[20px]"
                  resizeMode="cover"
                />
              ) : (
                <View
                  className="w-32 h-32 rounded-[20px] items-center justify-center border-4 border-white"
                  style={{ backgroundColor: `${config.color}15` }}
                >
                  <Ionicons name={config.icon} size={56} color={config.color} />
                </View>
              )}
            </View>
            {/* Status Badge - Floating */}
            <View className="absolute -bottom-3 bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100 self-center left-0 right-0 mx-auto w-auto items-center flex-row justify-center max-w-[140px]">
              <View
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: config.color }}
              />
              <Text className="text-xs font-bold text-gray-700">
                {config.title}
              </Text>
            </View>
          </View>

          {/* İsim */}
          <Text className="text-2xl font-black text-gray-900 text-center tracking-tight mb-2 mt-4 px-4">
            {profileData.name}
          </Text>

          {/* Edit Button */}
          {editable && onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              className="mt-4 flex-row items-center bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-200 active:bg-gray-50"
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={COLORS.primary}
              />
              <Text className="text-primary font-bold text-sm ml-2">
                Profili Düzenle
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hakkında Card */}
        {profileData.description && (
          <View className="w-full px-5 mb-6">
            <View className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-3">
                  <Ionicons name="information" size={20} color={config.color} />
                </View>
                <Text className="text-lg font-bold text-gray-900">
                  Hakkında
                </Text>
              </View>
              <Text className="text-base text-gray-500 leading-7 font-medium">
                {profileData.description}
              </Text>
            </View>
          </View>
        )}

        {/* Extra Sections */}
        {extraSections && (
          <View className="w-full mb-6 relative z-10">{extraSections}</View>
        )}

        {/* İletişim & Detaylar Card */}
        <View className="w-full px-5 mb-6">
          <View className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
            <View className="p-6 border-b border-gray-50">
              <Text className="text-lg font-bold text-gray-900">
                İletişim Bilgileri
              </Text>
            </View>

            <View className="p-2 space-y-1">
              {/* Çalışma Saatleri */}
              {profileData.working_hours &&
                profileData.working_hours.length > 0 && (
                  <View className="bg-gray-50/50 rounded-2xl p-4 mb-2">
                    <View className="flex-row items-center mb-3">
                      <View className="w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm mr-3">
                        <Ionicons name="time" size={16} color={config.color} />
                      </View>
                      <Text className="text-sm font-bold text-gray-900">
                        Çalışma Saatleri
                      </Text>
                    </View>
                    {profileData.working_hours.map((wh, index) => (
                      <View
                        key={index}
                        className="flex-row justify-between py-1.5 border-b border-gray-100 last:border-0 pl-11"
                      >
                        <Text className="text-sm text-gray-500 font-medium">
                          {wh.day}
                        </Text>
                        <Text className="text-sm text-gray-900 font-bold">
                          {wh.hours}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

              {/* Adres */}
              {profileData.address && (
                <TouchableOpacity
                  onPress={() =>
                    openMaps(
                      profileData.latitude,
                      profileData.longitude,
                      profileData.address
                    )
                  }
                  className="flex-row items-start p-4 hover:bg-gray-50 rounded-2xl active:bg-gray-50"
                >
                  <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                    <Ionicons name="location" size={20} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-400 mb-0.5 uppercase tracking-wide">
                      Adres
                    </Text>
                    <Text className="text-sm text-gray-800 font-medium leading-5">
                      {profileData.address}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#D1D5DB"
                    style={{ marginTop: 10 }}
                  />
                </TouchableOpacity>
              )}

              {/* Telefon */}
              <TouchableOpacity
                onPress={() => handleCallPhone(profileData.phone_number)}
                className="flex-row items-center p-4 hover:bg-gray-50 rounded-2xl active:bg-gray-50"
              >
                <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mr-3">
                  <Ionicons name="call" size={20} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-400 mb-0.5 uppercase tracking-wide">
                    Telefon
                  </Text>
                  <Text className="text-sm text-gray-800 font-bold">
                    {profileData.phone_number}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              </TouchableOpacity>

              {/* Acil Telefon */}
              {profileData.emergency_phone && (
                <TouchableOpacity
                  onPress={() => handleCallPhone(profileData.emergency_phone!)}
                  className="flex-row items-center p-4 hover:bg-gray-50 rounded-2xl active:bg-gray-50"
                >
                  <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center mr-3">
                    <Ionicons name="medical" size={20} color="#EF4444" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-red-400 mb-0.5 uppercase tracking-wide">
                      Acil Durum Hattı
                    </Text>
                    <Text className="text-sm text-red-600 font-bold">
                      {profileData.emergency_phone}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#FCA5A5" />
                </TouchableOpacity>
              )}

              {/* Email */}
              {profileData.email && (
                <TouchableOpacity
                  onPress={() => handleSendEmail(profileData.email!)}
                  className="flex-row items-center p-4 hover:bg-gray-50 rounded-2xl active:bg-gray-50"
                >
                  <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-3">
                    <Ionicons name="mail" size={20} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-400 mb-0.5 uppercase tracking-wide">
                      E-Posta
                    </Text>
                    <Text className="text-sm text-gray-800 font-medium">
                      {profileData.email}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </TouchableOpacity>
              )}

              {/* Website */}
              {profileData.website_url && (
                <TouchableOpacity
                  onPress={() => handleOpenWebsite(profileData.website_url!)}
                  className="flex-row items-center p-4 hover:bg-gray-50 rounded-2xl active:bg-gray-50"
                >
                  <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-3">
                    <Ionicons name="globe" size={20} color="#6366F1" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-400 mb-0.5 uppercase tracking-wide">
                      Website
                    </Text>
                    <Text
                      className="text-sm text-indigo-600 font-medium"
                      numberOfLines={1}
                    >
                      {profileData.website_url}
                    </Text>
                  </View>
                  <Ionicons name="open-outline" size={16} color="#D1D5DB" />
                </TouchableOpacity>
              )}

              {/* Instagram */}
              {profileData.instagram_url && (
                <TouchableOpacity
                  onPress={() =>
                    handleOpenInstagram(profileData.instagram_url!)
                  }
                  className="flex-row items-center p-4 hover:bg-gray-50 rounded-2xl active:bg-gray-50"
                >
                  <View className="w-10 h-10 rounded-full bg-pink-50 items-center justify-center mr-3">
                    <FontAwesome name="instagram" size={20} color="#EC4899" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-400 mb-0.5 uppercase tracking-wide">
                      Instagram
                    </Text>
                    <Text
                      className="text-sm text-pink-600 font-bold"
                      numberOfLines={1}
                    >
                      {profileData.instagram_url}
                    </Text>
                  </View>
                  <Ionicons name="open-outline" size={16} color="#D1D5DB" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Harita */}
        {profileData.latitude !== 0 && profileData.longitude !== 0 && (
          <View className="w-full px-5 mb-8">
            <View className="bg-white rounded-[24px] p-2 shadow-sm border border-gray-100">
              <View className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center mr-2">
                    <Ionicons name="map" size={16} color={config.color} />
                  </View>
                  <Text className="text-lg font-bold text-gray-900">Konum</Text>
                </View>
              </View>

              <View className="rounded-2xl overflow-hidden border border-gray-100 relative">
                <MapView
                  style={{
                    width: "100%",
                    height: 240,
                  }}
                  initialRegion={{
                    latitude: profileData.latitude,
                    longitude: profileData.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  provider={PROVIDER_GOOGLE}
                  scrollEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: profileData.latitude,
                      longitude: profileData.longitude,
                    }}
                    title={profileData.name}
                    description={profileData.address}
                  >
                    <View
                      className="bg-white rounded-full p-2 items-center justify-center shadow-md border-2 border-white"
                      style={{ borderColor: "white" }}
                    >
                      <Ionicons
                        name={config.icon}
                        size={24}
                        color={config.color}
                      />
                    </View>
                  </Marker>
                </MapView>

                {/* Gradient Overlay for Maps Interaction Hint can be added here if needed */}

                <View className="absolute bottom-4 right-4 left-4">
                  <TouchableOpacity
                    className="bg-white py-3.5 px-4 rounded-xl shadow-lg flex-row items-center justify-center border border-gray-100"
                    activeOpacity={0.9}
                    onPress={() =>
                      openMaps(
                        profileData.latitude,
                        profileData.longitude,
                        profileData.address
                      )
                    }
                  >
                    <Ionicons name="navigate" size={20} color={config.color} />
                    <Text className="text-sm font-bold ml-2 text-gray-800">
                      Yol Tarifi Al
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
