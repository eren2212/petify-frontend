import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCurrentUser } from "@/hooks/useAuth";

export const HomeHeader = () => {
  const { data: user } = useCurrentUser();

  // Günün saatine göre selamlama
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi Günler";
    return "İyi Akşamlar";
  };

  // Kullanıcı ismini al (varsa)
  const getUserDisplayName = () => {
    if (user?.profile?.full_name) {
      return `${user.profile.full_name}`;
    }
    return "Kullanıcı";
  };

  // Bildirim butonu handler
  const handleNotificationPress = () => {
    // TODO: Bildirimler sayfasına yönlendir
    console.log("Bildirimler açılacak");
  };
  const baseUrl =
    process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
  const avatarUrl = `${baseUrl}/profile/avatar/${user?.profile?.avatar_url}`;
  return (
    <View className="flex-row items-center justify-between px-6 pt-4 pb-2 bg-background">
      {/* Sol Taraf: Avatar + Selamlama */}
      <View className="flex-row items-center gap-3">
        {/* Profil Resmi */}
        <View className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
          {user?.profile?.avatar_url ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-primary-500 items-center justify-center">
              <Text className="text-white text-xl font-bold">
                {getUserDisplayName().charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Selamlama ve İsim */}
        <View>
          <Text className="text-gray-500 text-sm font-medium">
            {getGreeting()}
          </Text>
          <Text className="text-text text-lg font-bold">
            {getUserDisplayName()} 🐾
          </Text>
        </View>
      </View>

      {/* Sağ Taraf: Bildirim İkonu */}
      <TouchableOpacity
        onPress={handleNotificationPress}
        className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-sm"
        activeOpacity={0.7}
      >
        <Ionicons name="notifications-outline" size={24} color="#1F2937" />
        {/* Bildirim badge'i (örnek) */}
        <View className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </TouchableOpacity>
    </View>
  );
};
