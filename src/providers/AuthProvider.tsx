import React, { useEffect } from "react";
import { View } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useAuthStore, useAppStore } from "../stores";
import { getCurrentLocation } from "../utils/location";
import { PetifySpinner } from "@/components/PetifySpinner";
import { useCartStore } from "@/stores/useCartStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNotifications } from "@/hooks/useNotifications";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const segments = useSegments();

  // Store'lardan gerekli fonksiyonları çekiyoruz
  const { isAuthenticated, isLoading, initialize, session } = useAuthStore();
  const { setLocation, setLocationLoading, setLocationError } = useAppStore();

  // CartStore'dan setActiveUser fonksiyonunu alıyoruz
  const setActiveUser = useCartStore((state) => state.setActiveUser);

  // 🔔 Push Notification Hook (sadece isAuthenticated=true iken token kaydeder/siler)
  const { expoPushToken, isRegistered } = useNotifications(isAuthenticated);

  // 1. AUTH VE SEPET SENKRONİZASYONU (En Önemli Kısım)
  useEffect(() => {
    const initializeAuth = async () => {
      // A) Auth Store'u başlat (bu AsyncStorage'dan token'ları okur)
      await initialize();

      // B) AsyncStorage'dan user bilgisini oku
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          console.log("🚀 Uygulama açıldı, mevcut kullanıcı:", user.id);
          setActiveUser(user.id);
        } else {
          console.log("👤 Kullanıcı bilgisi bulunamadı");
          setActiveUser(null);
        }
      } catch (error) {
        console.error("❌ User bilgisi okunamadı:", error);
        setActiveUser(null);
      }
    };

    initializeAuth();
  }, []);

  // 2. AUTH DURUMU DEĞİŞİKLİKLERİNİ DİNLE
  // isAuthenticated değiştiğinde (Login/Logout), cart'ı güncelle
  useEffect(() => {
    const syncCartWithAuth = async () => {
      if (isAuthenticated) {
        // Giriş yapıldı - User ID'yi cart'a aktar
        try {
          const userString = await AsyncStorage.getItem("user");
          if (userString) {
            const user = JSON.parse(userString);
            console.log("🔄 Auth durumu değişti (Giriş):", user.id);
            setActiveUser(user.id);
          }
        } catch (error) {
          console.error("❌ Login sonrası user bilgisi okunamadı:", error);
        }
      } else {
        // Çıkış yapıldı - Cart'ı temizle
        console.log("👋 Auth durumu değişti (Çıkış)");
        setActiveUser(null);
      }
    };

    // İlk render'da çalışmasın (sadece değişikliklerde)
    if (!isLoading) {
      syncCartWithAuth();
    }
  }, [isAuthenticated, isLoading]);

  // 2. KONUM İŞLEMLERİ (Ayrı useEffect daha temizdir)
  useEffect(() => {
    const fetchLocation = async () => {
      setLocationLoading(true);
      setLocationError(null);

      try {
        const location = await getCurrentLocation();
        if (location) {
          setLocation(location.latitude, location.longitude);
        } else {
          setLocationError("Konum alınamadı");
        }
      } catch (error) {
        console.error("Konum hatası:", error);
        setLocationError("Konum alınırken hata oluştu");
      } finally {
        setLocationLoading(false);
      }
    };

    fetchLocation();
  }, []);

  // 🔔 NOTIFICATION TOKEN KAYIT DURUMU LOGLAMA
  useEffect(() => {
    if (isRegistered && expoPushToken) {
      console.log(
        "✅ Push notification başarıyla kaydedildi:",
        expoPushToken
      );
    }
  }, [isRegistered, expoPushToken]);

  // 3. YÖNLENDİRME (ROUTING) MANTIĞI
  // Burayı yorum satırına almıştın, ihtiyacın varsa açabilirsin.
  // useEffect(() => {
  //   if (isLoading) return;
  //   const inAuthGroup = segments[0] === "(auth)";
  //   const inProtectedGroup = segments[0] === "(protected)";
  //
  //   if (!isAuthenticated && inProtectedGroup) {
  //     router.replace("/(auth)/signin");
  //   } else if (isAuthenticated && inAuthGroup) {
  //     router.replace("/(protected)/(tabs)");
  //   }
  // }, [isAuthenticated, segments, isLoading]);

  // Yükleniyor ekranı
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <PetifySpinner size={180} />
      </View>
    );
  }

  return <>{children}</>;
};
