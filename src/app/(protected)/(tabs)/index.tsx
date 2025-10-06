import { View, Text, Pressable, TouchableOpacity } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../../stores";

export default function Home() {
  // Zustand store'dan signOut ve user bilgilerini al
  const { signOut, user } = useAuthStore();

  const handleLogout = async () => {
    try {
      // Store'daki signOut fonksiyonunu kullan
      await signOut();

      Toast.show({
        type: "success",
        text1: "Çıkış Başarılı",
        text2: "Başarıyla çıkış yaptınız",
        bottomOffset: 40,
      });
      // AuthProvider otomatik olarak signin'e yönlendirecek
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

          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 rounded-xl p-5 mb-4"
          >
            <Text className="text-white text-center text-base font-semibold">
              Çıkış Yap
            </Text>
          </TouchableOpacity>

          <Pressable
            onPress={() => router.push("/(auth)/signin")}
            className="bg-primary rounded-xl p-5"
          >
            <Text className="text-white text-center text-base font-semibold">
              Signin Sayfası
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
