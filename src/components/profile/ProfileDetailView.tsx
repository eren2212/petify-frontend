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
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ alignItems: "center", paddingVertical: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Avatar */}
        <View className="mb-4 relative">
          {getLogoUrl() ? (
            <Image
              source={{ uri: getLogoUrl()! }}
              className="w-36 h-36 rounded-2xl"
              resizeMode="cover"
            />
          ) : (
            <View
              className="w-36 h-36 rounded-full items-center justify-center"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Ionicons name={config.icon} size={64} color={config.color} />
            </View>
          )}
        </View>

        {/* İsim */}
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          {profileData.name}
        </Text>

        {/* Tip Badge */}
        <View
          className="px-4 py-2 rounded-full mb-4"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Text
            className="text-sm font-semibold"
            style={{ color: config.color }}
          >
            {config.title}
          </Text>
        </View>

        {/* Edit Butonu (Sadece editable ise) */}
        {editable && onEdit && (
          <TouchableOpacity
            onPress={onEdit}
            className="bg-primary/10 px-16 py-5 rounded-2xl shadow-lg border-2 border-primary mb-6"
          >
            <Text className="text-primary font-bold text-center text-base">
              Profili Düzenle
            </Text>
          </TouchableOpacity>
        )}

        {/* Hakkında Section */}
        {profileData.description && (
          <View className="w-full px-6 mb-6">
            <View className="bg-white rounded-2xl p-6 shadow-sm">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Hakkında
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                {profileData.description}
              </Text>
            </View>
          </View>
        )}

        {/* İletişim Bilgileri */}
        <View className="w-full px-6 mb-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              İletişim Bilgileri
            </Text>

            {/* Çalışma Saatleri */}
            {profileData.working_hours &&
              profileData.working_hours.length > 0 && (
                <View className="mb-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="time" size={20} color={config.color} />
                    <Text className="text-sm font-semibold text-gray-700 ml-2">
                      Çalışma Saatleri
                    </Text>
                  </View>
                  {profileData.working_hours.map((wh, index) => (
                    <View
                      key={index}
                      className="flex-row justify-between py-2 border-b border-gray-100"
                    >
                      <Text className="text-sm text-gray-600">{wh.day}</Text>
                      <Text className="text-sm text-gray-900 font-medium">
                        {wh.hours}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

            {/* Adres */}
            <View className="mb-4">
              <View className="flex-row items-start mb-2">
                <Ionicons name="location" size={20} color={config.color} />
                <View className="flex-1 ml-2">
                  <Text className="text-sm font-semibold text-gray-700 mb-1">
                    Adres
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {profileData.address}
                  </Text>
                </View>
              </View>
            </View>

            {/* Telefon */}
            <TouchableOpacity
              onPress={() => handleCallPhone(profileData.phone_number)}
              className="mb-4"
            >
              <View className="flex-row items-center">
                <Ionicons name="call" size={20} color={config.color} />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  Telefon
                </Text>
              </View>
              <Text className="text-sm text-blue-600 ml-7">
                {profileData.phone_number}
              </Text>
            </TouchableOpacity>

            {/* Acil Telefon */}
            {profileData.emergency_phone && (
              <TouchableOpacity
                onPress={() => handleCallPhone(profileData.emergency_phone!)}
                className="mb-4"
              >
                <View className="flex-row items-center">
                  <Ionicons name="call" size={20} color="#EF4444" />
                  <Text className="text-sm font-semibold text-gray-700 ml-2">
                    Acil Telefon
                  </Text>
                </View>
                <Text className="text-sm text-blue-600 ml-7">
                  {profileData.emergency_phone}
                </Text>
              </TouchableOpacity>
            )}

            {/* Email */}
            {profileData.email && (
              <TouchableOpacity
                onPress={() => handleSendEmail(profileData.email!)}
                className="mb-4"
              >
                <View className="flex-row items-center">
                  <Ionicons name="mail" size={20} color={config.color} />
                  <Text className="text-sm font-semibold text-gray-700 ml-2">
                    E-posta
                  </Text>
                </View>
                <Text className="text-sm text-blue-600 ml-7">
                  {profileData.email}
                </Text>
              </TouchableOpacity>
            )}

            {/* Website */}
            {profileData.website_url && (
              <TouchableOpacity
                onPress={() => handleOpenWebsite(profileData.website_url!)}
                className="mb-4"
              >
                <View className="flex-row items-center">
                  <Ionicons name="globe" size={20} color={config.color} />
                  <Text className="text-sm font-semibold text-gray-700 ml-2">
                    Website
                  </Text>
                </View>
                <Text className="text-sm text-blue-600 ml-7" numberOfLines={1}>
                  {profileData.website_url}
                </Text>
              </TouchableOpacity>
            )}

            {/* Instagram */}
            {profileData.instagram_url && (
              <TouchableOpacity
                onPress={() => handleOpenInstagram(profileData.instagram_url!)}
              >
                <View className="flex-row items-center">
                  <FontAwesome
                    name="instagram"
                    size={20}
                    color={config.color}
                  />
                  <Text className="text-sm font-semibold text-gray-700 ml-2">
                    Instagram
                  </Text>
                </View>
                <Text className="text-sm text-blue-600 ml-7" numberOfLines={1}>
                  {profileData.instagram_url}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Extra Sections (Profil tipine özel içerik) */}
        {extraSections}

        {/* Harita */}
        {profileData.latitude && profileData.longitude && (
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
                }}
                initialRegion={{
                  latitude: profileData.latitude,
                  longitude: profileData.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                provider={PROVIDER_GOOGLE}
              >
                <Marker
                  coordinate={{
                    latitude: profileData.latitude,
                    longitude: profileData.longitude,
                  }}
                  title={profileData.name}
                  description={profileData.address}
                >
                  <View className="bg-white rounded-full p-3 items-center justify-center">
                    <Ionicons
                      name={config.icon}
                      size={24}
                      color={config.color}
                    />
                  </View>
                </Marker>
              </MapView>
              <TouchableOpacity
                className="bg-primary mt-4 p-4 rounded-2xl items-center justify-center"
                onPress={() =>
                  openMaps(
                    profileData.latitude,
                    profileData.longitude,
                    profileData.address
                  )
                }
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons name="navigate" size={20} color="white" />
                  <Text className="text-white font-bold">Yol Tarifi Al</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
