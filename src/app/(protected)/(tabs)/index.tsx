import { useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../../stores";
import { useCurrentUser, getActiveRole } from "../../../hooks/useAuth";
import { PetifySpinner } from "@/components/PetifySpinner";

export default function Home() {
  const { signOut } = useAuthStore();

  // TanStack Query'den user bilgisini al
  const { data: user, isLoading } = useCurrentUser();

  // Aktif rolü al (approved olan)
  const activeRole = getActiveRole(user);
  const roleType = activeRole?.role_type;

  // ⭐ Flash'ı engelle - pet_owner değilse hemen yönlendir
  // useEffect(() => {
  //   if (roleType && roleType !== "pet_owner") {
  //     const roleRedirects: Record<string, any> = {
  //       pet_shop: "/(protected)/(tabs)/products",
  //       pet_clinic: "/(protected)/(tabs)/doctors",
  //       pet_sitter: "/(protected)/(tabs)/services",
  //       pet_hotel: "/(protected)/(tabs)/services",
  //     };

  //     const redirectPath = roleRedirects[roleType];
  //     if (redirectPath) {
  //       router.replace(redirectPath as any);
  //     }
  //   }
  // }, [roleType]);

  // Loading state - User yüklenirken göster
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
          <PetifySpinner size={180} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // pet_owner değilse null döndür (hiçbir şey render etme)
  if (roleType && roleType !== "pet_owner") {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut();
      Toast.show({
        type: "success",
        text1: "Çıkış Başarılı",
        text2: "Başarıyla çıkış yaptınız",
        bottomOffset: 40,
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      Toast.show({
        type: "error",
        text1: "Çıkış Yapıldı",
        text2: "Local oturum temizlendi",
        bottomOffset: 40,
      });
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-background">
        <View className="p-6">
          <Text className="text-3xl font-bold text-text mb-8">Ana Sayfa</Text>

          <TouchableOpacity className="bg-red-500 rounded-xl p-5 mb-4">
            <Text className="text-white text-center text-base font-semibold">
              Petify Uygulamasına Hoşgeldiniz
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
