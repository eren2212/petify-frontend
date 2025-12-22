import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useUploadAvatar } from "../hooks/useProfile";
import Toast from "react-native-toast-message";
import { PetifySpinner } from "./PetifySpinner";

interface AvatarPickerProps {
  currentAvatarUrl?: string | null;
  className?: string;
}

export default function AvatarPicker({
  currentAvatarUrl,
  className = "w-24 h-24",
}: AvatarPickerProps) {
  const { mutate: uploadAvatar, isPending } = useUploadAvatar();

  const pickImage = async () => {
    try {
      // Kamera rolü izni iste
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "İzin Gerekli",
          "Avatar yüklemek için galeri erişim izni vermelisiniz."
        );
        return;
      }

      // Image picker aç
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], // Sadece resimler
        allowsEditing: true, // Crop/düzenleme
        aspect: [1, 1], // Kare format
        quality: 0.8, // Kalite (0-1 arası)
      });

      if (result.canceled) {
        console.log("User cancelled image picker");
        return;
      }

      const imageUri = result.assets[0].uri;

      // Upload işlemini başlat
      uploadAvatar(imageUri, {
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: "Başarılı!",
            text2: "Avatar güncellendi",
            position: "top",
            visibilityTime: 3000,
          });
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message || "Avatar yüklenirken hata oluştu";

          Toast.show({
            type: "error",
            text1: "Hata!",
            text2: errorMessage,
            position: "top",
            visibilityTime: 3000,
          });
        },
      });
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Hata", "Resim seçilirken bir hata oluştu");
    }
  };

  // Default avatar
  const defaultAvatar = require("../../assets/images/petify_white.png");

  // Avatar URL oluştur (filename -> full URL)
  const getAvatarUrl = (filename: string | null | undefined) => {
    if (!filename) return null;

    // Eğer zaten tam URL ise (eski data), olduğu gibi kullan
    if (filename.startsWith("http")) {
      return filename;
    }

    // Filename ise backend download endpoint'ini kullan
    const baseUrl =
      process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
    return `${baseUrl}/profile/avatar/${filename}`;
  };

  const avatarUrl = getAvatarUrl(currentAvatarUrl);

  return (
    <Pressable onPress={pickImage} disabled={isPending} className="self-center">
      <View
        className={`${className} rounded-full overflow-hidden bg-gray-200 items-center justify-center`}
      >
        {isPending ? (
          <View className="flex-1 items-center justify-center bg-gray-300">
            <PetifySpinner size={56} />
          </View>
        ) : (
          <Image
            source={avatarUrl ? { uri: avatarUrl } : defaultAvatar}
            className="w-full h-full"
            resizeMode="cover"
          />
        )}
      </View>

      {!isPending && (
        <View className="absolute bottom-0 right-0 bg-primary rounded-full p-2 shadow-lg">
          <Text className="text-white text-xs font-bold">✎</Text>
        </View>
      )}
    </Pressable>
  );
}
