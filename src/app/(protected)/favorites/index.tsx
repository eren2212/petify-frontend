import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMyFavorites, FavoriteItem } from "@/hooks/useFavorites";
import { FavoriteType } from "@/lib/api";
import { PetifySpinner } from "@/components/PetifySpinner";
import { COLORS } from "@/styles/theme/color";

// ─── Sabitler ─────────────────────────────────────────────────────────────────

const FILTERS: {
  label: string;
  value: FavoriteType | "all";
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
    { label: "Tümü", value: "all", icon: "apps-outline" },
    { label: "Ürünler", value: "product", icon: "pricetag-outline" },
    { label: "Pet Shop", value: "pet_shop", icon: "storefront-outline" },
    { label: "Bakıcı", value: "pet_sitter", icon: "person-outline" },
    { label: "Klinik", value: "pet_clinic", icon: "medkit-outline" },
    { label: "Otel", value: "pet_hotel", icon: "home-outline" },
  ];

const TYPE_LABEL: Record<FavoriteType, string> = {
  product: "Ürün",
  pet_shop: "Pet Shop",
  pet_sitter: "Bakıcı",
  pet_clinic: "Klinik",
  pet_hotel: "Otel",
};

const TYPE_THEME: Record<
  FavoriteType,
  {
    color: string;
    bg: string;
    icon: keyof typeof Ionicons.glyphMap;
  }
