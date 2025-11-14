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
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../styles/theme/color";
import Toast from "react-native-toast-message";
import { useAddAdoptionPet, usePetTypes } from "../../hooks/usePet";
import { getPopularBreeds } from "../../constants/petBreeds";
import { PetType } from "../../types/type";
import { pickImageFromLibrary } from "../../utils/imagePicker";
import { petApi } from "../../lib/api";
import MapLocationPicker from "../map/MapLocationPicker";

interface AddAdoptionPetModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddAdoptionPetModal({
  visible,
  onClose,
}: AddAdoptionPetModalProps) {
  const { mutate: addAdoptionPet, isPending: isAdding } = useAddAdoptionPet();
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

  // Form state - Adoption Information
  const [adoptionFee, setAdoptionFee] = useState<string>("");
  const [requirements, setRequirements] = useState<string>("");

  // Form state - Health & Behavior (Boolean fields)
  const [isVaccinated, setIsVaccinated] = useState<boolean>(false);
  const [isNeutered, setIsNeutered] = useState<boolean>(false);
  const [isHouseTrained, setIsHouseTrained] = useState<boolean>(false);
  const [goodWithKids, setGoodWithKids] = useState<boolean>(false);
  const [goodWithPets, setGoodWithPets] = useState<boolean>(false);

  // Form state - Location
  const [locationDescription, setLocationDescription] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Form state - Contact Information
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");

  // Form state - Pet Image
  const [petImageUri, setPetImageUri] = useState<string | null>(null);

  // Date picker states
  const [showBirthdatePicker, setShowBirthdatePicker] = useState(false);

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
    setAdoptionFee("");
    setRequirements("");
    setIsVaccinated(false);
    setIsNeutered(false);
    setIsHouseTrained(false);
    setGoodWithKids(false);
    setGoodWithPets(false);
    setLocationDescription("");
    setLatitude("");
    setLongitude("");
    setContactPhone("");
    setContactEmail("");
    setPetImageUri(null);
  };

  // Date change handlers
  const handleBirthdateChange = (event: any, selectedDate?: Date) => {
    setShowBirthdatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setBirthdate(selectedDate);
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

  // Handle map location selection
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setLatitude(lat.toString());
    setLongitude(lng.toString());
    setShowMapPicker(false);
  };

  // Resim seçme fonksiyonu
  const handlePickImage = async () => {
    const imageUri = await pickImageFromLibrary([1, 1]); // Kare format
    if (imageUri) {
      setPetImageUri(imageUri);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    // Validasyon - Backend'deki zorunlu alanlar
    if (!selectedPetType) {
      Toast.show({
        type: "error",
        text1: "Hayvan türü zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!petName.trim()) {
      Toast.show({
        type: "error",
        text1: "Hayvan adı zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      Toast.show({
        type: "error",
        text1: "Açıklama en az 10 karakter olmalıdır!",
        bottomOffset: 40,
      });
      return;
    }

    const finalBreed = selectedBreed === "Diğer" ? customBreed : selectedBreed;
    if (!finalBreed.trim()) {
      Toast.show({
        type: "error",
        text1: "Hayvan cinsi zorunludur!",
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

    if (!color.trim()) {
      Toast.show({
        type: "error",
        text1: "Renk zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!birthdate) {
      Toast.show({
        type: "error",
        text1: "Doğum tarihi zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!adoptionFee.trim()) {
      Toast.show({
        type: "error",
        text1: "Sahiplenme ücreti zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!locationDescription.trim()) {
      Toast.show({
        type: "error",
        text1: "Konum açıklaması zorunludur!",
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

    if (!requirements.trim()) {
      Toast.show({
        type: "error",
        text1: "Gereksinimler zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!contactPhone.trim() || contactPhone.trim().length < 10) {
      Toast.show({
        type: "error",
        text1: "Geçerli bir telefon numarası giriniz!",
        bottomOffset: 40,
      });
      return;
    }

    if (!contactEmail.trim() || !contactEmail.includes("@")) {
      Toast.show({
        type: "error",
        text1: "Geçerli bir e-posta adresi giriniz!",
        bottomOffset: 40,
      });
      return;
    }

    // Fotoğraf zorunlu
    if (!petImageUri) {
      Toast.show({
        type: "error",
        text1: "Lütfen hayvanın fotoğrafını ekleyin!",
        bottomOffset: 40,
      });
      return;
    }

    // Backend'e gönderilecek data
    const adoptionPetData = {
      pet_type_id: selectedPetType.id,
      pet_name: petName.trim(),
      description: description.trim(),
      breed: finalBreed.trim(),
      gender,
      color: color.trim(),
      adoption_fee: parseFloat(adoptionFee),
      location_description: locationDescription.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      requirements: requirements.trim(),
      is_vaccinated: isVaccinated,
      is_neutered: isNeutered,
      is_house_trained: isHouseTrained,
      good_with_kids: goodWithKids,
      good_with_pets: goodWithPets,
      contact_phone: contactPhone.replace(/\s/g, ""),
      contact_email: contactEmail.trim().toLowerCase(),
      birthdate: birthdate.toISOString(), // Backend datetime formatı bekliyor
    };

    addAdoptionPet(adoptionPetData, {
      onSuccess: async (response: any) => {
        console.log("✅ Adoption pet listing başarıyla eklendi!");

        // Adım 2: Fotoğrafı yükle
        if (petImageUri && response?.data?.listing?.id) {
          const listingId = response.data.listing.id;

          try {
            await petApi.uploadAdoptionPetImage(listingId, petImageUri);
            console.log("✅ Adoption pet resmi başarıyla yüklendi!");
            Toast.show({
              type: "success",
              text1: "Sahiplendirme ilanı ve fotoğrafı başarıyla kaydedildi!",
              bottomOffset: 40,
            });
          } catch (imageError: any) {
            console.error("❌ Resim yükleme hatası:", imageError);
            Toast.show({
              type: "warning",
              text1: "İlan oluşturuldu ancak resim yüklenemedi",
              text2: "Resmi daha sonra ekleyebilirsiniz",
              bottomOffset: 40,
            });
          }
        }

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
                Sahiplendirme İlanı
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
                    Tür *
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
                      Cins *
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
                    Doğum Tarihi *
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
                      textColor="black"
                    />
                  )}
                </View>

                {/* Gender */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Cinsiyet *
                  </Text>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-xl border ${
                        gender === "male"
                          ? "bg-primary/10 border-primary"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      onPress={() => setGender("male")}
                    >
                      <Text
                        className={`text-center font-semibold ${
                          gender === "male" ? "text-primary" : "text-gray-600"
                        }`}
                      >
                        Erkek
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-xl border ${
                        gender === "female"
                          ? "bg-primary/10 border-primary"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      onPress={() => setGender("female")}
                    >
                      <Text
                        className={`text-center font-semibold ${
                          gender === "female" ? "text-primary" : "text-gray-600"
                        }`}
                      >
                        Dişi
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-xl border ${
                        gender === "unknown"
                          ? "bg-primary/10 border-primary"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      onPress={() => setGender("unknown")}
                    >
                      <Text
                        className={`text-center font-semibold ${
                          gender === "unknown"
                            ? "text-primary"
                            : "text-gray-600"
                        }`}
                      >
                        Bilinmiyor
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Color */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Renk *
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
                    Açıklama * (En az 10 karakter)
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

              {/* Health & Behavior Section */}
              <View className="py-6 border-t border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Sağlık ve Davranış
                </Text>

                {/* Is Vaccinated */}
                <TouchableOpacity
                  className="flex-row items-center justify-between mb-4 bg-gray-50 rounded-xl px-4 py-3"
                  onPress={() => setIsVaccinated(!isVaccinated)}
                >
                  <Text className="text-base text-gray-900">Aşılı mı?</Text>
                  <View
                    className={`w-6 h-6 rounded border-2 items-center justify-center ${
                      isVaccinated
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {isVaccinated && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Is Neutered */}
                <TouchableOpacity
                  className="flex-row items-center justify-between mb-4 bg-gray-50 rounded-xl px-4 py-3"
                  onPress={() => setIsNeutered(!isNeutered)}
                >
                  <Text className="text-base text-gray-900">
                    Kısırlaştırıldı mı?
                  </Text>
                  <View
                    className={`w-6 h-6 rounded border-2 items-center justify-center ${
                      isNeutered
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {isNeutered && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Is House Trained */}
                <TouchableOpacity
                  className="flex-row items-center justify-between mb-4 bg-gray-50 rounded-xl px-4 py-3"
                  onPress={() => setIsHouseTrained(!isHouseTrained)}
                >
                  <Text className="text-base text-gray-900">
                    Ev eğitimi var mı?
                  </Text>
                  <View
                    className={`w-6 h-6 rounded border-2 items-center justify-center ${
                      isHouseTrained
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {isHouseTrained && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Good With Kids */}
                <TouchableOpacity
                  className="flex-row items-center justify-between mb-4 bg-gray-50 rounded-xl px-4 py-3"
                  onPress={() => setGoodWithKids(!goodWithKids)}
                >
                  <Text className="text-base text-gray-900">
                    Çocuklarla uyumlu mu?
                  </Text>
                  <View
                    className={`w-6 h-6 rounded border-2 items-center justify-center ${
                      goodWithKids
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {goodWithKids && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Good With Pets */}
                <TouchableOpacity
                  className="flex-row items-center justify-between mb-4 bg-gray-50 rounded-xl px-4 py-3"
                  onPress={() => setGoodWithPets(!goodWithPets)}
                >
                  <Text className="text-base text-gray-900">
                    Diğer hayvanlarla uyumlu mu?
                  </Text>
                  <View
                    className={`w-6 h-6 rounded border-2 items-center justify-center ${
                      goodWithPets
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {goodWithPets && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              {/* Adoption Information Section */}
              <View className="py-6 border-t border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Sahiplendirme Bilgileri
                </Text>

                {/* Adoption Fee */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Sahiplenme Ücreti * (0 için ücretsiz)
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: 0 veya 500"
                    placeholderTextColor="#9CA3AF"
                    value={adoptionFee}
                    onChangeText={setAdoptionFee}
                    keyboardType="numeric"
                  />
                </View>

                {/* Requirements */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Gereksinimler *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: Bahçeli ev, aktif yaşam tarzı..."
                    placeholderTextColor="#9CA3AF"
                    value={requirements}
                    onChangeText={setRequirements}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Photos Section */}
              <View className="py-6 border-t border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Fotoğraf (Zorunlu)
                </Text>

                <TouchableOpacity
                  className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 items-center"
                  onPress={handlePickImage}
                  disabled={isAdding}
                >
                  {petImageUri ? (
                    <View className="w-full items-center">
                      <Image
                        source={{ uri: petImageUri }}
                        className="w-64 h-64 rounded-xl mb-3"
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
                        Fotoğraf Seçildi (Değiştirmek için tıklayın)
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
                        Hayvanın fotoğrafını yükleyerek sahiplendirme
                        işlemlerine yardımcı olun.
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Location Section */}
              <View className="py-6 border-t border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Konum Bilgisi
                </Text>

                {/* Location Description */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Konum Açıklaması *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: Beşiktaş, İstanbul"
                    placeholderTextColor="#9CA3AF"
                    value={locationDescription}
                    onChangeText={setLocationDescription}
                  />
                </View>

                {/* Map Location Picker */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Konum Seç *
                  </Text>
                  <TouchableOpacity
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                    onPress={() => setShowMapPicker(true)}
                  >
                    <View className="flex-1">
                      {latitude && longitude ? (
                        <Text className="text-gray-900 text-base">
                          Haritadan konum başarıyla seçildi
                        </Text>
                      ) : (
                        <Text className="text-gray-500 text-base">
                          Haritadan konum seçin
                        </Text>
                      )}
                    </View>
                    <Ionicons name="map" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
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
                    Telefon *
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
                    E-posta *
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

              {/* Bottom Spacing */}
              <View className="h-6" />
            </ScrollView>

            {/* Submit Button */}
            <View className="p-6 border-t border-gray-200">
              <TouchableOpacity
                className={`rounded-full py-4 items-center ${
                  !petImageUri || isAdding ? "bg-gray-300" : "bg-primary"
                }`}
                style={{
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
                onPress={handleSubmit}
                disabled={!petImageUri || isAdding}
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

      {/* Map Location Picker Modal */}
      <MapLocationPicker
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLatitude={latitude ? parseFloat(latitude) : 41.0082}
        initialLongitude={longitude ? parseFloat(longitude) : 28.9784}
        initialAddress={locationDescription || "İstanbul, Türkiye"}
      />
    </Modal>
  );
}
