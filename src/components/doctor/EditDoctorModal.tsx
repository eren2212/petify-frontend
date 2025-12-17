import React, { useState, useEffect } from "react";
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
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../styles/theme/color";
import Toast from "react-native-toast-message";
import { pickImageFromLibrary } from "../../utils/imagePicker";
import { useUpdateDoctor } from "../../hooks";
import { petClinicDoctorsApi } from "../../lib/api";

interface EditDoctorModalProps {
  visible: boolean;
  onClose: () => void;
  doctor: any; // Mevcut doktor bilgileri
}

export default function EditDoctorModal({
  visible,
  onClose,
  doctor,
}: EditDoctorModalProps) {
  const { mutate: updateDoctor, isPending: isUpdating } = useUpdateDoctor();

  // Form state
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [specialization, setSpecialization] = useState<string>("");
  const [experienceYears, setExperienceYears] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [doctorImageUri, setDoctorImageUri] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);

  // Gender seçenekleri
  const genderOptions = [
    { value: "male", label: "Erkek" },
    { value: "female", label: "Kadın" },
  ];

  // Doctor bilgileri değiştiğinde formu doldur
  useEffect(() => {
    if (doctor) {
      setFirstName(doctor.first_name || "");
      setLastName(doctor.last_name || "");
      setGender(doctor.gender || "");
      setSpecialization(doctor.specialization || "");
      setExperienceYears(doctor.experience_years?.toString() || "");
      setBio(doctor.bio || "");

      // Mevcut fotoğrafı ayarla
      if (doctor.photo_url) {
        const photoUrl = `${process.env.EXPO_PUBLIC_API_URL}/petclinicdoctors/image/${doctor.photo_url}`;
        setExistingPhotoUrl(photoUrl);
      }
    }
  }, [doctor]);

  // Gender seçim fonksiyonu
  const handleGenderSelect = (value: "male" | "female") => {
    setGender(value);
    setShowGenderDropdown(false);
  };

  // Resim seçme fonksiyonu
  const handlePickImage = async () => {
    const imageUri = await pickImageFromLibrary([1, 1]); // Kare format
    if (imageUri) {
      setDoctorImageUri(imageUri);
      setExistingPhotoUrl(null); // Yeni fotoğraf seçildiğinde eskisini temizle
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    // Validasyon
    if (!firstName.trim()) {
      Toast.show({
        type: "error",
        text1: "Ad zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!lastName.trim()) {
      Toast.show({
        type: "error",
        text1: "Soyad zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!gender) {
      Toast.show({
        type: "error",
        text1: "Cinsiyet zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!specialization.trim()) {
      Toast.show({
        type: "error",
        text1: "Uzmanlık alanı zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!experienceYears.trim() || parseInt(experienceYears) < 0) {
      Toast.show({
        type: "error",
        text1: "Geçerli bir deneyim yılı giriniz!",
        bottomOffset: 40,
      });
      return;
    }

    // Backend'e gönderilecek data
    const doctorData = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      gender,
      specialization: specialization.trim(),
      experience_years: parseInt(experienceYears),
      bio: bio.trim() || undefined,
    };

    updateDoctor(
      { id: doctor.id, data: doctorData },
      {
        onSuccess: async (response: any) => {
          console.log("✅ Doktor başarıyla güncellendi!");

          // Eğer yeni fotoğraf seçildiyse, fotoğrafı yükle
          if (doctorImageUri) {
            try {
              await petClinicDoctorsApi.uploadDoctorImage(
                doctor.id,
                doctorImageUri
              );
              console.log("✅ Doktor resmi başarıyla güncellendi!");
              Toast.show({
                type: "success",
                text1: "Doktor ve fotoğrafı başarıyla güncellendi!",
                bottomOffset: 40,
              });
            } catch (imageError: any) {
              console.error("❌ Resim yükleme hatası:", imageError);
              Toast.show({
                type: "warning",
                text1: "Doktor güncellendi ancak resim yüklenemedi",
                text2: "Resmi daha sonra ekleyebilirsiniz",
                bottomOffset: 40,
              });
            }
          } else {
            Toast.show({
              type: "success",
              text1: "Doktor başarıyla güncellendi!",
              bottomOffset: 40,
            });
          }

          onClose();
        },
        onError: (error: any) => {
          Toast.show({
            type: "error",
            text1:
              error?.response?.data?.message ||
              "Doktor güncellenirken bir hata oluştu",
            bottomOffset: 40,
          });
        },
      }
    );
  };

  const getGenderLabel = () => {
    const selected = genderOptions.find((opt) => opt.value === gender);
    return selected ? selected.label : "Cinsiyet Seç";
  };

  // Görüntülenecek resmi belirle (yeni veya mevcut)
  const displayImageUri = doctorImageUri || existingPhotoUrl;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 mt-16 bg-white rounded-t-3xl">
            {/* Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
              <Text className="text-2xl font-bold text-gray-900">
                Doktor Düzenle
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons name="close" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView
              className="flex-1 px-6"
              showsVerticalScrollIndicator={false}
            >
              {/* Photo Section */}
              <View className="py-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Fotoğraf
                </Text>

                <TouchableOpacity
                  className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 items-center"
                  onPress={handlePickImage}
                  disabled={isUpdating}
                >
                  {displayImageUri ? (
                    <View className="w-full items-center">
                      <Image
                        source={{ uri: displayImageUri }}
                        className="w-32 h-32 rounded-xl mb-3"
                        resizeMode="cover"
                      />
                      <View className="absolute top-2 right-2 bg-white rounded-full p-2">
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#10B981"
                        />
                      </View>
                      <Text className="text-green-600 font-medium text-base">
                        {doctorImageUri
                          ? "Yeni Fotoğraf Seçildi"
                          : "Mevcut Fotoğraf"}
                      </Text>
                      <Text className="text-gray-400 text-sm mt-1">
                        Değiştirmek için tıklayın
                      </Text>
                    </View>
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="camera-plus"
                        size={48}
                        color="#9CA3AF"
                      />
                      <Text className="text-gray-500 font-medium mt-3 text-base">
                        Fotoğraf Ekle
                      </Text>
                      <Text className="text-gray-400 text-sm mt-1 text-center">
                        Doktorun fotoğrafını yükleyin.
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Doctor Details Section */}
              <View className="py-6 border-t border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Doktor Bilgileri
                </Text>

                {/* First Name */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Ad *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: Ahmet"
                    placeholderTextColor="#9CA3AF"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>

                {/* Last Name */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Soyad *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: Yılmaz"
                    placeholderTextColor="#9CA3AF"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>

                {/* Gender Dropdown */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Cinsiyet *
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                  >
                    <Text
                      className={gender ? "text-gray-900" : "text-gray-400"}
                    >
                      {getGenderLabel()}
                    </Text>
                    <Text className="text-gray-400">
                      {showGenderDropdown ? "▲" : "▼"}
                    </Text>
                  </TouchableOpacity>

                  {/* Dropdown Menu */}
                  {showGenderDropdown && (
                    <View className="mt-2 bg-white border border-gray-200 rounded-xl">
                      {genderOptions.map((option, index: number) => (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() =>
                            handleGenderSelect(
                              option.value as "male" | "female"
                            )
                          }
                          className={`px-4 py-3 ${
                            index < genderOptions.length - 1
                              ? "border-b border-gray-100"
                              : ""
                          }`}
                        >
                          <Text className="text-gray-900">{option.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Specialization */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Uzmanlık Alanı *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: İç Hastalıklar, Cerrahi, vb."
                    placeholderTextColor="#9CA3AF"
                    value={specialization}
                    onChangeText={setSpecialization}
                  />
                </View>

                {/* Experience Years */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Deneyim Yılı *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: 5"
                    placeholderTextColor="#9CA3AF"
                    value={experienceYears}
                    onChangeText={setExperienceYears}
                    keyboardType="number-pad"
                  />
                </View>

                {/* Bio */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Biyografi (Opsiyonel)
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Doktor hakkında kısa bilgi..."
                    placeholderTextColor="#9CA3AF"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Bottom Spacing */}
              <View className="h-6" />
            </ScrollView>

            {/* Submit Button */}
            <View className="p-6 border-t border-gray-200">
              <TouchableOpacity
                className={`rounded-full py-4 items-center ${
                  isUpdating ? "bg-gray-300" : "bg-primary"
                }`}
                style={{
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
                onPress={handleSubmit}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Güncelle</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
