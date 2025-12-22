import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "@/styles/theme/color";
import { useAuthStore } from "@/stores/authStore";
import { PetifySpinner } from "@/components/PetifySpinner";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <StatusBar style="light" />
        <PetifySpinner size={180} />
      </SafeAreaView>
    );
  }
  if (isAuthenticated) {
    return <Redirect href="/(protected)/(tabs)" />;
  }
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      {/* Gradient Background */}
      <LinearGradient
        colors={[COLORS.primary, "#2980B9"]} // Gradient efekti için farklı tonlar
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Ana içerik */}
      <View className="flex-1 items-center justify-evenly py-10">
        {/* Logo alanı */}
        <View className="items-center">
          <View className="bg-white/20 rounded-full p-6 shadow-lg">
            <Image
              source={require("../../assets/images/petify_gri.png")}
              className="w-52 h-52 object-contain"
              resizeMode="contain"
            />
          </View>

          <Text className="text-white/80 text-base mt-4 text-center px-10 font-bold">
            Evcil dostlarının bakımı, sadece bir dokunuş uzağında.
          </Text>
        </View>
        {/* Butonlar */}
        <View className="w-full items-center px-8">
          <TouchableOpacity
            onPress={() => router.replace("/signin")}
            className="w-full bg-white py-4 rounded-full shadow-md"
          >
            <Text className="text-center text-[#2980B9] text-lg font-semibold">
              Giriş Yap
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/signup")}
            className="w-full py-4 rounded-full border-2 border-white mt-4"
          >
            <Text className="text-center text-white text-lg font-semibold">
              Kayıt Ol
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
