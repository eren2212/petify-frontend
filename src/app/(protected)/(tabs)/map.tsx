import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Image,
  Linking,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useNearbyMapItems } from "../../../hooks";
import { useAppStore } from "../../../stores";
import { router } from "expo-router";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_HEIGHT = 250;

type FilterType = "adoption" | "lost_pet" | "clinic" | "hotel" | "shop";

interface FilterOption {
  type: FilterType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const FILTERS: FilterOption[] = [
  {
    type: "clinic",
    label: "Veterinerler",
    icon: "medical",
    color: "#3b82f6",
    bgColor: "#dbeafe",
  },
  {
    type: "shop",
    label: "Pet Shoplar",
    icon: "bag-handle",
    color: "#ee8c2b",
    bgColor: "#fed7aa",
  },
  {
    type: "hotel",
    label: "Oteller",
    icon: "bed",
    color: "#2a9d8f",
    bgColor: "#ccfbf1",
  },
  {
    type: "lost_pet",
    label: "Kayıp Hayvanlar",
    icon: "warning",
    color: "#ef4444",
    bgColor: "#fee2e2",
  },
  {
    type: "adoption",
    label: "Sahiplenme",
    icon: "heart",
    color: "#8b5cf6",
    bgColor: "#ede9fe",
  },
];

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Zustand store'dan kullanıcı konumunu al
  const { latitude, longitude, isLocationLoading } = useAppStore();

  // Filter states (default hepsi aktif)
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([
    "adoption",
    "lost_pet",
    "clinic",
    "hotel",
    "shop",
  ]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showListView, setShowListView] = useState(false);

  // Marker animasyon value'larını tut
  const markerAnimMap = useRef(new Map<string, Animated.Value>()).current;

  // Sadece 1 marker loop zıplasın diye: şu an loopta olan marker key'i ve loop anim'i
  const currentLoopKeyRef = useRef<string | null>(null);
  const currentLoopAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const getMarkerAnim = (key: string) => {
    let v = markerAnimMap.get(key);
    if (!v) {
      v = new Animated.Value(0);
      markerAnimMap.set(key, v);
    }
    return v;
  };

  // selectedItem'dan tekil key üret
  const selectedKey = selectedItem
    ? `${selectedItem.item_type}-${selectedItem.id}`
    : null;

