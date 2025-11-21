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
import MapLocationPicker from "@/components/map/MapLocationPicker";
import { pickImageFromLibrary } from "@/utils/imagePicker";

interface AddPetShopProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (profileData: PetShopProfileData, logoUri: string | null) => void;
  isLoading?: boolean;
}

export interface PetShopProfileData {
  shop_name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone_number: string;
  email: string;
  website_url?: string;
  instagram_url?: string;
  working_hours: WorkingHour[];
}

interface WorkingHour {
  day: string;
  hours: string;
}

const DAYS_OF_WEEK = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

export default function AddPetShopProfileModal({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}: AddPetShopProfileModalProps) {
  // Form state
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(41.0082);
  const [longitude, setLongitude] = useState(28.9784);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [logoUri, setLogoUri] = useState<string | null>(null);

  // Çalışma saatleri state - Her gün için başlangıç ve bitiş
  const [workingHours, setWorkingHours] = useState<
    { day: string; start: string; end: string; closed: boolean }[]
  >(
    DAYS_OF_WEEK.map((day) => ({
      day,
      start: "09:00",
      end: "18:00",
      closed: false,
    }))
  );

  // Map picker state
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Logo seçme fonksiyonu
  const handlePickLogo = async () => {
    const imageUri = await pickImageFromLibrary([1, 1]); // Kare format
    if (imageUri) {
      setLogoUri(imageUri);
    }
  };

  // Konum seçimi
  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(addr);
  };

  // Çalışma saati güncelleme
  const updateWorkingHour = (
    index: number,
    field: "start" | "end" | "closed",
    value: string | boolean
  ) => {
    const newWorkingHours = [...workingHours];
    if (field === "closed") {
      newWorkingHours[index].closed = value as boolean;
    } else {
      newWorkingHours[index][field] = value as string;
    }
    setWorkingHours(newWorkingHours);
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!shopName.trim()) {
      Alert.alert("Hata", "Mağaza adı zorunludur");
      return false;
    }

    if (!address.trim()) {
      Alert.alert("Hata", "Adres zorunludur");
      return false;
    }

    if (!phoneNumber.trim() || phoneNumber.length !== 10) {
      Alert.alert("Hata", "Geçerli bir 10 haneli telefon numarası girin");
      return false;
    }

    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Hata", "Geçerli bir e-posta adresi girin");
      return false;
    }

    return true;
  };

  // Form submit
  const handleSubmit = () => {
    if (!validateForm()) return;

    // Çalışma saatlerini formatla
    const formattedWorkingHours: WorkingHour[] = workingHours.map((wh) => ({
      day: wh.day,
      hours: wh.closed ? "Kapalı" : `${wh.start}-${wh.end}`,
    }));

    const profileData: PetShopProfileData = {
      shop_name: shopName.trim(),
      description: description.trim(),
      address: address.trim(),
      latitude,
      longitude,
      phone_number: phoneNumber.trim(),
      email: email.trim(),
      website_url: websiteUrl.trim() || undefined,
      instagram_url: instagramUrl.trim() || undefined,
      working_hours: formattedWorkingHours,
    };

    onSubmit(profileData, logoUri);
  };

  // Form reset
  const resetForm = () => {
    setShopName("");
    setDescription("");
    setAddress("");
    setLatitude(41.0082);
    setLongitude(28.9784);
    setPhoneNumber("");
    setEmail("");
    setWebsiteUrl("");
    setInstagramUrl("");
    setLogoUri(null);
    setWorkingHours(
      DAYS_OF_WEEK.map((day) => ({
        day,
        start: "09:00",
        end: "18:00",
        closed: false,
      }))
    );
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
                  Pet Shop Profili Oluştur
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
                      {logoUri ? (
                        <Image
                          source={{ uri: logoUri }}
                          className="w-full h-full rounded-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="items-center justify-center">
                          <Ionicons
                            name="storefront"
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
                      {logoUri ? "Logo Değiştir" : "Logo Yükle"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Mağaza Adı */}
                <View className="mb-4">
                  <Text className="text-sm text-gray-600 mb-2">
                    Mağaza Adı *
                  </Text>
                  <TextInput
                    value={shopName}
                    onChangeText={setShopName}
                    placeholder="Mağaza adını girin"
                    placeholderTextColor="#9CA3AF"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  />
                </View>

                {/* Açıklama */}
                <View className="mb-4">
                  <Text className="text-sm text-gray-600 mb-2">Açıklama</Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Mağazanız hakkında kısa bir açıklama"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  />
                </View>

                {/* Adres ve Konum */}
                <View className="mb-4">
                  <Text className="text-sm text-gray-600 mb-2">Adres *</Text>
                  <TouchableOpacity
                    onPress={() => setShowMapPicker(true)}
                    className="border border-gray-200 rounded-xl px-4 py-3 bg-white flex-row justify-between items-center"
                  >
                    <Text
                      className={
                        address && address !== "İstanbul, Türkiye"
                          ? "text-green-600 font-semibold"
                          : "text-gray-400"
                      }
                      numberOfLines={1}
                    >
                      {address && address !== "İstanbul, Türkiye"
                        ? "✓ Başarıyla Seçildi"
                        : "Haritadan konum seçin"}
                    </Text>
                    <Ionicons
                      name="location"
                      size={24}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
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

                {/* E-posta */}
                <View className="mb-4">
                  <Text className="text-sm text-gray-600 mb-2">
                    E-posta Adresi *
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="ornek@email.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  />
                </View>

                {/* Website (Opsiyonel) */}
                <View className="mb-4">
                  <Text className="text-sm text-gray-600 mb-2">
                    Website (Opsiyonel)
                  </Text>
                  <TextInput
                    value={websiteUrl}
                    onChangeText={setWebsiteUrl}
                    placeholder="https://www.ornek.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="url"
                    autoCapitalize="none"
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

                {/* Çalışma Saatleri */}
                <View className="mb-6">
                  <Text className="text-base font-semibold text-gray-900 mb-3">
                    Çalışma Saatleri
                  </Text>
                  {workingHours.map((wh, index) => (
                    <View
                      key={wh.day}
                      className="mb-3 bg-gray-50 rounded-xl p-3"
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm font-medium text-gray-700 w-24">
                          {wh.day}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            updateWorkingHour(index, "closed", !wh.closed)
                          }
                          className={`px-3 py-1 rounded-lg ${
                            wh.closed ? "bg-red-100" : "bg-green-100"
                          }`}
                        >
                          <Text
                            className={`text-xs font-medium ${
                              wh.closed ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {wh.closed ? "Kapalı" : "Açık"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {!wh.closed && (
                        <View className="flex-row items-center gap-2">
                          <TextInput
                            value={wh.start}
                            onChangeText={(value) =>
                              updateWorkingHour(index, "start", value)
                            }
                            placeholder="09:00"
                            placeholderTextColor="#9CA3AF"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 bg-white text-center"
                          />
                          <Text className="text-gray-500">-</Text>
                          <TextInput
                            value={wh.end}
                            onChangeText={(value) =>
                              updateWorkingHour(index, "end", value)
                            }
                            placeholder="18:00"
                            placeholderTextColor="#9CA3AF"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 bg-white text-center"
                          />
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </ScrollView>

              {/* Submit Button */}
              <View className="px-6 py-4 border-t border-gray-200">
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isLoading || !shopName.trim() || !address.trim()}
                  className={`py-4 rounded-full ${
                    isLoading || !shopName.trim() || !address.trim()
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
        {/* Map Location Picker */}
        <MapLocationPicker
          visible={showMapPicker}
          onClose={() => setShowMapPicker(false)}
          onLocationSelect={handleLocationSelect}
          initialLatitude={latitude}
          initialLongitude={longitude}
          initialAddress={address}
        />
      </Modal>
    </>
  );
}
