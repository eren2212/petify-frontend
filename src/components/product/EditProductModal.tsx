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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../styles/theme/color";
import Toast from "react-native-toast-message";
import {
  useUpdateProduct,
  useProductCategories,
  usePetTypes,
} from "../../hooks";
import { PetType } from "../../types/type";

interface EditProductModalProps {
  visible: boolean;
  onClose: () => void;
  product: any;
}

interface Category {
  id: string;
  name: string;
  name_tr: string;
  display_order: number;
}

export default function EditProductModal({
  visible,
  onClose,
  product,
}: EditProductModalProps) {
  const { mutate: updateProduct, isPending } = useUpdateProduct();
  const { data: categories = [], isLoading: categoriesLoading } =
    useProductCategories();
  const { data: petTypes = [], isLoading: petTypesLoading } = usePetTypes();

  // Form state - Product Details
  const [productName, setProductName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedPetType, setSelectedPetType] = useState<PetType | null>(null);
  const [showPetTypeDropdown, setShowPetTypeDropdown] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [ageGroup, setAgeGroup] = useState<string>("");
  const [showAgeGroupDropdown, setShowAgeGroupDropdown] = useState(false);
  const [stockQuantity, setStockQuantity] = useState<string>("");
  const [lowStockThreshold, setLowStockThreshold] = useState<string>("");

  // Age group options
  const ageGroupOptions = [
    { value: "puppy", label: "Yavru (Puppy)" },
    { value: "adult", label: "Yetişkin (Adult)" },
    { value: "senior", label: "Yaşlı (Senior)" },
  ];

  // Initialize form with product data
  useEffect(() => {
    if (product && visible) {
      setProductName(product.name || "");
      setDescription(product.description || "");
      setPrice(product.price?.toString() || "");
      setWeight(product.weight_kg?.toString() || "");
      setAgeGroup(product.age_group || "");
      setStockQuantity(product.stock_quantity?.toString() || "");
      setLowStockThreshold(product.low_stock_threshold?.toString() || "");

      // Set category
      if (product.category) {
        setSelectedCategory(product.category);
      }

      // Set pet type
      if (product.pet_type) {
        setSelectedPetType(product.pet_type);
      }
    }
  }, [product, visible]);

  // Category, Pet Type ve Age Group seçim fonksiyonları
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
  };

  const handlePetTypeSelect = (type: PetType) => {
    setSelectedPetType(type);
    setShowPetTypeDropdown(false);
  };

  const handleAgeGroupSelect = (value: string) => {
    setAgeGroup(value);
    setShowAgeGroupDropdown(false);
  };

  // Submit handler
  const handleSubmit = async () => {
    // Validasyon
    if (!productName.trim()) {
      Toast.show({
        type: "error",
        text1: "Ürün adı zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    if (!selectedCategory) {
      Toast.show({
        type: "error",
        text1: "Kategori zorunludur!",
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

    const priceValue = price.replace(",", ".");
    if (!priceValue || parseFloat(priceValue) <= 0) {
      Toast.show({
        type: "error",
        text1: "Geçerli bir fiyat giriniz!",
        bottomOffset: 40,
      });
      return;
    }

    if (!stockQuantity.trim() || parseInt(stockQuantity) < 0) {
      Toast.show({
        type: "error",
        text1: "Geçerli bir stok miktarı giriniz!",
        bottomOffset: 40,
      });
      return;
    }

    // Backend'e gönderilecek data
    const weightValue = weight.replace(",", ".");
    const productData = {
      categoryId: selectedCategory.id,
      petTypeId: selectedPetType?.id || null,
      name: productName.trim(),
      description: description.trim(),
      price: parseFloat(priceValue),
      weight_kg: weightValue ? parseFloat(weightValue) : null,
      age_group: ageGroup || null, // puppy, adult, senior enum değerleri
      stock_quantity: parseInt(stockQuantity),
      low_stock_threshold: lowStockThreshold
        ? parseInt(lowStockThreshold)
        : null,
    };

    updateProduct(
      { id: product.id, data: productData },
      {
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: "Ürün başarıyla güncellendi!",
            bottomOffset: 40,
          });
          onClose();
        },
        onError: (error: any) => {
          Toast.show({
            type: "error",
            text1:
              error?.response?.data?.message ||
              "Ürün güncellenirken bir hata oluştu",
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
                Ürünü Düzenle
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
              {/* Product Details Section */}
              <View className="py-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Ürün Bilgileri
                </Text>

                {/* Product Name */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Ürün Adı *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: Premium Köpek Maması"
                    placeholderTextColor="#9CA3AF"
                    value={productName}
                    onChangeText={setProductName}
                  />
                </View>

                {/* Category Dropdown */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Kategori *
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

                {/* Pet Type Dropdown (Optional) */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Hayvan Türü (Opsiyonel)
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
                        <>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedPetType(null);
                              setShowPetTypeDropdown(false);
                            }}
                            className="px-4 py-3 border-b border-gray-100"
                          >
                            <Text className="text-gray-400">Seçim Yok</Text>
                          </TouchableOpacity>
                          {petTypes.map((type: PetType, index: number) => (
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
                          ))}
                        </>
                      )}
                    </View>
                  )}
                </View>

                {/* Description */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Açıklama *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Ürün açıklamasını yazın..."
                    placeholderTextColor="#9CA3AF"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
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

                {/* Weight */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Ağırlık (kg) (Opsiyonel)
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: 2.5 veya 2,5"
                    placeholderTextColor="#9CA3AF"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                  />
                </View>

                {/* Age Group */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Yaş Grubu (Opsiyonel)
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setShowAgeGroupDropdown(!showAgeGroupDropdown)
                    }
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                  >
                    <Text
                      className={ageGroup ? "text-gray-900" : "text-gray-400"}
                    >
                      {ageGroup
                        ? ageGroupOptions.find((opt) => opt.value === ageGroup)
                            ?.label
                        : "Yaş Grubu Seç"}
                    </Text>
                    <Text className="text-gray-400">
                      {showAgeGroupDropdown ? "▲" : "▼"}
                    </Text>
                  </TouchableOpacity>

                  {/* Age Group Dropdown Menu */}
                  {showAgeGroupDropdown && (
                    <View className="mt-2 bg-white border border-gray-200 rounded-xl">
                      <TouchableOpacity
                        onPress={() => {
                          setAgeGroup("");
                          setShowAgeGroupDropdown(false);
                        }}
                        className="px-4 py-3 border-b border-gray-100"
                      >
                        <Text className="text-gray-400">Seçim Yok</Text>
                      </TouchableOpacity>
                      {ageGroupOptions.map((option, index) => (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => handleAgeGroupSelect(option.value)}
                          className={`px-4 py-3 ${
                            index < ageGroupOptions.length - 1
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
              </View>

              {/* Stock Section */}
              <View className="py-6 border-t border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Stok Bilgileri
                </Text>

                {/* Stock Quantity */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Stok Miktarı *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: 100"
                    placeholderTextColor="#9CA3AF"
                    value={stockQuantity}
                    onChangeText={setStockQuantity}
                    keyboardType="number-pad"
                  />
                </View>

                {/* Low Stock Threshold */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Düşük Stok Eşiği (Opsiyonel)
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="Örn: 10"
                    placeholderTextColor="#9CA3AF"
                    value={lowStockThreshold}
                    onChangeText={setLowStockThreshold}
                    keyboardType="number-pad"
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

