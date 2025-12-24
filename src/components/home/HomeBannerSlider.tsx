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

  // Loading state
  if (isLoading) {
    return (
      <View className="px-6 py-4">
        <View
          className="bg-gray-200 rounded-3xl items-center justify-center"
          style={{ height: BANNER_HEIGHT }}
        >
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      </View>
    );
  }

  // Error state veya banner yoksa
  if (isError || !banners || banners.length === 0) {
    console.log("❌ Banner error or empty:", { isError, banners });

    return (
      <View className="px-6 py-4">
        <Text>Banner bulunamadı</Text>
      </View>
    );
  }

  console.log("✅ Rendering", banners.length, "banners");

  return (
    <View className="py-4">
      {/* Slider */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
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
            activeOpacity={0.9}
            onPress={() => handleBannerPress(banner.target_url)}
            style={{
              width: BANNER_WIDTH,
              height: BANNER_HEIGHT,
              marginRight: index < banners.length - 1 ? 12 : 0,
            }}
          >
            <View className="w-full h-full rounded-3xl overflow-hidden bg-gray-100 shadow-md">
              {/* Banner Resmi */}
              <Image
                source={{ uri: getBannerImageUrl(banner.image_url) }}
                className="w-full h-full"
                resizeMode="cover"
              />

              {/* Overlay (opsiyonel - title/subtitle varsa) */}
              {(banner.title || banner.subtitle) && (
                <View className="absolute bottom-0 left-0 right-0 bg-black/40 p-4">
                  {banner.title && (
                    <Text className="text-white text-lg font-bold mb-1">
                      {banner.title}
                    </Text>
                  )}
                  {banner.subtitle && (
                    <Text className="text-white/90 text-sm">
                      {banner.subtitle}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <View className="flex-row items-center justify-center mt-4 gap-2">
          {banners.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full ${
                index === activeIndex ? "bg-primary-500 w-6" : "bg-gray-300 w-2"
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
};
