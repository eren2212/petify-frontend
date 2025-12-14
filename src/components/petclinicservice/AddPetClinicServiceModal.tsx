import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
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
  useAddPetClinicService,
  usePetClinicServiceCategories,
} from "../../hooks";

interface AddPetClinicServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Category {
  id: string;
  name: string;
  name_tr: string;
  icon_url: string;
}

export default function AddPetClinicServiceModal({
  visible,
  onClose,
}: AddPetClinicServiceModalProps) {
  const { mutate: addService, isPending: isAdding } = useAddPetClinicService();
  const { data: categories = [], isLoading: categoriesLoading } =
    usePetClinicServiceCategories();

  // Form state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Form reset
  const resetForm = () => {
    setSelectedCategory(null);
  };

  // Dropdown seçim fonksiyonu
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
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

    addService(selectedCategory.id, {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Hizmet başarıyla eklendi!",
          bottomOffset: 40,
        });
        resetForm();
        onClose();
      },
      onError: (error: any) => {
        Toast.show({
          type: "error",
          text1:
            error?.response?.data?.message ||
            "Hizmet eklenirken bir hata oluştu",
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
                Yeni Hizmet Ekle
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

                {/* Info Text */}
                <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                  <View className="flex-row items-start">
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color="#3B82F6"
                      style={{ marginRight: 8, marginTop: 2 }}
                    />
                    <View className="flex-1">
                      <Text className="text-sm text-blue-700 font-medium mb-1">
                        Bilgilendirme
                      </Text>
                      <Text className="text-xs text-blue-600">
                        Pet Clinic hizmetleri için sadece kategori seçimi
                        yapmanız yeterlidir. Seçtiğiniz hizmet otomatik olarak
                        profilinize eklenecektir.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Bottom Spacing */}
              <View className="h-6" />
            </ScrollView>

            {/* Submit Button */}
            <View className="p-6 border-t border-gray-200">
              <TouchableOpacity
                className={`rounded-full py-4 items-center ${
                  isAdding ? "bg-gray-300" : "bg-primary"
                }`}
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
                    Hizmeti Ekle
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
