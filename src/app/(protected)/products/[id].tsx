import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../styles/theme/color";
import { useProductDetail, useUpdateProductStatus } from "../../../hooks";
import { getActiveRole, useCurrentUser } from "../../../hooks/useAuth";
import EditProductModal from "../../../components/product/EditProductModal";
import Toast from "react-native-toast-message";
import { PetifySpinner } from "@/components/PetifySpinner";

const { width, height } = Dimensions.get("window");
const IMAGE_HEIGHT = height * 0.45;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading, refetch } = useProductDetail(id!);
  const insets = useSafeAreaInsets();
  const { data: user } = useCurrentUser();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateProductStatus();
  const scrollY = useRef(new Animated.Value(0)).current;

  // States
  const [showEditModal, setShowEditModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Aktif rolü al
  const activeRole = getActiveRole(user);
  const roleType = activeRole?.role_type;

  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT - 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

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
          });
          refetch();
        },
        onError: (error: any) => {
          Toast.show({
            type: "error",
            text1: error?.response?.data?.message || "Bir hata oluştu",
          });
        },
      }
    );
  };

  // Loading State
  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <PetifySpinner size={180} />
      </View>
    );
  }

  // Error State
  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="text-gray-900 font-bold text-xl mt-4">
          Ürün Bulunamadı
        </Text>
        <Text className="text-gray-500 text-center mt-2 mb-6">
          Aradığınız ürün mevcut değil.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-black px-8 py-4 rounded-full"
        >
          <Text className="text-white font-semibold">Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Helpers
  const getAgeGroupLabel = (ageGroup: string) => {
    const labels: { [key: string]: string } = {
      puppy: "Yavru",
      adult: "Yetişkin",
      senior: "Yaşlı",
    };
    return labels[ageGroup] || ageGroup;
  };

  const hasDiscount = product.price > 50;
  const originalPrice = hasDiscount ? product.price * 1.25 : null;
  const discountPercent = hasDiscount ? 20 : 0;

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* FLOATING HEADER BUTTONS - Always visible */}

      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* HERO IMAGE */}
        <View style={{ height: IMAGE_HEIGHT }} className="bg-gray-100">
          {product.image_url ? (
            <Image
              source={{
                uri: `${process.env.EXPO_PUBLIC_API_URL}/products/image/${product.image_url}`,
              }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="image-outline" size={80} color="#D1D5DB" />
            </View>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <View className="absolute top-8 left-5 bg-red-500 px-3 py-1.5 rounded-full">
              <Text className="text-white text-xs font-bold">
                %{discountPercent} İNDİRİM
              </Text>
            </View>
          )}
          <View className="absolute top-10 right-5 bg-white px-3 py-1.5 rounded-full">
            <Ionicons name="heart-outline" size={20} color="red" />
          </View>
        </View>

        {/* PRODUCT INFO CONTAINER */}
        <View className="bg-white -mt-6 rounded-t-[28px] pt-6 pb-40">
          <View className="px-5">
            {/* Category & Rating Row */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                {product.category && (
                  <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {product.category.name_tr}
                  </Text>
                )}
                {product.pet_type && (
                  <>
                    <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                    <Text className="text-xs font-semibold text-gray-500">
                      {product.pet_type.name_tr}
                    </Text>
                  </>
                )}
              </View>

              {/* Rating */}
              <View className="flex-row items-center bg-gray-50 px-2.5 py-1 rounded-full">
                <Ionicons name="star" size={14} color="#FBBF24" />
                <Text className="text-xs font-bold text-gray-700 ml-1">
                  4.8
                </Text>
                <Text className="text-xs text-gray-400 ml-1">(256)</Text>
              </View>
            </View>

            {/* Product Name */}
            <Text className="text-2xl font-black text-gray-900 mb-4 leading-tight">
              {product.name}
            </Text>

            {/* Price Section */}
            <View className="flex-row items-baseline mb-6">
              <Text className="text-3xl font-black text-gray-900">
                ₺
                {product.price.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}
              </Text>
              {originalPrice && (
                <Text className="text-lg text-gray-400 line-through ml-3">
                  ₺
                  {originalPrice.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              )}
            </View>

            {/* Delivery Info */}
            <View className="flex-row items-center bg-emerald-50 px-4 py-3 rounded-2xl mb-6">
              <Ionicons name="rocket-outline" size={20} color="#059669" />
              <View className="ml-3">
                <Text className="text-sm font-bold text-emerald-700">
                  Hızlı Teslimat
                </Text>
                <Text className="text-xs text-emerald-600">Yarın kapında</Text>
              </View>
            </View>

            {/* Feature Pills - Horizontal Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6 -mx-5 px-5"
            >
              <View className="flex-row gap-2">
                {product.stock_quantity > 0 ? (
                  <View className="bg-emerald-100 px-4 py-2 rounded-full">
                    <Text className="text-xs font-bold text-emerald-700">
                      {product.stock_quantity} Adet Stokta
                    </Text>
                  </View>
                ) : (
                  <View className="bg-red-100 px-4 py-2 rounded-full">
                    <Text className="text-xs font-bold text-red-700">
                      Tükendi
                    </Text>
                  </View>
                )}

                {product.weight_kg && (
                  <View className="bg-gray-100 px-4 py-2 rounded-full">
                    <Text className="text-xs font-bold text-gray-700">
                      {product.weight_kg} kg
                    </Text>
                  </View>
                )}

                {product.age_group && (
                  <View className="bg-purple-100 px-4 py-2 rounded-full">
                    <Text className="text-xs font-bold text-purple-700">
                      {getAgeGroupLabel(product.age_group)}
                    </Text>
                  </View>
                )}

                <View
                  className={`px-4 py-2 rounded-full ${
                    product.is_active ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      product.is_active ? "text-blue-700" : "text-gray-500"
                    }`}
                  >
                    {product.is_active ? "Aktif" : "Pasif"}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Divider */}
            <View className="h-px bg-gray-100 mb-6" />

            {/* Description */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 mb-3">
                Ürün Açıklaması
              </Text>
              <Text
                className="text-sm text-gray-600 leading-6"
                numberOfLines={showFullDescription ? undefined : 3}
              >
                {product.description ||
                  "Bu ürün için açıklama bulunmamaktadır."}
              </Text>
              {product.description && product.description.length > 100 && (
                <TouchableOpacity
                  onPress={() => setShowFullDescription(!showFullDescription)}
                  className="mt-2"
                >
                  <Text className="text-sm font-semibold text-orange-500">
                    {showFullDescription ? "Daha Az Göster" : "Devamını Oku"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Quantity Selector - Only for customers */}
            {roleType !== "pet_shop" && product.stock_quantity > 0 && (
              <View className="mb-6">
                <Text className="text-base font-bold text-gray-900 mb-3">
                  Adet
                </Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center"
                  >
                    <Ionicons name="remove" size={22} color="#374151" />
                  </TouchableOpacity>

                  <Text className="mx-8 text-xl font-black text-gray-900">
                    {quantity}
                  </Text>

                  <TouchableOpacity
                    onPress={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center"
                  >
                    <Ionicons name="add" size={22} color="#374151" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {/* STICKY BOTTOM BAR */}
      <View
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 20,
        }}
        className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-5 pt-4"
      >
        {roleType === "pet_shop" ? (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setShowEditModal(true)}
              className="flex-1 h-14 bg-gray-900 rounded-full items-center justify-center flex-row"
            >
              <Ionicons name="create-outline" size={18} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                Düzenle
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleToggleStatus}
              disabled={isUpdatingStatus}
              className={`flex-1 h-14 rounded-full items-center justify-center flex-row ${
                product.is_active ? "bg-orange-500" : "bg-emerald-500"
              }`}
            >
              {isUpdatingStatus ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons
                    name={
                      product.is_active
                        ? "pause-circle-outline"
                        : "play-circle-outline"
                    }
                    size={18}
                    color="white"
                  />
                  <Text className="text-white font-bold text-base ml-2">
                    {product.is_active ? "Pasif Yap" : "Aktif Yap"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row items-center gap-4">
            {/* Price in bottom bar */}
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Toplam</Text>
              <Text className="text-xl font-black text-gray-900">
                ₺
                {(product.price * quantity).toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
              className="flex-[2] h-14 bg-primary rounded-full items-center justify-center flex-row shadow-lg"
              style={{
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            >
              <Ionicons name="cart" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                Sepete Ekle
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

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
