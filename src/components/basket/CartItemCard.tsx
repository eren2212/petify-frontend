import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Pressable,
  ColorValue,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { CartItem } from "@/types/type";

interface Props {
  item: CartItem;
  onRemove: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const CartItemCard: React.FC<Props> = ({
  item,
  onRemove,
  onIncrease,
  onDecrease,
}) => {
  const baseUrl =
    process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

  const imageUrl = useMemo(() => {
    if (!item.image) return null;
    return item.type === "product"
      ? `${baseUrl}/home/images/product/${item.image}`
      : `${baseUrl}/petsitterservices/category-icon/${item.image}`;
  }, [item.image, item.type, baseUrl]);

  const formatTL = (v: any) => {
    const n = Number(v);
    if (Number.isNaN(n)) return `${v} TL`;
    try {
      return new Intl.NumberFormat("tr-TR").format(n) + " TL";
    } catch {
      return `${n} TL`;
    }
  };

  const capFirst = (s?: string) =>
    s && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : "-";

  // Animations
  const enter = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const collapse = useRef(new Animated.Value(1)).current;

  const [measuredH, setMeasuredH] = useState<number>(0);
  const swipeRef = useRef<Swipeable>(null);

  const qtyScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (item.type !== "product") return;
    Animated.sequence([
      Animated.spring(qtyScale, {
        toValue: 1.08,
        useNativeDriver: true,
        damping: 16,
        stiffness: 240,
      }),
      Animated.spring(qtyScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 16,
        stiffness: 240,
      }),
    ]).start();
  }, [item.type, (item as any).quantity]);

  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1,
      useNativeDriver: true,
      damping: 14,
      stiffness: 170,
      mass: 0.9,
    }).start();
  }, [enter]);

  const onPressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.985,
      useNativeDriver: true,
      damping: 18,
      stiffness: 260,
      mass: 0.6,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 260,
      mass: 0.6,
    }).start();
  };

  const handleRemove = async () => {
    try {
      // await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    Animated.timing(collapse, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) onRemove();
    });
  };

  const containerStyle = {
    opacity: enter,
    transform: [
      {
        translateY: enter.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
      { scale: pressScale },
    ],
  };

  const heightStyle = measuredH
    ? {
        height: collapse.interpolate({
          inputRange: [0, 1],
          outputRange: [0, measuredH],
        }),
        marginTop: collapse.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 8],
        }),
        marginBottom: collapse.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 8],
        }),
        opacity: collapse.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      }
    : {};

  const accent =
    item.type === "product"
      ? ["#10B981", "#34D399"] // emerald
      : ["#6366F1", "#A78BFA"]; // indigo/purple

  const renderRightActions = (
    _progress: any,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-140, -60, 0],
      outputRange: [1, 0.96, 0.9],
      extrapolate: "clamp",
    });

    return (
      <View className="justify-center pr-4">
        <Animated.View style={{ transform: [{ scale }] }}>
          <Pressable
            onPress={() => {
              swipeRef.current?.close();
              handleRemove();
            }}
            className="w-16 h-16 rounded-2xl bg-red-500 items-center justify-center"
          >
            <Ionicons name="trash" size={20} color="white" />
            <Text className="text-white text-[10px] font-extrabold mt-1">
              Sil
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  return (
    <Animated.View
      style={[heightStyle]}
      className="mx-4 overflow-hidden"
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (!measuredH) setMeasuredH(h);
      }}
    >
      <Swipeable
        ref={swipeRef}
        renderRightActions={renderRightActions}
        rightThreshold={48}
        friction={2}
        onSwipeableOpen={() => {
          // full swipe -> direkt sil (premium)
          handleRemove();
        }}
      >
        <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
          <Animated.View
            style={containerStyle}
            className="bg-white rounded-2xl border-2 border-gray-100 shadow-xl overflow-hidden "
          >
            <View className="flex-row items-center p-4">
              {/* Image */}
              <View className="mr-3">
                {imageUrl ? (
                  <View className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden">
                    <Animated.Image
                      source={{ uri: imageUrl }}
                      resizeMode="cover"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </View>
                ) : (
                  <View className="w-16 h-16 rounded-2xl bg-gray-100 items-center justify-center">
                    <Text className="text-2xl">
                      {item.type === "service" ? "📅" : "📦"}
                    </Text>
                  </View>
                )}
              </View>

              {/* Content */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text
                    className="font-extrabold text-[15px] text-gray-900 pr-2"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </View>

                <View className="flex-row items-end justify-between mt-1">
                  <Text className="text-[16px] font-extrabold text-gray-900">
                    {formatTL(item.price)}
                  </Text>

                  {item.type === "product" ? (
                    <View className="flex-row items-center gap-2">
                      {/* - */}
                      <Pressable
                        hitSlop={8}
                        onPress={() => {
                          const q = (item as any).quantity ?? 1;

                          // Seçenek A kullanıyorsan:
                          // q === 1 ise animasyonlu silme yap (satırı kaldır)
                          if (q <= 1) {
                            swipeRef.current?.close();
                            handleRemove();
                            return;
                          }

                          onDecrease();
                        }}
                        className="w-9 h-9 rounded-2xl bg-gray-50 border border-gray-100 items-center justify-center"
                      >
                        <Ionicons name="remove" size={18} color="#111827" />
                      </Pressable>

                      {/* qty */}
                      <Animated.Text
                        style={{ transform: [{ scale: qtyScale }] }}
                        className="min-w-[24px] text-center text-[14px] font-extrabold text-gray-900"
                      >
                        {(item as any).quantity}
                      </Animated.Text>

                      {/* + */}
                      <Pressable
                        hitSlop={8}
                        onPress={onIncrease}
                        className="w-9 h-9 rounded-2xl bg-gray-900 items-center justify-center"
                      >
                        <Ionicons name="add" size={18} color="white" />
                      </Pressable>
                    </View>
                  ) : null}
                </View>

                {item.type !== "product" ? (
                  <View className="flex-row flex-wrap gap-2 mt-2">
                    <View className="px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
                      <Text className="text-[11px] text-gray-600 font-semibold">
                        {capFirst((item as any).priceType) === "daily"
                          ? "Günlük"
                          : "Saatlik"}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
};
