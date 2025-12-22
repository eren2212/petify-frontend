import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AddProductModal from "../../../components/product/AddProductModal";
import UpdateStockModal from "../../../components/product/UpdateStockModal";
import { COLORS } from "../../../styles/theme/color";
import {
  useMyProducts,
  useDeleteProduct,
  useProductCategories,
} from "../../../hooks";
import Toast from "react-native-toast-message";
import { PetifySpinner } from "@/components/PetifySpinner";

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
  description?: string;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  name_tr: string;
}

export default function Products() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [selectedStatus, setSelectedStatus] = useState<boolean | undefined>(
    undefined
  );

  // Fetch data with filters
  const { data, isLoading, refetch, isRefetching } = useMyProducts(
    1,
    100,
    selectedCategory,
    selectedStatus
  );
  const { data: categories = [] } = useProductCategories();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const products = data?.products || [];

  const handleStockUpdate = (product: Product) => {
    setSelectedProduct(product);
    setShowStockModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      "Ürünü Sil",
      `"${product.name}" ürününü silmek istediğinizden emin misiniz?`,
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            deleteProduct(product.id, {
              onSuccess: () => {
                Toast.show({
                  type: "success",
                  text1: "Ürün başarıyla silindi!",
                  bottomOffset: 40,
                });
              },
              onError: (error: any) => {
                Toast.show({
                  type: "error",
                  text1:
                    error?.response?.data?.message ||
                    "Ürün silinirken bir hata oluştu",
                  bottomOffset: 40,
                });
              },
            });
          },
        },
      ]
    );
  };

  const handleProductPress = (productId: string) => {
    router.push(`/(protected)/products/${productId}`);
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-red-600";
    if (stock <= 10) return "text-orange-500";
    return "text-green-600";
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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200">
          <Text className="text-3xl font-bold text-text">Ürünlerim</Text>

          {/* Add Product Button */}
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
                    selectedStatus === undefined
                      ? "text-white"
                      : "text-gray-700"
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

        {/* Products List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <PetifySpinner size={180} />
          </View>
        ) : products.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="cube-outline" size={80} color="#D1D5DB" />
            <Text className="text-gray-900 font-bold text-xl mt-4">
              {selectedCategory || selectedStatus !== undefined
                ? "Filtre kriterlerine uygun ürün bulunamadı"
                : "Henüz ürün yok"}
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              {selectedCategory || selectedStatus !== undefined
                ? "Farklı filtreler deneyebilirsiniz"
                : "Sağ üstteki + butonuna basarak ilk ürününüzü ekleyin"}
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
                Ürünleri Yönet ({products.length})
              </Text>

              {products.map((product: Product) => (
                <TouchableOpacity
                  key={product.id}
                  onPress={() => handleProductPress(product.id)}
                  className="bg-white rounded-2xl p-4 mb-4 flex-row items-center"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  disabled={isDeleting}
                >
                  <View className="absolute top-1 right-2">
                    {product.is_active ? (
                      <View className="bg-green-100 px-2 py-0.5 rounded absolute top-1 right-2">
                        <Text className="text-green-600 text-xs font-bold">
                          Aktif
                        </Text>
                      </View>
                    ) : (
                      <View className="bg-red-100 px-2 py-0.5 rounded absolute top-1 right-2">
                        <Text className="text-red-600 text-xs font-bold">
                          Pasif
                        </Text>
                      </View>
                    )}
                  </View>
                  {/* Product Image */}
                  <View className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden mr-4">
                    {product.image_url ? (
                      <Image
                        source={{
                          uri: `${process.env.EXPO_PUBLIC_API_URL}/products/image/${product.image_url}`,
                        }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <Ionicons
                          name="image-outline"
                          size={32}
                          color="#9CA3AF"
                        />
                      </View>
                    )}
                  </View>
                  {/* Product Info */}
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text
                        className="text-base font-bold text-gray-900"
                        numberOfLines={1}
                      >
                        {product.name}
                      </Text>
                    </View>
                    <Text
                      className={`text-sm font-semibold ${getStockColor(product.stock_quantity)}`}
                    >
                      {product.stock_quantity} adet stok
                    </Text>
                    <Text className="text-lg font-bold text-primary mt-1">
                      ₺{product.price.toFixed(2)}
                    </Text>
                  </View>
                  {/* Action Buttons */}
                  <View className="flex-row gap-2">
                    {/* Edit Stock Button */}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleStockUpdate(product);
                      }}
                      className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center"
                      disabled={isDeleting}
                    >
                      <Ionicons name="pencil" size={18} color="#3B82F6" />
                    </TouchableOpacity>

                    {/* Delete Button */}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product);
                      }}
                      className="w-10 h-10 rounded-full bg-red-50 items-center justify-center"
                      disabled={isDeleting}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Bottom Spacing */}
              <View className="h-20" />
            </View>
          </ScrollView>
        )}
      </View>

      {/* Add Product Modal */}
      <AddProductModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Update Stock Modal */}
      {selectedProduct && (
        <UpdateStockModal
          visible={showStockModal}
          onClose={() => {
            setShowStockModal(false);
            setSelectedProduct(null);
          }}
          productId={selectedProduct.id}
          currentStock={selectedProduct.stock_quantity}
          productName={selectedProduct.name}
        />
      )}
    </SafeAreaView>
  );
}
