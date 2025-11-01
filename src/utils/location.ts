import * as Location from "expo-location";
import { Alert } from "react-native";

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Kullanıcının mevcut konumunu alır
 * @returns Kullanıcının koordinatları veya null (izin reddedilirse)
 */
export const getCurrentLocation =
  async (): Promise<LocationCoordinates | null> => {
    try {
      // Konum izni kontrol et
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Konum İzni Gerekli",
          "Yakınındaki kayıp hayvanları görmek için konum erişim izni vermelisiniz."
        );
        return null;
      }

      // Mevcut konumu al
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Hata", "Konum alınırken bir hata oluştu");
      return null;
    }
  };
