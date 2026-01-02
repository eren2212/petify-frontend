import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useBanners } from "@/hooks/useBanners";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH - 48; // px-6 (24*2)
const BANNER_HEIGHT = 180;

export const HomeBannerSlider = () => {
  const { data: banners, isLoading, isError } = useBanners();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Otomatik kayma için interval
  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % banners.length;

        // ScrollView'i programatik kaydır
        scrollViewRef.current?.scrollTo({
          x: nextIndex * (BANNER_WIDTH + 12),
          animated: true,
        });

        return nextIndex;
      });
    }, 5000); // 5 saniyede bir

    return () => clearInterval(interval);
  }, [banners]);

  // Banner URL'i oluştur
  const getBannerImageUrl = (filename: string) => {
    const baseUrl =
      process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
    return `${baseUrl}/home/images/banner/${filename}`;
  };

  // Banner'a tıklama
  const handleBannerPress = async (targetUrl: string | null) => {
    if (!targetUrl) return;

    try {
      const canOpen = await Linking.canOpenURL(targetUrl);
      if (canOpen) {
        await Linking.openURL(targetUrl);
      }
    } catch (error) {
      console.error("Link açılamadı:", error);
    }
  };

  // Scroll olayını dinle (manuel kayma için)
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (BANNER_WIDTH + 12));
    setActiveIndex(index);
  };

  // Loading state - Modern Skeleton Look
  if (isLoading) {
    return (
      <View className="px-6 py-4">
        <View
          className="bg-gray-100 rounded-[32px] items-center justify-center overflow-hidden w-full border border-gray-100"
          style={{ height: BANNER_HEIGHT }}
        >
          <View className="items-center">
            <ActivityIndicator size="small" color="#9333EA" />
            <Text className="text-gray-400 text-xs mt-2 font-medium">
              Yükleniyor...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Error state veya banner yoksa - Daha temiz empty state
  if (isError || !banners || banners.length === 0) {
    // Development'ta loglamak faydalı olabilir ama kullanıcı boş bir alan görmemeli
    console.log("❌ Banner error or empty:", { isError, banners });
    return null;
  }

  return (
    <View className="py-6">
      {/* Slider */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false} // pagingEnabled yerine snapToInterval kullanıyoruz
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH + 12} // Banner width + gap
        contentContainerStyle={{ paddingHorizontal: 24 }}
      >
        {banners.map((banner, index) => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.95}
            onPress={() => handleBannerPress(banner.target_url)}
            style={{
              width: BANNER_WIDTH,
              height: BANNER_HEIGHT,
              marginRight: index < banners.length - 1 ? 12 : 0,
            }}
          >
            <View className="w-full h-full rounded-[32px] overflow-hidden bg-white shadow-lg shadow-indigo-500/20 border border-gray-100 relative">
              {/* Banner Resmi */}
              <Image
                source={{ uri: getBannerImageUrl(banner.image_url) }}
                className="w-full h-full"
                resizeMode="cover"
              />

              {/* Gradient Overlay & Text Content */}
              {(banner.title || banner.subtitle) && (
                <View
                  className="absolute bottom-0 left-0 right-0 pt-6 pb-6 px-6 bg-transparent"
                  style={{
                    // React Native'de basit gradient efekti için
                    backgroundColor: "rgba(0,0,0,0.4)",
                  }}
                >
                  {banner.title && (
                    <Text className="text-white text-xl font-black mb-1 tracking-tight shadow-sm">
                      {banner.title}
                    </Text>
                  )}
                  {banner.subtitle && (
                    <Text className="text-white/90 text-sm font-medium leading-5">
                      {banner.subtitle}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modern Pagination Dots */}
      {banners.length > 1 && (
        <View className="flex-row items-center justify-center mt-5 gap-1.5">
          {banners.map((_, index) => (
            <View
              key={index}
              className={`rounded-full ${
                index === activeIndex
                  ? "bg-purple-600 h-2 w-8"
                  : "bg-gray-200 h-2 w-2"
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
};
