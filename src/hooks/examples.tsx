import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import {
  useAuth,
  useAuthActions,
  useAuthFull,
  useTheme,
  useLanguage,
  useOnboarding,
  useAppLoading,
  useUserProfile,
  useUserActions,
  useAuthUser,
  useStores,
  useStoreReset,
} from "./index";

// Auth hook'ları kullanım örnekleri
export const AuthHookExamples: React.FC = () => {
  // Ayrı hook'lar kullanımı (önerilen)
  const { user, isAuthenticated, isLoading } = useAuth();
  const { signIn, signOut } = useAuthActions();

  // Tek hook kullanımı
  const authFull = useAuthFull();

  const handleSignIn = async () => {
    const result = await signIn("test@example.com", "password123");
    if (result.error) {
      Alert.alert("Hata", result.error);
    }
  };

  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-4">Auth Hook Örnekleri</Text>

      <Text className="font-semibold mb-2">Ayrı Hook'lar:</Text>
      <Text>Authenticated: {isAuthenticated ? "Evet" : "Hayır"}</Text>
      <Text>Loading: {isLoading ? "Evet" : "Hayır"}</Text>
      <Text>User: {user?.email || "Yok"}</Text>

      <Text className="font-semibold mb-2 mt-4">Tek Hook (authFull):</Text>
      <Text>Authenticated: {authFull.isAuthenticated ? "Evet" : "Hayır"}</Text>
      <Text>User: {authFull.user?.email || "Yok"}</Text>

      <TouchableOpacity
        onPress={handleSignIn}
        className="bg-blue-500 p-3 rounded mt-4"
      >
        <Text className="text-white text-center">Test Giriş</Text>
      </TouchableOpacity>
    </View>
  );
};

// App hook'ları kullanım örnekleri
export const AppHookExamples: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { isFirstLaunch, setFirstLaunch } = useOnboarding();
  const { isAppLoading, setAppLoading } = useAppLoading();

  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-4">App Hook Örnekleri</Text>

      {/* Theme Hook */}
      <View className="mb-4">
        <Text className="font-semibold mb-2">Theme Hook:</Text>
        <TouchableOpacity
          onPress={toggleDarkMode}
          className={`p-3 rounded ${isDarkMode ? "bg-gray-800" : "bg-gray-200"}`}
        >
          <Text className={isDarkMode ? "text-white" : "text-black"}>
            {isDarkMode ? "Karanlık Mod" : "Açık Mod"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language Hook */}
      <View className="mb-4">
        <Text className="font-semibold mb-2">Language Hook:</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setLanguage("tr")}
            className={`p-2 rounded ${language === "tr" ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <Text className={language === "tr" ? "text-white" : "text-black"}>
              TR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLanguage("en")}
            className={`p-2 rounded ${language === "en" ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <Text className={language === "en" ? "text-white" : "text-black"}>
              EN
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Onboarding Hook */}
      <View className="mb-4">
        <Text className="font-semibold mb-2">Onboarding Hook:</Text>
        <Text>İlk Açılış: {isFirstLaunch ? "Evet" : "Hayır"}</Text>
        <TouchableOpacity
          onPress={() => setFirstLaunch(!isFirstLaunch)}
          className="bg-green-500 p-2 rounded mt-2"
        >
          <Text className="text-white text-center">Toggle İlk Açılış</Text>
        </TouchableOpacity>
      </View>

      {/* App Loading Hook */}
      <View className="mb-4">
        <Text className="font-semibold mb-2">App Loading Hook:</Text>
        <Text>Yükleniyor: {isAppLoading ? "Evet" : "Hayır"}</Text>
        <TouchableOpacity
          onPress={() => setAppLoading(!isAppLoading)}
          className="bg-orange-500 p-2 rounded mt-2"
        >
          <Text className="text-white text-center">Toggle Loading</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// User hook'ları kullanım örnekleri
export const UserHookExamples: React.FC = () => {
  const { profile, isProfileLoading } = useUserProfile();
  const { updateProfile } = useUserActions();
  const { user, fullUser, isAuthenticated } = useAuthUser();

  const handleUpdateProfile = () => {
    updateProfile({
      full_name: "Test Kullanıcı",
      phone: "+90 555 123 4567",
    });
  };

  if (!isAuthenticated) {
    return <Text>Lütfen giriş yapın</Text>;
  }

  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-4">User Hook Örnekleri</Text>

      <View className="mb-4">
        <Text className="font-semibold mb-2">User Profile Hook:</Text>
        <Text>Loading: {isProfileLoading ? "Evet" : "Hayır"}</Text>
        <Text>Ad Soyad: {profile?.full_name || "Belirtilmemiş"}</Text>
        <Text>Telefon: {profile?.phone || "Belirtilmemiş"}</Text>
      </View>

      <View className="mb-4">
        <Text className="font-semibold mb-2">Auth User Hook:</Text>
        <Text>Email: {user?.email}</Text>
        <Text>Full User: {fullUser ? "Mevcut" : "Yok"}</Text>
      </View>

      <TouchableOpacity
        onPress={handleUpdateProfile}
        className="bg-purple-500 p-3 rounded"
      >
        <Text className="text-white text-center">Profili Güncelle</Text>
      </TouchableOpacity>
    </View>
  );
};

// Store hook'ları kullanım örnekleri
export const StoreHookExamples: React.FC = () => {
  const { auth, app, user } = useStores();
  const { resetAllStores, resetAuth } = useStoreReset();

  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-4">Store Hook Örnekleri</Text>

      <View className="mb-4">
        <Text className="font-semibold mb-2">useStores Hook:</Text>
        <Text>Auth User: {auth.user?.email || "Yok"}</Text>
        <Text>App Theme: {app.isDarkMode ? "Karanlık" : "Açık"}</Text>
        <Text>User Profile: {user.profile?.full_name || "Yok"}</Text>
      </View>

      <View className="mb-4">
        <Text className="font-semibold mb-2">Store Reset Hook:</Text>
        <TouchableOpacity
          onPress={resetAuth}
          className="bg-red-500 p-2 rounded mb-2"
        >
          <Text className="text-white text-center">Auth Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={resetAllStores}
          className="bg-red-700 p-2 rounded"
        >
          <Text className="text-white text-center">Tüm Store'ları Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
