import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

/**
 * Galeriden resim seçme utility fonksiyonu
 * @param aspectRatio - [width, height] formatında aspect ratio (varsayılan [1, 1])
 * @returns Seçilen resmin URI'si veya null
 */
export const pickImageFromLibrary = async (
  aspectRatio: [number, number] = [1, 1]
): Promise<string | null> => {
  try {
    // Galeri izni iste
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "İzin Gerekli",
        "Resim yüklemek için galeri erişim izni vermelisiniz."
      );
      return null;
    }

    // Image picker aç
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: aspectRatio,
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error("Image picker error:", error);
    Alert.alert("Hata", "Resim seçilirken bir hata oluştu");
    return null;
  }
};

/**
 * Kameradan fotoğraf çekme utility fonksiyonu
 * @param aspectRatio - [width, height] formatında aspect ratio (varsayılan [1, 1])
 * @returns Çekilen fotoğrafın URI'si veya null
 */
export const takePhotoWithCamera = async (
  aspectRatio: [number, number] = [1, 1]
): Promise<string | null> => {
  try {
    // Kamera izni iste
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "İzin Gerekli",
        "Fotoğraf çekmek için kamera erişim izni vermelisiniz."
      );
      return null;
    }

    // Kamera aç
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: aspectRatio,
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error("Camera error:", error);
    Alert.alert("Hata", "Fotoğraf çekilirken bir hata oluştu");
    return null;
  }
};
