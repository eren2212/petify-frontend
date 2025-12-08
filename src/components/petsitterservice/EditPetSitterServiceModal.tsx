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
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../styles/theme/color";
import Toast from "react-native-toast-message";
import {
  useUpdatePetSitterService,
  useUpdatePetSitterServiceStatus,
  usePetSitterServiceCategories,
  usePetTypes,
} from "../../hooks";
import { PetType } from "../../types/type";

interface EditPetSitterServiceModalProps {
  visible: boolean;
  onClose: () => void;
  service: any;
}

interface Category {
  id: string;
  name: string;
  name_tr: string;
  icon_url: string;
}

export default function EditPetSitterServiceModal({
  visible,
  onClose,
  service,
}: EditPetSitterServiceModalProps) {
  const { mutate: updateService, isPending } = useUpdatePetSitterService();
  const { mutate: updateServiceStatus } = useUpdatePetSitterServiceStatus();
  const { data: categories = [], isLoading: categoriesLoading } =
    usePetSitterServiceCategories();
  const { data: petTypes = [], isLoading: petTypesLoading } = usePetTypes();

  // Form state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedPetType, setSelectedPetType] = useState<PetType | null>(null);
  const [showPetTypeDropdown, setShowPetTypeDropdown] = useState(false);
  const [priceType, setPriceType] = useState<string>("");
  const [showPriceTypeDropdown, setShowPriceTypeDropdown] = useState(false);
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Price type options
  const priceTypeOptions = [
    { value: "hourly", label: "Saatlik" },
    { value: "daily", label: "Günlük" },
  ];

  // Initialize form with service data
  useEffect(() => {
    if (service && visible) {
      setPrice(service.price?.toString() || "");
      setDescription(service.description || "");
      setPriceType(service.price_type || "");
      setIsActive(service.is_active ?? true);

      // Set category
      if (service.pet_sitter_service_categories) {
        setSelectedCategory({
          id: service.service_category_id,
          name: service.pet_sitter_service_categories.name,
          name_tr: service.pet_sitter_service_categories.name_tr,
          icon_url: service.pet_sitter_service_categories.icon_url,
        });
      }

      // Set pet type
      if (service.pet_types) {
        setSelectedPetType(service.pet_types as PetType);
      }
    }
  }, [service, visible]);

  // Dropdown seçim fonksiyonları
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
  };

  const handlePetTypeSelect = (type: PetType) => {
    setSelectedPetType(type);
    setShowPetTypeDropdown(false);
  };

  const handlePriceTypeSelect = (value: string) => {
    setPriceType(value);
    setShowPriceTypeDropdown(false);
  };

  // Submit handler
  const handleSubmit = async () => {
    // Validasyon
    if (!selectedCategory) {
      Toast.show({
        type: "error",
        text1: "Hizmet kategorisi zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!selectedPetType) {
      Toast.show({
        type: "error",
        text1: "Hayvan türü zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!priceType) {
      Toast.show({
        type: "error",
        text1: "Ücret tipi zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    const priceValue = price.replace(",", ".");
    if (!priceValue || parseFloat(priceValue) <= 0) {
      Toast.show({
        type: "error",
        text1: "Geçerli bir fiyat giriniz!",
        bottomOffset: 40,
      });
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      Toast.show({
        type: "error",
        text1: "Açıklama en az 15 karakter olmalıdır!",
        bottomOffset: 40,
      });
      return;
    }

    // Backend'e gönderilecek data
    const serviceData = {
      service_category_id: selectedCategory.id,
      pet_type_id: selectedPetType.id,
      price_type: priceType,
      price: parseFloat(priceValue),
      description: description.trim(),
    };

    // Önce servis bilgilerini güncelle
    updateService(
      { id: service.id, data: serviceData },
      {
        onSuccess: () => {
          // Eğer is_active durumu değiştiyse, ayrıca status endpoint'ini çağır
          if (isActive !== service.is_active) {
            updateServiceStatus(
              { id: service.id, status: isActive },
              {
                onSuccess: () => {
                  Toast.show({
                    type: "success",
                    text1: "Hizmet başarıyla güncellendi!",
                    bottomOffset: 40,
                  });
                  onClose();
                },
                onError: (error: any) => {
                  Toast.show({
                    type: "warning",
                    text1: "Hizmet güncellendi ancak durum değiştirilemedi",
                    bottomOffset: 40,
                  });
                  onClose();
                },
              }
            );
          } else {
            Toast.show({
              type: "success",
              text1: "Hizmet başarıyla güncellendi!",
              bottomOffset: 40,
            });
            onClose();
          }
        },
        onError: (error: any) => {
          Toast.show({
            type: "error",
            text1:
              error?.response?.data?.message ||
              "Hizmet güncellenirken bir hata oluştu",
            bottomOffset: 40,
          });
        },
      }
    );
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
                Hizmeti Düzenle
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
              {/* Service Details Section */}
              <View className="py-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Hizmet Bilgileri
                </Text>

                {/* Category Dropdown */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Hizmet Kategorisi *
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setShowCategoryDropdown(!showCategoryDropdown)
                    }
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                  >
                    <Text
                      className={
                        selectedCategory ? "text-gray-900" : "text-gray-400"
                      }
                    >
                      {selectedCategory
                        ? selectedCategory.name_tr
                        : "Kategori Seç"}
                    </Text>
                    <Text className="text-gray-400">
                      {showCategoryDropdown ? "▲" : "▼"}
                    </Text>
                  </TouchableOpacity>

                  {/* Dropdown Menu */}
                  {showCategoryDropdown && (
                    <View className="mt-2 bg-white border border-gray-200 rounded-xl">
                      {categoriesLoading ? (
                        <View className="py-4 items-center">
                          <ActivityIndicator
                            size="small"
                            color={COLORS.primary}
                          />
                        </View>
                      ) : (
                        categories.map((category: Category, index: number) => (
                          <TouchableOpacity
                            key={category.id}
                            onPress={() => handleCategorySelect(category)}
                            className={`px-4 py-3 ${
                              index < categories.length - 1
                                ? "border-b border-gray-100"
                                : ""
                            }`}
                          >
                            <Text className="text-gray-900">
                              {category.name_tr}
                            </Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  )}
                </View>

                {/* Pet Type Dropdown */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Hayvan Türü *
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
                      {petTypesLoading ? (
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

                {/* Price Type Dropdown */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Ücret Tipi *
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setShowPriceTypeDropdown(!showPriceTypeDropdown)
                    }
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                  >
                    <Text
                      className={priceType ? "text-gray-900" : "text-gray-400"}
                    >
                      {priceType
                        ? priceTypeOptions.find(
                            (opt) => opt.value === priceType
                          )?.label
                        : "Ücret Tipi Seç"}
                    </Text>
                    <Text className="text-gray-400">
                      {showPriceTypeDropdown ? "▲" : "▼"}
                    </Text>
                  </TouchableOpacity>

                  {/* Price Type Dropdown Menu */}
                  {showPriceTypeDropdown && (
                    <View className="mt-2 bg-white border border-gray-200 rounded-xl">
                      {priceTypeOptions.map((option, index) => (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => handlePriceTypeSelect(option.value)}
                          className={`px-4 py-3 ${
                            index < priceTypeOptions.length - 1
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

                {/* Price */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Fiyat (₺) *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: 250.00 veya 250,00"
                    placeholderTextColor="#9CA3AF"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                  />
                </View>

                {/* Description */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Açıklama * (Min. 15 karakter)
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Hizmet açıklamasını yazın..."
                    placeholderTextColor="#9CA3AF"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    {description.length}/15 karakter
                  </Text>
                </View>

                {/* Is Active Toggle */}
                <View className="mb-4 flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700">
                      Hizmet Durumu
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {isActive ? "Aktif" : "Pasif"}
                    </Text>
                  </View>
                  <Switch
                    value={isActive}
                    onValueChange={(value) => setIsActive(value)}
                    trackColor={{ false: "#EF4444", true: COLORS.primary }}
                    thumbColor={isActive ? "#FFFFFF" : "#6B7280"}
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
                  isPending ? "bg-gray-300" : "bg-primary"
                }`}
                style={{
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
                onPress={handleSubmit}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Değişiklikleri Kaydet
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
