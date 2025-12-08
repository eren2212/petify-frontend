import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/styles/theme/color";
import { pickImageFromLibrary } from "@/utils/imagePicker";

interface AddPetSitterProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    profileData: PetSitterProfileData,
    profileImageUri: string | null
  ) => void;
  isLoading?: boolean;
}

export interface PetSitterProfileData {
  display_name: string;
  bio: string;
  experience_years: number;
  phone_number: string;
  instagram_url: string;
  is_available: boolean;
}

export default function AddPetSitterProfileModal({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}: AddPetSitterProfileModalProps) {
  // Form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState<number | undefined>(
    undefined
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  // Logo seçme fonksiyonu
  const handlePickLogo = async () => {
    const imageUri = await pickImageFromLibrary([1, 1]); // Kare format
    if (imageUri) {
      setProfileImageUri(imageUri);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!displayName.trim()) {
      Alert.alert("Hata", "Display name zorunludur");
      return false;
    }

    if (!phoneNumber.trim() || phoneNumber.length !== 10) {
      Alert.alert("Hata", "Geçerli bir 10 haneli telefon numarası girin");
      return false;
    }

    return true;
  };

  // Form submit
  const handleSubmit = () => {
    if (!validateForm()) return;

    const profileData: PetSitterProfileData = {
      display_name: displayName.trim(),
      bio: bio.trim(),
      experience_years: experienceYears || 0,
      phone_number: phoneNumber.trim(),
      instagram_url: instagramUrl.trim() || "",
      is_available: isAvailable,
    };

    onSubmit(profileData, profileImageUri);
  };

  // Form reset
  const resetForm = () => {
    setDisplayName("");
    setBio("");
    setExperienceYears(0);
    setPhoneNumber("");
    setInstagramUrl("");
    setProfileImageUri(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
          keyboardVerticalOffset={0}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl h-5/6">
              {/* Header */}
              <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
                <Text className="text-xl font-bold text-gray-900">
                  Pet Siter Profili Oluştur
                </Text>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={28} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <ScrollView
                className="flex-1 px-6 py-4"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {/* Logo Yükleme */}
                <View className="mb-6 items-center">
                  <TouchableOpacity
                    onPress={handlePickLogo}
                    disabled={isLoading}
                    className="items-center"
                  >
                    <View className="w-32 h-32 rounded-full bg-orange-100 items-center justify-center mb-2">
                      {profileImageUri ? (
                        <Image
                          source={{ uri: profileImageUri }}
                          className="w-full h-full rounded-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="items-center justify-center">
                          <Ionicons
                            name="person"
                            size={48}
                            color={COLORS.primary}
                          />
                        </View>
                      )}
                      <View className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full items-center justify-center">
                        <Text className="text-white text-xl font-bold">+</Text>
                      </View>
                    </View>
                    <Text className="text-sm text-gray-500">
                      {profileImageUri
                        ? "Profil Resmi Değiştir"
                        : "Profil Resmi Yükle"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="mb-4">
                  <Text className="text-sm text-gray-600 mb-2">
                    Pet Siter Adı *
                  </Text>
                  <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Display name girin"
                    placeholderTextColor="#9CA3AF"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  />
                </View>

                {/* Açıklama */}
                <View className="mb-4">
                  <Text className="text-sm text-gray-600 mb-2">Açıklama</Text>
                  <TextInput
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Bio girin"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-sm text-gray-600 mb-2">
                    Deneyim Yılı
                  </Text>
                  <TextInput
                    value={experienceYears?.toString() || ""}
                    onChangeText={(text) => setExperienceYears(Number(text))}
                    placeholder="Deneyim yılı girin"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  />
                </View>

                {/* Telefon */}
                <View className="mb-4">
                  <Text className="text-sm text-gray-600 mb-2">
                    Telefon Numarası *
                  </Text>
                  <TextInput
                    value={phoneNumber}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9]/g, "");
                      setPhoneNumber(numericValue);
                    }}
                    placeholder="5xxxxxxxxx"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    maxLength={10}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  />
                </View>

                {/* Instagram (Opsiyonel) */}
                <View className="mb-4">
                  <Text className="text-sm text-gray-600 mb-2">
                    Instagram (Opsiyonel)
                  </Text>
                  <TextInput
                    value={instagramUrl}
                    onChangeText={setInstagramUrl}
                    placeholder="https://instagram.com/kullaniciadi"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="url"
                    autoCapitalize="none"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  />
                </View>
              </ScrollView>

              {/* Submit Button */}
              <View className="px-6 py-4 border-t border-gray-200">
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={
                    isLoading || !displayName.trim() || experienceYears === 0
                  }
                  className={`py-4 rounded-full ${
                    isLoading || !displayName.trim() || experienceYears === 0
                      ? "bg-gray-300"
                      : "bg-primary"
                  }`}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-center text-base">
                      Profili Oluştur
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
