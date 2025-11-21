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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../styles/theme/color";
import Toast from "react-native-toast-message";
import { pickImageFromLibrary } from "../../utils/imagePicker";
import { useAddProduct, useProductCategories, usePetTypes } from "../../hooks";
import { productApi } from "../../lib/api";
import { PetType } from "../../types/type";

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Category {
  id: string;
  name: string;
  name_tr: string;
  display_order: number;
}

export default function AddProductModal({
  visible,
  onClose,
}: AddProductModalProps) {
  const { mutate: addProduct, isPending: isAdding } = useAddProduct();
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

  // Form state - Product Image
  const [productImageUri, setProductImageUri] = useState<string | null>(null);

  // Form reset
  const resetForm = () => {
    setProductName("");
    setSelectedCategory(null);
    setSelectedPetType(null);
    setDescription("");
    setPrice("");
    setWeight("");
    setAgeGroup("");
    setStockQuantity("");
    setLowStockThreshold("");
    setProductImageUri(null);
  };

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

  // Resim seçme fonksiyonu
  const handlePickImage = async () => {
    const imageUri = await pickImageFromLibrary([1, 1]); // Kare format
    if (imageUri) {
      setProductImageUri(imageUri);
    }
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

    if (!price.trim() || parseFloat(price) <= 0) {
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

    // Fotoğraf zorunlu
    if (!productImageUri) {
      Toast.show({
        type: "error",
        text1: "Lütfen ürün fotoğrafını ekleyin!",
        bottomOffset: 40,
      });
      return;
    }

    // Backend'e gönderilecek data
    const productData = {
      categoryId: selectedCategory.id,
      petTypeId: selectedPetType?.id || null,
      name: productName.trim(),
      description: description.trim(),
      price: price.replace(",", ".")
        ? parseFloat(price.replace(",", "."))
        : null,
      weight_kg: weight.replace(",", ".")
        ? parseFloat(weight.replace(",", "."))
        : null,
      age_group: ageGroup || null, // puppy, adult, senior enum değerleri
      stock_quantity: parseInt(stockQuantity),
      low_stock_threshold: lowStockThreshold
        ? parseInt(lowStockThreshold)
        : null,
    };

    addProduct(productData, {
      onSuccess: async (response: any) => {
        console.log("✅ Ürün başarıyla eklendi!");

        // Adım 2: Fotoğrafı yükle
        if (productImageUri && response?.data?.product?.id) {
          const productId = response.data.product.id;

          try {
            await productApi.uploadProductImage(productId, productImageUri);
            console.log("✅ Ürün resmi başarıyla yüklendi!");
            Toast.show({
              type: "success",
              text1: "Ürün ve fotoğrafı başarıyla kaydedildi!",
              bottomOffset: 40,
            });
          } catch (imageError: any) {
            console.error("❌ Resim yükleme hatası:", imageError);
            Toast.show({
              type: "warning",
              text1: "Ürün oluşturuldu ancak resim yüklenemedi",
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
            error?.response?.data?.message || "Ürün eklenirken bir hata oluştu",
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
                Yeni Ürün Ekle
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
                    placeholder="Örn: 250.00"
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
                    placeholder="Örn: 2.5"
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
                  {productImageUri ? (
                    <View className="w-full items-center">
                      <Image
                        source={{ uri: productImageUri }}
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
                        Ürünün fotoğrafını yükleyerek satışa sunun.
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Bottom Spacing */}
              <View className="h-6" />
            </ScrollView>

            {/* Submit Button */}
            <View className="p-6 border-t border-gray-200">
              <TouchableOpacity
                className={`rounded-full py-4 items-center ${
                  !productImageUri || isAdding ? "bg-gray-300" : "bg-primary"
                }`}
                style={{
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
                onPress={handleSubmit}
                disabled={!productImageUri || isAdding}
              >
                {isAdding ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Ürünü Ekle
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
