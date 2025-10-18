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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../styles/theme/color";
import Toast from "react-native-toast-message";
import { useAddLostPet, usePetTypes } from "../../hooks/useProfile";
import { getPopularBreeds } from "../../constants/petBreeds";
import { PetType } from "../../types/type";

interface AddLostPetModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddLostPetModal({
  visible,
  onClose,
}: AddLostPetModalProps) {
  const { mutate: addLostPet, isPending: isAdding } = useAddLostPet();
  const { data: petTypes = [], isLoading: typesLoading } = usePetTypes();

  // Form state - Pet Details
  const [petName, setPetName] = useState<string>("");
  const [selectedPetType, setSelectedPetType] = useState<PetType | null>(null);
  const [showPetTypeDropdown, setShowPetTypeDropdown] = useState(false);
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState<string>("");
  const [customBreed, setCustomBreed] = useState<string>("");
  const [availableBreeds, setAvailableBreeds] = useState<string[]>([]);
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [gender, setGender] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Form state - Lost Information
  const [lostDate, setLostDate] = useState<Date | null>(null);
  const [lostTime, setLostTime] = useState<string>("");

  // Form state - Location
  const [lastSeenLocation, setLastSeenLocation] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");

  // Form state - Contact Information
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");

  // Form state - Reward (Optional)
  const [rewardAmount, setRewardAmount] = useState<string>("");
  const [rewardDescription, setRewardDescription] = useState<string>("");

  // Date picker states
  const [showBirthdatePicker, setShowBirthdatePicker] = useState(false);
  const [showLostDatePicker, setShowLostDatePicker] = useState(false);

  // Pet türü değiştiğinde cinsleri güncelle
  React.useEffect(() => {
    if (selectedPetType) {
      const breeds = getPopularBreeds(selectedPetType.name);
      setAvailableBreeds(breeds);
      setSelectedBreed(""); // Cins seçimini sıfırla
      setCustomBreed(""); // Custom cins'i sıfırla
    }
  }, [selectedPetType]);

  // Form reset
  const resetForm = () => {
    setPetName("");
    setSelectedPetType(null);
    setSelectedBreed("");
    setCustomBreed("");
    setBirthdate(null);
    setGender("");
    setColor("");
    setDescription("");
    setLostDate(null);
    setLostTime("");
    setLastSeenLocation("");
    setLatitude("");
    setLongitude("");
    setContactPhone("");
    setContactEmail("");
    setRewardAmount("");
    setRewardDescription("");
  };

  // Date change handlers
  const handleBirthdateChange = (event: any, selectedDate?: Date) => {
    setShowBirthdatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  const handleLostDateChange = (event: any, selectedDate?: Date) => {
    setShowLostDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setLostDate(selectedDate);
    }
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return "Tarih Seç";
    return date.toLocaleDateString("tr-TR");
  };

  // Pet type ve breed seçim fonksiyonları
  const handlePetTypeSelect = (type: PetType) => {
    setSelectedPetType(type);
    setShowPetTypeDropdown(false);
  };

  const handleBreedSelect = (breed: string) => {
    setSelectedBreed(breed);
    setShowBreedDropdown(false);
  };

  // Submit handler
  const handleSubmit = async () => {
    // Validasyon
    if (!petName.trim()) {
      Toast.show({
        type: "error",
        text1: "Hayvan adı zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!description.trim()) {
      Toast.show({
        type: "error",
        text1: "Açıklama zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!lostDate) {
      Toast.show({
        type: "error",
        text1: "Kaybolma tarihi zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!lastSeenLocation.trim()) {
      Toast.show({
        type: "error",
        text1: "Son görülme yeri zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!latitude.trim() || !longitude.trim()) {
      Toast.show({
        type: "error",
        text1: "Konum koordinatları zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    // Cins belirleme: Eğer "Diğer" seçildiyse custom breed kullan
    const finalBreed = selectedBreed === "Diğer" ? customBreed : selectedBreed;

    // Backend'e gönderilecek data
    const lostPetData = {
      pet_name: petName.trim(),
      description: description.trim(),
      lost_date: lostDate.toISOString().split("T")[0], // YYYY-MM-DD formatı
      last_seen_location: lastSeenLocation.trim(),
      last_seen_latitude: parseFloat(latitude),
      last_seen_longitude: parseFloat(longitude),
      // Opsiyonel alanlar
      ...(selectedPetType && { pet_type_id: selectedPetType.id }),
      ...(finalBreed && { breed: finalBreed.trim() }),
      ...(birthdate && { birthdate: birthdate.toISOString().split("T")[0] }),
      ...(gender && { gender }),
      ...(color && { color: color.trim() }),
      ...(lostTime && { lost_time: lostTime }),
      ...(contactPhone && { contact_phone: contactPhone.replace(/\s/g, "") }),
      ...(contactEmail && { contact_email: contactEmail.trim().toLowerCase() }),
      ...(rewardAmount && { reward_amount: parseFloat(rewardAmount) }),
      ...(rewardDescription && {
        reward_description: rewardDescription.trim(),
      }),
    };

    addLostPet(lostPetData, {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Kayıp hayvan ilanı başarıyla oluşturuldu!",
          bottomOffset: 40,
        });
        resetForm();
        onClose();
      },
      onError: (error: any) => {
        Toast.show({
          type: "error",
          text1:
            error?.response?.data?.message || "İlan eklenirken bir hata oluştu",
          bottomOffset: 40,
        });
      },
    });
  };

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
                Kayıp Hayvan İlanı
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
              {/* Pet Details Section */}
              <View className="py-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Hayvan Bilgileri
                </Text>

                {/* Pet Name */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Hayvan Adı *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: Max"
                    placeholderTextColor="#9CA3AF"
                    value={petName}
                    onChangeText={setPetName}
                  />
                </View>

                {/* Pet Türü Dropdown */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Tür
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowPetTypeDropdown(!showPetTypeDropdown)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                  >
                    <Text
                      className={
                        selectedPetType ? "text-gray-900" : "text-gray-400"
                      }
                    >
                      {selectedPetType ? selectedPetType.name_tr : "Tür Seç"}
                    </Text>
                    <Text className="text-gray-400">
                      {showPetTypeDropdown ? "▲" : "▼"}
                    </Text>
                  </TouchableOpacity>

                  {/* Dropdown Menu */}
                  {showPetTypeDropdown && (
                    <View className="mt-2 bg-white border border-gray-200 rounded-xl">
                      {typesLoading ? (
                        <View className="py-4 items-center">
                          <ActivityIndicator
                            size="small"
                            color={COLORS.primary}
                          />
                        </View>
                      ) : (
                        petTypes.map((type: PetType, index: number) => (
                          <TouchableOpacity
                            key={type.id}
                            onPress={() => handlePetTypeSelect(type)}
                            className={`px-4 py-3 ${
                              index < petTypes.length - 1
                                ? "border-b border-gray-100"
                                : ""
                            }`}
                          >
                            <Text className="text-gray-900">
                              {type.name_tr}
                            </Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  )}
                </View>

                {/* Breed Dropdown (Sadece pet type seçildiyse göster) */}
                {selectedPetType && (
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Cins
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowBreedDropdown(!showBreedDropdown)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                    >
                      <Text
                        className={
                          selectedBreed ? "text-gray-900" : "text-gray-400"
                        }
                      >
                        {selectedBreed || "Cins Seç"}
                      </Text>
                      <Text className="text-gray-400">
                        {showBreedDropdown ? "▲" : "▼"}
                      </Text>
                    </TouchableOpacity>

                    {/* Breed Dropdown Menu */}
                    {showBreedDropdown && (
                      <View className="mt-2 bg-white border border-gray-200 rounded-xl">
                        {availableBreeds.map((breed: string, index: number) => (
                          <TouchableOpacity
                            key={breed}
                            onPress={() => handleBreedSelect(breed)}
                            className={`px-4 py-3 ${
                              index < availableBreeds.length - 1
                                ? "border-b border-gray-100"
                                : ""
                            }`}
                          >
                            <Text className="text-gray-900">{breed}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Custom Breed Input (Diğer seçildiyse göster) */}
                    {selectedBreed === "Diğer" && (
                      <TextInput
                        value={customBreed}
                        onChangeText={setCustomBreed}
                        placeholder="Cins adını yazın..."
                        placeholderTextColor="#9CA3AF"
                        className="mt-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                      />
                    )}
                  </View>
                )}

                {/* Birthdate */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Doğum Tarihi
                  </Text>
                  <TouchableOpacity
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                    onPress={() => setShowBirthdatePicker(!showBirthdatePicker)}
                  >
                    <Text
                      className={`text-base ${
                        birthdate ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {formatDate(birthdate)}
                    </Text>
                    <Ionicons
                      name="calendar"
                      size={24}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>

                  {showBirthdatePicker && (
                    <DateTimePicker
                      value={birthdate || new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleBirthdateChange}
                      maximumDate={new Date()}
                      locale="tr-TR"
                    />
                  )}
                </View>

                {/* Gender */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Cinsiyet
                  </Text>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-xl border ${
                        gender === "male"
                          ? "bg-purple-50 border-purple-500"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      onPress={() => setGender("male")}
                    >
                      <Text
                        className={`text-center font-semibold ${
                          gender === "male"
                            ? "text-purple-600"
                            : "text-gray-600"
                        }`}
                      >
                        Erkek
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-xl border ${
                        gender === "female"
                          ? "bg-purple-50 border-purple-500"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      onPress={() => setGender("female")}
                    >
                      <Text
                        className={`text-center font-semibold ${
                          gender === "female"
                            ? "text-purple-600"
                            : "text-gray-600"
                        }`}
                      >
                        Dişi
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Color */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Renk
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: Altın Sarısı"
                    placeholderTextColor="#9CA3AF"
                    value={color}
                    onChangeText={setColor}
                  />
                </View>

                {/* Description */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Açıklama *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Hayvanın özelliklerini yazın..."
                    placeholderTextColor="#9CA3AF"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Lost Information Section */}
              <View className="py-6 border-t border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Kaybolma Bilgileri
                </Text>

                {/* Lost Date */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Kaybolma Tarihi *
                  </Text>
                  <TouchableOpacity
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                    onPress={() => setShowLostDatePicker(!showLostDatePicker)}
                  >
                    <Text
                      className={`text-base ${
                        lostDate ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {formatDate(lostDate)}
                    </Text>
                    <Ionicons
                      name="calendar"
                      size={24}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>

                  {showLostDatePicker && (
                    <DateTimePicker
                      value={lostDate || new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleLostDateChange}
                      maximumDate={new Date()}
                      locale="tr-TR"
                    />
                  )}
                </View>

                {/* Lost Time */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Kaybolma Saati
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: 14:30"
                    placeholderTextColor="#9CA3AF"
                    value={lostTime}
                    onChangeText={setLostTime}
                  />
                </View>
              </View>

              {/* Photos Section */}
              <View className="py-6 border-t border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Fotoğraflar
                </Text>

                <TouchableOpacity
                  className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 items-center"
                  onPress={() => {
                    Toast.show({
                      type: "info",
                      text1: "Fotoğraf yükleme özelliği yakında eklenecek",
                      bottomOffset: 40,
                    });
                  }}
                >
                  <MaterialCommunityIcons
                    name="camera-plus"
                    size={48}
                    color="#9CA3AF"
                  />
                  <Text className="text-gray-500 font-medium mt-3 text-base">
                    Add Photos
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1 text-center">
                    Upload photos of the pet to help with identification or
                    adoption.
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Location Section */}
              <View className="py-6 border-t border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Konum Bilgisi
                </Text>

                {/* Last Seen Location */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Son Görülme Yeri *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: Beşiktaş, İstanbul"
                    placeholderTextColor="#9CA3AF"
                    value={lastSeenLocation}
                    onChangeText={setLastSeenLocation}
                  />
                </View>

                {/* Coordinates */}
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Enlem *
                    </Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                      placeholder="41.0082"
                      placeholderTextColor="#9CA3AF"
                      value={latitude}
                      onChangeText={setLatitude}
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Boylam *
                    </Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                      placeholder="28.9784"
                      placeholderTextColor="#9CA3AF"
                      value={longitude}
                      onChangeText={setLongitude}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Contact Information Section */}
              <View className="py-6 border-t border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  İletişim Bilgileri
                </Text>

                {/* Contact Phone */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="5XX XXX XX XX"
                    placeholderTextColor="#9CA3AF"
                    value={contactPhone}
                    onChangeText={setContactPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>

                {/* Contact Email */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="ornek@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={contactEmail}
                    onChangeText={setContactEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Reward Section (Optional) */}
              <View className="py-6 border-t border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Ödül (Opsiyonel)
                </Text>

                {/* Reward Amount */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Ödül Miktarı
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: 1000"
                    placeholderTextColor="#9CA3AF"
                    value={rewardAmount}
                    onChangeText={setRewardAmount}
                    keyboardType="numeric"
                  />
                </View>

                {/* Reward Description */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Ödül Açıklaması
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Ödül hakkında detaylar..."
                    placeholderTextColor="#9CA3AF"
                    value={rewardDescription}
                    onChangeText={setRewardDescription}
                    multiline
                    numberOfLines={3}
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
                className="bg-primary rounded-full py-4 items-center"
                style={{
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
                onPress={handleSubmit}
                disabled={isAdding}
              >
                {isAdding ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    İlanı Yayınla
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
