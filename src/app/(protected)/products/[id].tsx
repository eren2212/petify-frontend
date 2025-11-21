import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../styles/theme/color";
import { useProductDetail, useUpdateProductStatus } from "../../../hooks";
import { getActiveRole, useCurrentUser } from "../../../hooks/useAuth";
import EditProductModal from "../../../components/product/EditProductModal";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading, refetch } = useProductDetail(id!);
  const insets = useSafeAreaInsets();
  const { data: user } = useCurrentUser();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateProductStatus();

  // States
  const [showEditModal, setShowEditModal] = useState(false);

  // Aktif rolü al (approved olan)
  const activeRole = getActiveRole(user);
  const roleType = activeRole?.role_type;

  // Handle status toggle
  const handleToggleStatus = () => {
    if (!product) return;

    const newStatus = !product.is_active;
    updateStatus(
      { id: product.id, status: newStatus },
      {
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: `Ürün ${newStatus ? "aktif" : "pasif"} duruma getirildi!`,
            bottomOffset: 40,
          });
          refetch();
        },
        onError: (error: any) => {
          Toast.show({
            type: "error",
            text1:
              error?.response?.data?.message ||
              "Durum değiştirilirken bir hata oluştu",
            bottomOffset: 40,
          });
        },
      }
    );
  };
  // Loading State
  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Error State
  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Ionicons
          name="alert-circle"
          size={64}
          color="#EF4444"
          className="opacity-80"
        />
        <Text className="text-gray-800 font-bold text-xl mt-4 text-center">
          Ürün Bulunamadı
        </Text>
        <Text className="text-gray-500 text-center mt-2 mb-8">
          Aradığınız ürün kaldırılmış veya mevcut değil.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-900 px-8 py-4 rounded-2xl shadow-lg shadow-gray-300"
        >
          <Text className="text-white font-semibold">Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Helpers
  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { text: "Tükendi", color: "bg-red-100 text-red-600 icon-red-600" };
    if (stock <= 10)
      return {
        text: "Son Ürünler",
        color: "bg-orange-100 text-orange-600 icon-orange-600",
      };
    return {
      text: "Stokta Var",
      color: "bg-green-100 text-green-600 icon-green-600",
    };
  };

  const getAgeGroupLabel = (ageGroup: string) => {
    const labels: { [key: string]: string } = {
      puppy: "Yavru",
      adult: "Yetişkin",
      senior: "Yaşlı",
    };
    return labels[ageGroup] || ageGroup;
  };

  const stockStatus = getStockStatus(product.stock_quantity);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* 1. HERO IMAGE SECTION (Tam ekran genişliği) */}
        <View className="w-96 mx-auto h-[45vh] mb-10 bg-gray-200 relative">
          {product.image_url ? (
            <Image
              source={{
                uri: `${process.env.EXPO_PUBLIC_API_URL}/products/image/${product.image_url}`,
              }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gray-100">
              <Ionicons name="image-outline" size={80} color="#E5E7EB" />
            </View>
          )}
          {/* Resmin altına hafif bir karartma gradyanı ekleyebilirsiniz (Opsiyonel) */}
        </View>

        {/* 2. CONTENT CONTAINER (Bottom Sheet Tarzı) */}
        <View className="-mt-10 bg-gray-50 rounded-t-[32px] px-6 pt-8 pb-32 shadow-2xl shadow-black/10 min-h-[60vh]">
          {/* Header Info */}
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 mr-4">
              {product.category && (
                <Text className="text-primary font-bold tracking-wider text-xs uppercase mb-2">
                  {product.category.name_tr} • {product.pet_type?.name_tr}
                </Text>
              )}
              <Text className="text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </Text>
            </View>
          </View>

          {/* Rating / Reviews placeholder (Opsiyonel modern dokunuş) */}
          <View className="flex-row items-center mb-6">
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text className="text-gray-700 font-medium ml-1">4.8</Text>
            <Text className="text-gray-400 text-xs ml-2">
              (124 Değerlendirme)
            </Text>
          </View>

          {/* Stock & Status Badge Row */}
          <View className="flex-row items-center gap-3 mb-8">
            <View
              className={`px-3 py-1.5 rounded-full flex-row items-center ${stockStatus.color.split(" ")[0]}`}
            >
              <Ionicons
                name="cube-outline"
                size={14}
                className="mr-1"
                color={
                  stockStatus.color.includes("red")
                    ? "#DC2626"
                    : stockStatus.color.includes("orange")
                      ? "#EA580C"
                      : "#16A34A"
                }
              />
              <Text
                className={`text-xs font-bold ${stockStatus.color.split(" ")[1]}`}
              >
                {stockStatus.text}
              </Text>
            </View>

            {!product.is_active && (
              <View className="px-3 py-1.5 bg-gray-200 rounded-full">
                <Text className="text-xs font-bold text-gray-500">
                  Satışa Kapalı
                </Text>
              </View>
            )}
          </View>

          <View className="h-[1px] bg-gray-200 w-full mb-6" />

          {/* 3. DESCRIPTION */}
          <Text className="text-lg font-bold text-gray-900 mb-3">Açıklama</Text>
          <Text className="text-gray-500 leading-7 text-base mb-8">
            {product.description ||
              "Bu ürün için henüz bir açıklama girilmemiş."}
          </Text>

          {/* 4. MODERN GRID DETAILS */}
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Ürün Özellikleri
          </Text>

          <View className="flex-row flex-wrap justify-between gap-y-4">
            {/* Kutu 1: Ağırlık */}
            <View className="w-[48%] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <View className="bg-blue-50 w-10 h-10 rounded-full items-center justify-center mb-3">
                <Ionicons name="scale-outline" size={20} color="#3B82F6" />
              </View>
              <Text className="text-gray-400 text-xs mb-1">Ağırlık</Text>
              <Text className="text-gray-900 font-bold text-lg">
                {product.weight_kg ? `${product.weight_kg} kg` : "-"}
              </Text>
            </View>

            {/* Kutu 2: Yaş Grubu */}
            <View className="w-[48%] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <View className="bg-purple-50 w-10 h-10 rounded-full items-center justify-center mb-3">
                <FontAwesome6 name="baby-carriage" size={22} color="purple" />
              </View>
              <Text className="text-gray-400 text-xs mb-1">Yaş Grubu</Text>
              <Text className="text-gray-900 font-bold text-lg">
                {product.age_group ? getAgeGroupLabel(product.age_group) : "-"}
              </Text>
            </View>

            {/* Kutu 3: Stok Miktarı */}
            <View className="w-[48%] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <View className="bg-orange-50 w-10 h-10 rounded-full items-center justify-center mb-3">
                <Ionicons name="layers-outline" size={20} color="#F97316" />
              </View>
              <Text className="text-gray-400 text-xs mb-1">Stok Adedi</Text>
              <Text className="text-gray-900 font-bold text-lg">
                {product.stock_quantity}
              </Text>
            </View>

            {/* Kutu 4: Güncelleme */}
            {roleType === "pet_shop" && (
              <View className="w-[48%] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <View className="bg-emerald-50 w-10 h-10 rounded-full items-center justify-center mb-3">
                  <Ionicons name="calendar-outline" size={20} color="#10B981" />
                </View>
                <Text className="text-gray-400 text-xs mb-1">
                  Son Güncelleme
                </Text>
                <Text className="text-gray-900 font-bold text-sm mt-1">
                  {new Date(
                    product.updated_at || product.created_at
                  ).toLocaleDateString("tr-TR")}
                </Text>
              </View>
            )}

            <View className=" w-full bg-white border-t border-gray-100 px-6 py-4 flex-row items-center justify-between shadow-sm rounded-b-3xl">
              <View>
                <Text className="text-gray-400 text-xs mb-0.5">
                  Toplam Fiyat
                </Text>
                <Text className="text-3xl font-bold text-gray-900">
                  ₺{product.price.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Pet Shop Only - Action Buttons */}
          {roleType === "pet_shop" && (
            <View className="px-6 pb-8 pt-4">
              <View className="flex-row gap-3">
                {/* Edit Button */}
                <TouchableOpacity
                  onPress={() => setShowEditModal(true)}
                  className="flex-1 bg-primary rounded-2xl py-4 flex-row items-center justify-center"
                  style={{
                    shadowColor: COLORS.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <Ionicons name="pencil" size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Düzenle
                  </Text>
                </TouchableOpacity>

                {/* Toggle Status Button */}
                <TouchableOpacity
                  onPress={handleToggleStatus}
                  disabled={isUpdatingStatus}
                  className={`flex-1 rounded-2xl py-4 flex-row items-center justify-center ${
                    product.is_active ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{
                    shadowColor: product.is_active ? "#EF4444" : "#10B981",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  {isUpdatingStatus ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Ionicons
                        name={
                          product.is_active
                            ? "close-circle"
                            : "checkmark-circle"
                        }
                        size={20}
                        color="white"
                      />
                      <Text className="text-white font-bold text-base ml-2">
                        {product.is_active ? "Pasif Yap" : "Aktif Yap"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Product Modal */}
      {product && (
        <EditProductModal
          visible={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            refetch();
          }}
          product={product}
        />
      )}
    </View>
  );
}
