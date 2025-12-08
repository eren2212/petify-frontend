import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import AddPetSitterServiceModal from "./AddPetSitterServiceModal";
import EditPetSitterServiceModal from "./EditPetSitterServiceModal";
import { COLORS } from "../../styles/theme/color";
import {
  useMyPetSitterServices,
  useDeletePetSitterService,
  usePetSitterServiceCategories,
} from "../../hooks";
import Toast from "react-native-toast-message";

interface Service {
  id: string;
  service_category_id: string;
  pet_type_id: string;
  price: number;
  price_type: string;
  description: string;
  is_active: boolean;
  pet_sitter_service_categories: {
    name: string;
    name_tr: string;
    icon_url: string;
  };
  pet_types: {
    name: string;
    name_tr: string;
  };
}

interface Category {
  id: string;
  name: string;
  name_tr: string;
  icon_url: string;
}

export default function PetSitterServiceList() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [selectedStatus, setSelectedStatus] = useState<boolean | undefined>(
    undefined
  );

  // Fetch data with filters
  const { data, isLoading, refetch, isRefetching } = useMyPetSitterServices(
    1,
    100,
    selectedCategory,
    selectedStatus
  );
  const { data: categories = [] } = usePetSitterServiceCategories();
  const { mutate: deleteService, isPending: isDeleting } =
    useDeletePetSitterService();

  const services = data?.data || [];

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setShowEditModal(true);
  };

  const handleDeleteService = (service: Service) => {
    Alert.alert(
      "Hizmeti Sil",
      `"${service.pet_sitter_service_categories.name_tr}" hizmetini silmek istediğinizden emin misiniz?`,
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            deleteService(service.id, {
              onSuccess: () => {
                Toast.show({
                  type: "success",
                  text1: "Hizmet başarıyla silindi!",
                  bottomOffset: 40,
                });
              },
              onError: (error: any) => {
                Toast.show({
                  type: "error",
                  text1:
                    error?.response?.data?.message ||
                    "Hizmet silinirken bir hata oluştu",
                  bottomOffset: 40,
                });
              },
            });
          },
        },
      ]
    );
  };

  const getPriceTypeLabel = (priceType: string) => {
    switch (priceType) {
      case "hourly":
        return "Saatlik";
      case "daily":
        return "Günlük";
      default:
        return priceType;
    }
  };

  // Handle category filter
  const handleCategoryFilter = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(undefined); // Deselect
    } else {
      setSelectedCategory(categoryId);
    }
  };

  // Handle status filter
  const handleStatusFilter = (status: boolean | undefined) => {
    if (selectedStatus === status) {
      setSelectedStatus(undefined); // Deselect
    } else {
      setSelectedStatus(status);
    }
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200">
        <Text className="text-3xl font-bold text-text">Hizmetlerim</Text>

        {/* Add Service Button */}
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="bg-primary rounded-full w-14 h-14 items-center justify-center"
          style={{
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filters Section */}
      <View className="px-6 py-4 border-b border-gray-200">
        {/* Category Filters - Horizontal Scroll */}
        <View className="mb-3">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Kategoriler
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-2"
          >
            {/* All Categories Button */}
            <TouchableOpacity
              onPress={() => setSelectedCategory(undefined)}
              className={`px-4 py-2 rounded-full border ${
                selectedCategory === undefined
                  ? "bg-primary border-primary"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedCategory === undefined
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                Tümü
              </Text>
            </TouchableOpacity>

            {categories.map((category: Category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryFilter(category.id)}
                className={`px-4 py-2 rounded-full border ${
                  selectedCategory === category.id
                    ? "bg-primary border-primary"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedCategory === category.id
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {category.name_tr}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Status Filters */}
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Durum
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => handleStatusFilter(undefined)}
              className={`px-4 py-2 rounded-full border ${
                selectedStatus === undefined
                  ? "bg-primary border-primary"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedStatus === undefined ? "text-white" : "text-gray-700"
                }`}
              >
                Tümü
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStatusFilter(true)}
              className={`px-4 py-2 rounded-full border ${
                selectedStatus === true
                  ? "bg-green-500 border-green-500"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedStatus === true ? "text-white" : "text-gray-700"
                }`}
              >
                Aktif
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStatusFilter(false)}
              className={`px-4 py-2 rounded-full border ${
                selectedStatus === false
                  ? "bg-red-500 border-red-500"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedStatus === false ? "text-white" : "text-gray-700"
                }`}
              >
                Pasif
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Services List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="text-gray-500 mt-4">Hizmetler yükleniyor...</Text>
        </View>
      ) : services.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="briefcase-outline" size={80} color="#D1D5DB" />
          <Text className="text-gray-900 font-bold text-xl mt-4">
            {selectedCategory || selectedStatus !== undefined
              ? "Filtre kriterlerine uygun hizmet bulunamadı"
              : "Henüz hizmet yok"}
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            {selectedCategory || selectedStatus !== undefined
              ? "Farklı filtreler deneyebilirsiniz"
              : "Sağ üstteki + butonuna basarak ilk hizmetinizi ekleyin"}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[COLORS.primary]}
            />
          }
        >
          <View className="px-6 py-4">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Hizmetleri Yönet ({services.length})
            </Text>

            {services.map((service: Service) => (
              <View
                key={service.id}
                className="bg-white rounded-2xl p-4 mb-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Image
                  source={{
                    uri: `${process.env.EXPO_PUBLIC_API_URL}/petsitterservices/category-icon/${service.pet_sitter_service_categories.icon_url}`,
                  }}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 10,
                    marginBottom: 10,
                  }}
                  resizeMode="repeat"
                />
                {/* Status Badge */}
                <View className="absolute top-2 right-2">
                  {service.is_active ? (
                    <View className="bg-green-100 px-2 py-0.5 rounded">
                      <Text className="text-green-600 text-xs font-bold">
                        Aktif
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-red-100 px-2 py-0.5 rounded">
                      <Text className="text-red-600 text-xs font-bold">
                        Pasif
                      </Text>
                    </View>
                  )}
                </View>

                {/* Service Info */}
                <View className="mb-3">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    {service.pet_sitter_service_categories.name_tr}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-2">
                    {service.pet_types.name_tr}
                  </Text>
                  <Text
                    className="text-sm text-gray-700 leading-5"
                    numberOfLines={2}
                  >
                    {service.description}
                  </Text>
                </View>

                {/* Price & Type */}
                <View className="flex-row items-center mb-3">
                  <Text className="text-xl font-bold text-primary">
                    ₺{service.price.toFixed(2)}
                  </Text>
                  <Text className="text-sm text-gray-500 ml-2">
                    / {getPriceTypeLabel(service.price_type)}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-2">
                  {/* Edit Button */}
                  <TouchableOpacity
                    onPress={() => handleEditService(service)}
                    className="flex-1 bg-blue-50 rounded-xl py-3 items-center flex-row justify-center"
                    disabled={isDeleting}
                  >
                    <Ionicons name="pencil" size={18} color="#3B82F6" />
                    <Text className="text-blue-500 font-semibold ml-2">
                      Düzenle
                    </Text>
                  </TouchableOpacity>

                  {/* Delete Button */}
                  <TouchableOpacity
                    onPress={() => handleDeleteService(service)}
                    className="flex-1 bg-red-50 rounded-xl py-3 items-center flex-row justify-center"
                    disabled={isDeleting}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    <Text className="text-red-500 font-semibold ml-2">Sil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Bottom Spacing */}
            <View className="h-20" />
          </View>
        </ScrollView>
      )}

      {/* Add Service Modal */}
      <AddPetSitterServiceModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Edit Service Modal */}
      {selectedService && (
        <EditPetSitterServiceModal
          visible={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedService(null);
          }}
          service={selectedService}
        />
      )}
    </View>
  );
}
