import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import {
  useAuth,
  useAuthActions,
  useTheme,
  useLanguage,
  useUserProfile,
  useAuthUser,
} from "../hooks";

// Auth kullanım örneği
export const AuthExample: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { signIn, signOut } = useAuthActions();

  const handleSignIn = async () => {
    const result = await signIn("test@example.com", "password123");
    if (result.error) {
      Alert.alert("Hata", result.error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return <Text>Yükleniyor...</Text>;
  }

  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-4">Auth Durumu</Text>

      {isAuthenticated ? (
        <View>
          <Text>Hoş geldin: {user?.email}</Text>
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-red-500 p-3 rounded mt-2"
          >
            <Text className="text-white text-center">Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text>Giriş yapılmamış</Text>
          <TouchableOpacity
            onPress={handleSignIn}
            className="bg-blue-500 p-3 rounded mt-2"
          >
            <Text className="text-white text-center">Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Theme kullanım örneği
export const ThemeExample: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-4">Tema Ayarları</Text>

      <TouchableOpacity
        onPress={toggleDarkMode}
        className={`p-3 rounded ${isDarkMode ? "bg-gray-800" : "bg-gray-200"}`}
      >
        <Text className={isDarkMode ? "text-white" : "text-black"}>
          {isDarkMode ? "Karanlık Mod Açık" : "Açık Mod Açık"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Language kullanım örneği
export const LanguageExample: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-4">Dil Ayarları</Text>

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => setLanguage("tr")}
          className={`p-3 rounded ${language === "tr" ? "bg-blue-500" : "bg-gray-300"}`}
        >
          <Text className={language === "tr" ? "text-white" : "text-black"}>
            Türkçe
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setLanguage("en")}
          className={`p-3 rounded ${language === "en" ? "bg-blue-500" : "bg-gray-300"}`}
        >
          <Text className={language === "en" ? "text-white" : "text-black"}>
            English
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Combined user data örneği
export const UserProfileExample: React.FC = () => {
  const { user, profile, isAuthenticated, fullUser } = useAuthUser();
  const { isProfileLoading } = useUserProfile();

  if (!isAuthenticated) {
    return <Text>Lütfen giriş yapın</Text>;
  }

  if (isProfileLoading) {
    return <Text>Profil yükleniyor...</Text>;
  }

  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-4">Kullanıcı Profili</Text>

      <Text>Email: {user?.email}</Text>
      <Text>Ad Soyad: {profile?.full_name || "Belirtilmemiş"}</Text>
      <Text>Telefon: {profile?.phone || "Belirtilmemiş"}</Text>

      {fullUser && (
        <View className="mt-4 p-3 bg-gray-100 rounded">
          <Text className="font-bold">Birleştirilmiş Veri:</Text>
          <Text>ID: {fullUser.id}</Text>
          <Text>Email: {fullUser.email}</Text>
          <Text>Ad: {fullUser.full_name}</Text>
        </View>
      )}
    </View>
  );
};