  // Map region (SADECE initial region için kullanılıyor)
  const initialRegion = {
    latitude: latitude || 41.0082,
    longitude: longitude || 28.9784,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Types string oluştur (backend için)
  const typesString = activeFilters.join(",");

  // API'den veri çek
  const { data, isLoading, error } = useNearbyMapItems(
    latitude || 41.0082,
    longitude || 28.9784,
    50000, // 50km radius
    typesString
  );

  // Filter toggle
  const toggleFilter = (type: FilterType) => {
    if (activeFilters.includes(type)) {
      // En az 1 filter aktif kalmalı
      if (activeFilters.length > 1) {
        setActiveFilters(activeFilters.filter((f) => f !== type));
      }
    } else {
      setActiveFilters([...activeFilters, type]);
    }
  };

  // Marker'a tıklandığında
  const handleMarkerPress = (item: any) => {
    setSelectedItem(item);
    // Bottom card'ı göster (animate)
    Animated.spring(slideAnim, {
      toValue: SCREEN_HEIGHT - CARD_HEIGHT - 100,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  // Card'ı kapat
  const closeCard = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSelectedItem(null));
  };

  // Get marker color
  const getMarkerColor = (itemType: string) => {
    const filter = FILTERS.find((f) => f.type === itemType);
    return filter?.color || "#6b7280";
  };

  // Get marker icon
  const getMarkerIcon = (itemType: string) => {
    const filter = FILTERS.find((f) => f.type === itemType);
    return filter?.icon || "location";
  };

  // Tüm marker'ları topla
  const allMarkers = React.useMemo(() => {
    if (!data?.data) return [];

    const markers: any[] = [];

    // Adoptions
    if (activeFilters.includes("adoption") && data.data.adoptions) {
      data.data.adoptions.forEach((item: any) => {
        if (item.latitude && item.longitude) {
          markers.push({
            ...item,
            item_type: "adoption",
            markerType: "adoption",
          });
        }
      });
    }

    // Lost Pets
    if (activeFilters.includes("lost_pet") && data.data.lost_pets) {
      data.data.lost_pets.forEach((item: any) => {
        if (item.last_seen_latitude && item.last_seen_longitude) {
          markers.push({
            ...item,
            latitude: item.last_seen_latitude,
            longitude: item.last_seen_longitude,
            item_type: "lost_pet",
            markerType: "lost_pet",
          });
        }
      });
    }

    // Clinics
    if (activeFilters.includes("clinic") && data.data.clinics) {
      data.data.clinics.forEach((item: any) => {
        if (item.latitude && item.longitude) {
          markers.push({
            ...item,
            item_type: "clinic",
            markerType: "clinic",
          });
        }
      });
    }

    // Hotels
    if (activeFilters.includes("hotel") && data.data.hotels) {
      data.data.hotels.forEach((item: any) => {
        if (item.latitude && item.longitude) {
          markers.push({
            ...item,
            item_type: "hotel",
            markerType: "hotel",
          });
        }
      });
    }

    // Shops
    if (activeFilters.includes("shop") && data.data.shops) {
      data.data.shops.forEach((item: any) => {
        if (item.latitude && item.longitude) {
          markers.push({
            ...item,
            item_type: "shop",
            markerType: "shop",
          });
        }
      });
    }

    return markers;
  }, [data, activeFilters]);

  useEffect(() => {
    // Önce eski loop'u durdur
    if (currentLoopAnimRef.current) {
      currentLoopAnimRef.current.stop();
      currentLoopAnimRef.current = null;
    }

    // Eski marker anim value'yu sıfırla
    if (currentLoopKeyRef.current) {
      const prev = getMarkerAnim(currentLoopKeyRef.current);
      prev.stopAnimation();
      prev.setValue(0);
      currentLoopKeyRef.current = null;
    }

    // Seçili yoksa çık
    if (!selectedKey) return;

    // Yeni seçili marker için loop başlat
    const v = getMarkerAnim(selectedKey);
    v.setValue(0);

    const loop = Animated.loop(
      Animated.sequence([
        Animated.spring(v, {
          toValue: 1,
          useNativeDriver: true,
          speed: 14,
          bounciness: 14,
        }),
        Animated.spring(v, {
          toValue: 0,
          useNativeDriver: true,
          speed: 14,
          bounciness: 14,
        }),
        Animated.delay(250),
      ])
    );

    currentLoopKeyRef.current = selectedKey;
    currentLoopAnimRef.current = loop;

    loop.start();

    // cleanup (component unmount vs.)
    return () => {
      loop.stop();
    };
  }, [selectedKey]);

  useEffect(() => {
    allMarkers.forEach((item, idx) => {
      const key = `${item.item_type}-${item.id}`;
      const anim = getMarkerAnim(key);

      anim.stopAnimation();
      anim.setValue(0);

      Animated.sequence([
        Animated.delay(idx * 35),
        Animated.spring(anim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 18,
          bounciness: 12,
        }),
        Animated.spring(anim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 18,
          bounciness: 12,
        }),
      ]).start();
    });
  }, [allMarkers]);

  // Get item title
  const getItemTitle = (item: any) => {
    if (item.item_type === "adoption" || item.item_type === "lost_pet") {
      return item.pet_name || "Bilinmeyen Hayvan";
    }
    return (
      item.clinic_name ||
      item.hotel_name ||
      item.shop_name ||
      "Bilinmeyen Konum"
    );
  };

  // Get item subtitle
  const getItemSubtitle = (item: any) => {
    if (item.item_type === "adoption") {
      return `${item.breed || "Bilinmeyen cins"} • ${item.pet_type?.name_tr || ""}`;
    }
    if (item.item_type === "lost_pet") {
      return `Kayıp ${item.breed || "hayvan"} • ${item.pet_type?.name_tr || ""}`;
    }
    return item.address || "Adres belirtilmemiş";
  };

  // Navigate to detail page
  const handleNavigateDetail = () => {
    if (!selectedItem) return;

    closeCard();

    // Route'lara göre navigate et
    setTimeout(() => {
      if (selectedItem.item_type === "adoption") {
        router.push(`/adoptionpets/${selectedItem.id}`);
      } else if (selectedItem.item_type === "lost_pet") {
        router.push(`/lostpets/${selectedItem.id}`);
      } else if (selectedItem.item_type === "clinic") {
        router.push(`/clinics/${selectedItem.id}`);
      } else if (selectedItem.item_type === "hotel") {
        router.push(`/hotels/${selectedItem.id}`);
      } else if (selectedItem.item_type === "shop") {
        router.push(`/shops/${selectedItem.id}`);
      }
    }, 300);
  };

