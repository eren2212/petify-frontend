import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { usePetTypes, useAddPet } from "../../hooks/useProfile";
import { getPopularBreeds } from "../../constants/petBreeds";
import { PetType } from "../../types/type";
import { pickImageFromLibrary } from "../../utils/imagePicker";
import { petApi } from "../../lib/api";

interface AddPetModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddPetModal({ visible, onClose }: AddPetModalProps) {
  const { data: petTypes = [], isLoading: typesLoading } = usePetTypes();
  const { mutate: addPet, isPending: isAdding } = useAddPet();

  // Form state
  const [selectedPetType, setSelectedPetType] = useState<PetType | null>(null);
  const [showPetTypeDropdown, setShowPetTypeDropdown] = useState(false);
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState<string>("");
  const [customBreed, setCustomBreed] = useState<string>("");
  const [petName, setPetName] = useState<string>("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [gender, setGender] = useState<"male" | "female" | "unknown">(
    "unknown"
  );
  const [weight, setWeight] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [petImageUri, setPetImageUri] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");

  // Popüler cinsler
  const [availableBreeds, setAvailableBreeds] = useState<string[]>([]);

  // Gender seçenekleri
  const genderOptions = [
    { value: "male", label: "Erkek" },
    { value: "female", label: "Dişi" },
    { value: "unknown", label: "Bilinmiyor" },
  ];

  // Pet türü değiştiğinde cinsleri güncelle
  useEffect(() => {
    if (selectedPetType) {
      const breeds = getPopularBreeds(selectedPetType.name);
      setAvailableBreeds(breeds);
      setSelectedBreed(""); // Cins seçimini sıfırla
      setCustomBreed(""); // Custom cins'i sıfırla
    }
  }, [selectedPetType]);

  // Form reset
  const resetForm = () => {
    setSelectedPetType(null);
    setSelectedBreed("");
    setCustomBreed("");
    setPetName("");
    setBirthdate(null);
    setGender("unknown");
    setWeight("");
    setColor("");
    setPetImageUri(null);
    setDescription("");
  };

  // Resim seçme fonksiyonu
  const handlePickImage = async () => {
    const imageUri = await pickImageFromLibrary([1, 1]); // Kare format
    if (imageUri) {
      setPetImageUri(imageUri);
    }
  };

  // Submit handler (2 aşamalı: pet oluştur → resim yükle)
  const handleSubmit = async () => {
    if (!selectedPetType || !petName.trim()) {
      alert("Lütfen en az hayvan türü ve isim girin!");
      return;
    }

    // Cins belirleme: Eğer "Diğer" seçildiyse custom breed kullan
    const finalBreed = selectedBreed === "Diğer" ? customBreed : selectedBreed;

    const petData = {
      pet_type_id: selectedPetType.id,
      name: petName.trim(),
      breed: finalBreed || undefined,
      birthdate: birthdate ? birthdate.toISOString().split("T")[0] : undefined,
      gender,
      weight_kg: weight ? parseFloat(weight) : undefined,
      color: color || undefined,
      description: description || undefined,
    };

    // Adım 1: Pet oluştur
    addPet(petData, {
      onSuccess: async (response: any) => {
        console.log("✅ Pet başarıyla eklendi!");

        // Adım 2: Eğer resim seçilmişse, resmi yükle
        if (petImageUri && response?.data?.pet?.id) {
          const petId = response.data.pet.id;

          try {
            await petApi.uploadPetImage(petId, petImageUri);
            console.log("✅ Pet resmi başarıyla yüklendi!");
            alert("Hayvan ve resim başarıyla kaydedildi!");
          } catch (imageError: any) {
            console.error("❌ Resim yükleme hatası:", imageError);
            alert(
              "Hayvan kaydedildi ancak resim yüklenirken hata oluştu. Resmi daha sonra ekleyebilirsiniz."
            );
          }
        } else {
          alert("Hayvan başarıyla kaydedildi!");
        }

        resetForm();
        onClose();
      },
      onError: (error: any) => {
        alert(
          error?.response?.data?.message || "Hayvan eklenirken hata oluştu"
        );
      },
    });
  };

  const handlePetTypeSelect = (type: PetType) => {
    setSelectedPetType(type);
    setShowPetTypeDropdown(false);
  };

  const handleBreedSelect = (breed: string) => {
    setSelectedBreed(breed);
    setShowBreedDropdown(false);
  };

  const handleGenderSelect = (genderValue: "male" | "female" | "unknown") => {
    setGender(genderValue);
    setShowGenderDropdown(false);
  };