> = {
  product: { color: "#D97706", bg: "#FEF3C7", icon: "pricetag" },
  pet_shop: { color: "#7C3AED", bg: "#EDE9FE", icon: "storefront" },
  pet_sitter: { color: "#2563EB", bg: "#DBEAFE", icon: "person" },
  pet_clinic: { color: "#DC2626", bg: "#FEE2E2", icon: "medkit" },
  pet_hotel: { color: "#EA580C", bg: "#FFEDD5", icon: "home" },
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

const IMG_PATH: Record<FavoriteType, string> = {
  product: "/products/image/",
  pet_shop: "/home/images/shop-logo/",
  pet_sitter: "/home/images/sitter-profile/",
  pet_clinic: "/home/images/clinic-logo/",
  pet_hotel: "/home/images/hotel-logo/",
};

function buildImageUrl(type: FavoriteType, file: string | null) {
  if (!file) return null;
  if (file.startsWith("http")) return file;
  return `${BASE_URL}${IMG_PATH[type]}${file}`;
}

// ─── Kart ─────────────────────────────────────────────────────────────────────

function FavoriteCard({
  item,
  onPress,
}: {
  item: FavoriteItem;
  onPress: () => void;
}) {
  const t = TYPE_THEME[item.favorite_type];
  const name = item.detail?._name ?? "—";
  const imgUrl = buildImageUrl(item.favorite_type, item.detail?._image ?? null);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white rounded-2xl mb-4 flex-row items-center overflow-hidden mx-1"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Renkli Çubuk */}
      <View className="w-1.5 self-stretch" style={{ backgroundColor: t.color }} />

      {/* Küçük Resim */}
      <View
        className="w-16 h-16 rounded-xl m-3 items-center justify-center overflow-hidden"
        style={{ backgroundColor: t.bg }}
      >
        {imgUrl ? (
          <Image source={{ uri: imgUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Ionicons name={t.icon} size={28} color={t.color} />
        )}
      </View>

      {/* Metin İçeriği */}
      <View className="flex-1 py-3 pr-2">
        <Text className="text-base font-bold text-gray-800 mb-1" numberOfLines={1}>
          {name}
        </Text>

        <View className="flex-row items-center mb-1.5">
          <View
            className="flex-row items-center px-2 py-0.5 rounded-md"
            style={{ backgroundColor: t.bg }}
          >
            <Ionicons name={t.icon} size={10} color={t.color} />
            <Text className="text-[10px] font-bold ml-1 uppercase" style={{ color: t.color }}>
              {TYPE_LABEL[item.favorite_type]}
            </Text>
          </View>
        </View>

        {item.detail?.address ? (
          <View className="flex-row items-center mt-0.5">
            <Ionicons name="location" size={12} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 ml-1 flex-1" numberOfLines={1}>
              {item.detail.address}
            </Text>
          </View>
        ) : item.favorite_type === "product" && item.detail?.price != null ? (
          <Text className="text-sm font-bold mt-0.5" style={{ color: t.color }}>
            {Number(item.detail.price).toLocaleString("tr-TR")} ₺
          </Text>
        ) : null}
      </View>

      {/* Ok İkonu */}
      <View className="px-4">
        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
      </View>
    </TouchableOpacity>
  );
}

// ─── Boş Durum ────────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <View className="flex-1 items-center justify-center px-8 pb-20">
      <View className="w-24 h-24 rounded-full items-center justify-center mb-6 bg-red-50">
        <Ionicons name="heart-dislike-outline" size={48} color="#EF4444" />
      </View>
      <Text className="text-xl font-bold text-gray-800 text-center mb-3">
        {filtered ? "Bu kategoride favori yok" : "Henüz favori eklemedin"}
      </Text>
      <Text className="text-sm text-gray-500 text-center leading-6 px-4">
        {filtered
          ? "Farklı bir kategori seçerek diğer favorilerine göz atabilirsin."
          : "Ürünleri, bakıcıları veya işletmeleri favorilerine ekleyerek hızlıca ulaşabilirsin."}
      </Text>
      {!filtered && (
        <TouchableOpacity
          onPress={() => router.push("/(protected)/(tabs)/index" as any)}
          className="mt-8 px-10 py-3.5 rounded-full bg-primary"
        >
          <Text className="text-white font-bold text-base">Keşfetmeye Başla</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────

export default function FavoritesScreen() {
  const [activeFilter, setActiveFilter] = useState<FavoriteType | "all">("all");

  const favoriteType = activeFilter === "all" ? undefined : (activeFilter as FavoriteType);

  const { data: favorites = [], isLoading, refetch, isRefetching } =
    useMyFavorites(favoriteType);

  const navigateTo = (item: FavoriteItem) => {
    const routes: Record<FavoriteType, string> = {
      product: `/(protected)/products/${item.target_id}`,
      pet_shop: `/(protected)/shops/${item.target_id}`,
      pet_sitter: `/(protected)/sitters/${item.target_id}`,
      pet_clinic: `/(protected)/clinics/${item.target_id}`,
      pet_hotel: `/(protected)/hotels/${item.target_id}`,
    };
    router.push(routes[item.favorite_type] as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={['top']}>

      {/* ── Header ────────────────────────────────────────── */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 rounded-full bg-white items-center justify-center shadow-sm"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
          }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text || "#1F2937"} />
        </TouchableOpacity>

        <View className="flex-1 px-4">
          <Text className="text-2xl font-black text-gray-900 tracking-tight">Favorilerim</Text>
          <Text className="text-xs text-gray-500 mt-1 font-medium">
            {isLoading
              ? "Yükleniyor…"
              : favorites.length > 0
                ? `${favorites.length} kayıtlı favori`
                : "Henüz favori eklenmedi"}
          </Text>
        </View>

        <View className="w-11 h-11 rounded-full bg-red-50 items-center justify-center border border-red-100">
          <Ionicons name="heart" size={22} color="#EF4444" />
        </View>
      </View>

      {/* ── Filtre Sekmeleri ──────────────────────────────── */}
      <View className="mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 4,
          }}
        >
          {FILTERS.map((f, index) => {
            const active = activeFilter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                onPress={() => setActiveFilter(f.value)}
                activeOpacity={0.7}
                className={`flex-row items-center rounded-full px-4 py-2.5 mr-3 ${active ? "bg-primary border-transparent" : "bg-white border-gray-200"
                  }`}
                style={{
                  borderWidth: 1,
                  shadowColor: active ? COLORS.primary : "#000",
                  shadowOffset: { width: 0, height: active ? 2 : 1 },
                  shadowOpacity: active ? 0.2 : 0.02,
                  shadowRadius: active ? 4 : 2,
                  elevation: active ? 3 : 0,
                }}
              >
                <Ionicons
                  name={f.icon}
                  size={16}
                  color={active ? "#fff" : "#6B7280"}
                />
                <Text
                  className={`text-sm font-bold ml-2 ${active ? "text-white" : "text-gray-600"
                    }`}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── İçerik Listesi ───────────────────────────────── */}
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center pb-20">
            <PetifySpinner size={140} />
          </View>
        ) : favorites.length === 0 ? (
          <EmptyState filtered={activeFilter !== "all"} />
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FavoriteCard item={item} onPress={() => navigateTo(item)} />
            )}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                colors={[COLORS.primary || "#000"]}
                tintColor={COLORS.primary || "#000"}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}