  // Yol tarifi al (Google Maps)
  const handleGetDirections = async () => {
    if (!selectedItem) return;

    const lat = selectedItem.latitude || selectedItem.last_seen_latitude;
    const lon = selectedItem.longitude || selectedItem.last_seen_longitude;

    if (lat && lon) {
      // Google Maps URL (mobil cihazlarda Google Maps app'i açılır)
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          console.log("Google Maps açılamadı");
        }
      } catch (error) {
        console.error("Yol tarifi hatası:", error);
      }
    }
  };

  // Resim URL'i oluştur (Home sayfasındaki sistem)
  const getImageUrl = (item: any) => {
    const baseUrl =
      process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

    if (item.item_type === "clinic" && item.logo_url) {
      return `${baseUrl}/home/images/clinic-logo/${item.logo_url}`;
    } else if (item.item_type === "shop" && item.logo_url) {
      return `${baseUrl}/home/images/shop-logo/${item.logo_url}`;
    } else if (item.item_type === "hotel" && item.logo_url) {
      return `${baseUrl}/home/images/hotel-logo/${item.logo_url}`;
    } else if (item.item_type === "adoption" && item.image_url) {
      return `${baseUrl}/adoptionpet/${item.image_url}`;
    } else if (item.item_type === "lost_pet" && item.image_url) {
      return `${baseUrl}/lostpet/image/${item.id}`;
    }

    return null;
  };

  // Kullanıcı konumuna git
  const handleGoToUserLocation = () => {
    if (latitude && longitude && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Map - FIX: initialRegion kullan, onRegionChangeComplete kaldır */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
        moveOnMarkerPress={false}
      >
        {/* Markers */}
        {allMarkers.map((item, index) => {
          const key = `${item.item_type}-${item.id}`;
          const anim = getMarkerAnim(key);

          const translateY = anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, -10, 0], // 10 birim yukarı zıplar ve yerine konar
          });

          const scale = anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 1.15, 1], // %15 büyüme yeterli, fazlası abartı durur
          });

          const isSelected = key === selectedKey;

          return (
            <Marker
              key={`${item.item_type}-${item.id}-${index}`}
              coordinate={{
                latitude: parseFloat(item.latitude),
                longitude: parseFloat(item.longitude),
              }}
              onPress={() => handleMarkerPress(item)}
              tracksViewChanges={isSelected} // <-- kritik: sadece seçili redraw
            >
              <View
                style={{
                  width: 150,
                  height: 90, // <-- BUNU büyütüyorsun
                  alignItems: "center",
                  justifyContent: "center", // marker aşağıda dursun
                }}
              >
                <Animated.View
                  className="items-center"
                  pointerEvents="auto"
                  style={{
                    transform: [
                      { translateY: isSelected ? translateY : 0 },
                      { scale: isSelected ? scale : 1 },
                    ],
                  }}
                >
                  {/* Senin mevcut marker içeriğin aynen */}
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: getMarkerColor(item.markerType),
                      borderWidth: 1,
                      borderColor: getMarkerColor(item.markerType),
                    }}
                  >
                    <Ionicons
                      name={getMarkerIcon(item.markerType)}
                      size={24}
                      color="white"
                    />
                  </View>

                  <View
                    className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] mt-[-2px]"
                    style={{ borderTopColor: getMarkerColor(item.markerType) }}
                  />

                  {item.item_type === "lost_pet" && (
                    <View className="absolute -bottom-6 bg-white px-2 py-0.5 rounded-md shadow-sm">
                      <Text className="text-[10px] font-bold text-red-500 uppercase">
                        Kayıp!
                      </Text>
                    </View>
                  )}
                </Animated.View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Top Overlay - Search & Filters - FIX: pointerEvents ekle */}
      <View
        className="absolute top-0 left-0 right-0 pt-14 px-4 pb-4"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
        pointerEvents="box-none"
      >
        {/* Filter Chips - FIX: nestedScrollEnabled ekle */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
          contentContainerStyle={{ gap: 8, paddingRight: 16, marginTop: 20 }}
          nestedScrollEnabled={true}
          pointerEvents="auto"
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilters.includes(filter.type);
            return (
              <TouchableOpacity
                key={filter.type}
                onPress={() => toggleFilter(filter.type)}
                className={`flex-row items-center gap-2 px-4 py-2 rounded-full shadow-sm ${
                  isActive ? "border-2" : "border bg-white"
                }`}
                style={{
                  backgroundColor: isActive ? filter.color : "white",
                  borderColor: isActive ? filter.color : "#e5e7eb",
                }}
              >
                <Ionicons
                  name={filter.icon}
                  size={18}
                  color={isActive ? "white" : filter.color}
                />
                <Text
                  className={`text-sm font-semibold ${
                    isActive ? "text-white" : ""
                  }`}
                  style={{ color: isActive ? "white" : filter.color }}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Loading Overlay */}
      {(isLoading || isLocationLoading) && (
        <View
          className="absolute inset-0 bg-black/20 items-center justify-center"
          pointerEvents="none"
        >
          <View className="bg-white rounded-2xl p-6 shadow-2xl">
            <ActivityIndicator size="large" color="#ee8c2b" />
            <Text className="text-gray-700 font-medium mt-3">
              Harita yükleniyor...
            </Text>
          </View>
        </View>
      )}

      {/* FAB Buttons */}
      <View
        className="absolute right-4 bottom-32 gap-3"
        pointerEvents="box-none"
      >
        <View pointerEvents="auto">
          <TouchableOpacity
            className="w-12 h-12 rounded-full bg-white shadow-lg items-center justify-center"
            onPress={handleGoToUserLocation}
          >
            <Ionicons name="locate" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Card - Selected Item */}
      {selectedItem && (
        <Animated.View
          className="absolute left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-5"
          style={{
            transform: [{ translateY: slideAnim }],
            height: CARD_HEIGHT,
          }}
          pointerEvents="auto"
        >
          {/* Drag Handle */}
          <View className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

          {/* Close Button */}
          <TouchableOpacity
            onPress={closeCard}
            className="absolute top-4 right-5 z-10 w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="close" size={20} color="#6b7280" />
          </TouchableOpacity>

          <View className="flex-row gap-4 mb-4">
            {/* Thumbnail */}
            <View className="w-24 h-24 rounded-2xl bg-gray-50 overflow-hidden shadow-sm border border-gray-100">
              {getImageUrl(selectedItem) ? (
                <Image
                  source={{ uri: getImageUrl(selectedItem)! }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center bg-gray-100">
                  <Ionicons
                    name={getMarkerIcon(selectedItem.markerType)}
                    size={36}
                    color="#d1d5db"
                  />
                </View>
              )}
            </View>

            {/* Details */}
            <View className="flex-1 justify-center">
              <Text
                className="text-lg font-black text-gray-900 mb-1"
                numberOfLines={1}
              >
                {getItemTitle(selectedItem)}
              </Text>

              <View className="flex-row items-center mb-1">
                <Ionicons name="location-sharp" size={12} color="#9ca3af" />
                <Text
                  className="text-xs text-gray-500 ml-1 flex-1"
                  numberOfLines={1}
                >
                  {getItemSubtitle(selectedItem)}
                </Text>
              </View>

              {selectedItem.distance && (
                <View className="flex-row items-center">
                  <Ionicons name="navigate" size={12} color="#f59e0b" />
                  <Text className="text-xs text-amber-600 font-semibold ml-1">
                    {(selectedItem.distance / 1000).toFixed(1)} km uzaklıkta
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            {/* Detayları Gör */}
            <TouchableOpacity
              className="flex-1 bg-[#ee8c2b] rounded-2xl py-3 px-4 flex-row items-center justify-center gap-2 shadow-md"
              onPress={handleNavigateDetail}
            >
              <Ionicons name="information-circle" size={20} color="white" />
              <Text className="text-white text-sm font-bold">
                Detayları Gör
              </Text>
            </TouchableOpacity>

            {/* Yol Tarifi Al */}
            <TouchableOpacity
              className="flex-1 bg-blue-500 rounded-2xl py-3 px-4 flex-row items-center justify-center gap-2 shadow-md"
              onPress={handleGetDirections}
            >
              <Ionicons name="navigate-circle" size={20} color="white" />
              <Text className="text-white text-sm font-bold">Yol Tarifi</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