  const getGenderLabel = () => {
    const selected = genderOptions.find((opt) => opt.value === gender);
    return selected ? selected.label : "Cinsiyet";
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Doğum Tarihi Seç";
    return date.toLocaleDateString("tr-TR");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl h-5/6">
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">Hayvan Ekle</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-2xl text-gray-500">×</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView className="flex-1 px-6 py-4">
            {/* Profil Resmi Yükleme */}
            <View className="mb-6 items-center">
              <TouchableOpacity
                onPress={handlePickImage}
                disabled={isAdding}
                className="items-center"
              >
                <View className="w-32 h-32 rounded-full bg-rose-100 items-center justify-center mb-2">
                  {petImageUri ? (
                    <Image
                      source={{ uri: petImageUri }}
                      className="w-full h-full rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-20 h-24 bg-white rounded-lg items-center justify-center">
                      <Text className="text-4xl">🐾</Text>
                    </View>
                  )}
                  <View className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full items-center justify-center">
                    <Text className="text-white text-xl font-bold">+</Text>
                  </View>
                </View>
                <Text className="text-sm text-gray-500">
                  {petImageUri ? "Resim Değiştir" : "Profil Resmi Yükle"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Pet İsmi */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-2">Hayvan Adı</Text>
              <TextInput
                value={petName}
                onChangeText={setPetName}
                placeholder="Hayvan Adı"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
              />
            </View>

            {/* Pet Türü Dropdown */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-2">Tür</Text>
              <TouchableOpacity
                onPress={() => setShowPetTypeDropdown(!showPetTypeDropdown)}
                className="border border-gray-200 rounded-xl px-4 py-3 bg-white flex-row justify-between items-center"
              >
                <Text
                  className={
                    selectedPetType ? "text-gray-900" : "text-gray-400"
                  }
                >
                  {selectedPetType ? selectedPetType.name_tr : "Tür"}
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
                      <ActivityIndicator size="small" color="#8B5CF6" />
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
                        <Text className="text-gray-900">{type.name_tr}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>

            {/* Breed Dropdown (Sadece pet type seçildiyse göster) */}
            {selectedPetType && (
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2">Cins</Text>
                <TouchableOpacity
                  onPress={() => setShowBreedDropdown(!showBreedDropdown)}
                  className="border border-gray-200 rounded-xl px-4 py-3 bg-white flex-row justify-between items-center"
                >
                  <Text
                    className={
                      selectedBreed ? "text-gray-900" : "text-gray-400"
                    }
                  >
                    {selectedBreed || "Cins"}
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
                    className="mt-3 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  />
                )}
              </View>
            )}

            {/* Doğum Tarihi */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-2">Doğum Tarihi</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(!showDatePicker)}
                className="border border-gray-200 rounded-xl px-4 py-3 bg-white flex-row justify-between items-center"
              >
                <Text className={birthdate ? "text-gray-900" : "text-gray-400"}>
                  {formatDate(birthdate)}
                </Text>
                <Text className="text-gray-400">📅</Text>
              </TouchableOpacity>

              {/* DateTimePicker */}
              {showDatePicker && (
                <DateTimePicker
                  value={birthdate || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  locale="tr-TR"
                  textColor="black"
                />
              )}
            </View>

            {/* Cinsiyet */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-2">Cinsiyet</Text>
              <TouchableOpacity
                onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                className="border border-gray-200 rounded-xl px-4 py-3 bg-white flex-row justify-between items-center"
              >
                <Text
                  className={
                    gender !== "unknown" ? "text-gray-900" : "text-gray-400"
                  }
                >
                  {getGenderLabel()}
                </Text>
                <Text className="text-gray-400">
                  {showGenderDropdown ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Gender Dropdown Menu (Açık olduğunda) */}
            {showGenderDropdown && (
              <View className="mb-4 bg-white border border-gray-200 rounded-xl">
                {genderOptions.map((option, index: number) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() =>
                      handleGenderSelect(
                        option.value as "male" | "female" | "unknown"
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

            {/* Renk ve Kilo (Yan Yana) */}
            <View className="flex-row gap-3 mb-4">
              {/* Renk */}
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-2">Renk</Text>
                <TextInput
                  value={color}
                  onChangeText={setColor}
                  placeholder="örn: Kahverengi"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
                />
              </View>

              {/* Kilo */}
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-2">Kilo (kg)</Text>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="örn: 5.5"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
                />
              </View>
            </View>

            {/* Notlar */}
            <View className="mb-6">
              <Text className="text-sm text-gray-600 mb-2">
                Notlar (örn: beslenme ihtiyaçları, sağlık geçmişi)
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Notlar (örn: beslenme ihtiyaçları, sağlık geçmişi)"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
              />
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View className="px-6 py-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isAdding || !selectedPetType || !petName.trim()}
              className={`py-4 rounded-full ${
                isAdding || !selectedPetType || !petName.trim()
                  ? "bg-gray-300"
                  : "bg-green-400"
              }`}
            >
              {isAdding ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-center text-base">
                  Hayvan Ekle
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
