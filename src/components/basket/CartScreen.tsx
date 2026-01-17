import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, FlatList, Pressable, Alert, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useCurrentCart } from "@/hooks/useCurrentCart";
import { CartItemCard } from "@/components/basket/CartItemCard";
import { AddressModal } from "@/components/basket/AddressModal";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { orderApi, paymentApi } from "@/lib/api";
import { Linking } from "react-native";

const CartScreen = () => {
  const {
    cart,
    removeFromCart,
    clearCart,
    getTotalPrice,
    addQuantity,
    removeQuantity,
    activeUserId,
  } = useCurrentCart();

  const total = useMemo(() => getTotalPrice(), [cart, getTotalPrice]);

  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const totalScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.spring(totalScale, {
        toValue: 1.04,
        useNativeDriver: true,
        damping: 16,
        stiffness: 220,
      }),
      Animated.spring(totalScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 16,
        stiffness: 220,
      }),
    ]).start();
  }, [total, totalScale]);

  const formatTL = (v: any) => {
    const n = Number(v);
    if (Number.isNaN(n)) return `${v} TL`;
    try {
      return new Intl.NumberFormat("tr-TR").format(n) + " TL";
    } catch {
      return `${n} TL`;
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert("Sepet Boş", "Lütfen önce sepete bir şeyler ekleyin.");
      return;
    }
    // Adres modal aç
    setAddressModalVisible(true);
  };

  const askClearCart = () => {
    Alert.alert(
      "Sepet temizlensin mi?",
      "Tüm ürün/hizmetler sepetten kaldırılacak.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Temizle",
          style: "destructive",
          onPress: async () => {
            try {
              // await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {}
            clearCart();
          },
        },
      ],
    );
  };

  const handleOrderConfirm = async (
    deliveryType: "delivery" | "pickup",
    address?: string,
  ) => {
    if (!activeUserId) {
      Alert.alert("Hata", "Kullanıcı bilgisi bulunamadı");
      return;
    }

    setAddressModalVisible(false);
    setIsCreatingOrder(true);

    try {
      // Sepetteki ürünleri API formatına çevir (sadece product tipindekiler)
      const cartItems = cart
        .filter((item) => item.type === "product")
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }));

      if (cartItems.length === 0) {
        Alert.alert("Hata", "Sepette sipariş verebileceğiniz ürün yok");
        return;
      }

      // Sipariş oluştur
      const response = await orderApi.createOrder(
        activeUserId,
        cartItems,
        deliveryType,
        address,
      );

      console.log("📦 Order Response:", response);
      console.log("📦 Order Data:", response?.data);

      // Backend response format: { code: 201, data: { orderIds, orders, ... } }
      const orderData = response?.data?.data;

      if (orderData?.orderIds && orderData.orderIds.length > 0) {
        console.log("🔵 Starting payment for orders:", orderData.orderIds);

        // Ödeme başlat
        const paymentResponse = await paymentApi.initializePayment(
          activeUserId,
          orderData.orderIds,
        );

        console.log("💳 Payment Response:", paymentResponse);

        // paymentPageUrl kullan - bu iyzico'nun hazır ödeme sayfası URL'i
        if (paymentResponse?.paymentPageUrl) {
          console.log(
            "✅ Payment URL received:",
            paymentResponse.paymentPageUrl,
          );

          setPaymentUrl(paymentResponse.paymentPageUrl);
          setPaymentModalVisible(true);
        } else {
          console.error("❌ No paymentPageUrl in response:", paymentResponse);
          Alert.alert(
            "Hata",
            paymentResponse?.error || "Ödeme sayfası oluşturulamadı",
          );
        }
      } else {
        Alert.alert("Hata", "Sipariş ID'leri alınamadı");
      }
    } catch (error: any) {
      console.error("Order creation error:", error);
      Alert.alert(
        "Hata",
        error.response?.data?.error || "Sipariş oluşturulurken bir hata oluştu",
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentComplete = (success: boolean) => {
    setPaymentModalVisible(false);
    setPaymentUrl(null);

    if (success) {
      // Başarılı ödeme - sepeti temizle
      clearCart();
    } else {
      // Başarısız ödeme
      console.log("Ödeme başarısız");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Premium Header */}
      <View className="px-5 pt-4 pb-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-extrabold text-gray-900">Sepet</Text>
            <Text className="text-sm text-gray-500 mt-1">
              {cart.length > 0
                ? `${cart.length} ürün/hizmet ekli`
                : "Henüz bir şey yok"}
            </Text>
          </View>

          {cart.length > 0 && (
            <Pressable onPress={askClearCart} hitSlop={10}>
              <View className="flex-row items-center gap-2 px-3 py-2 rounded-full bg-red-50 border border-red-100">
                <Ionicons name="trash" size={16} color="#DC2626" />
                <Text className="text-red-600 font-extrabold text-[12px]">
                  Temizle
                </Text>
              </View>
            </Pressable>
          )}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={cart}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CartItemCard
            item={item}
            onRemove={() => removeFromCart(item.id, item.type)}
            onIncrease={() => addQuantity(item.id, item.type)}
            onDecrease={() => removeQuantity(item.id, item.type)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-24 px-6">
            <View className="w-16 h-16 rounded-2xl bg-white border border-gray-100 items-center justify-center shadow-sm">
              <Text className="text-3xl">🛒</Text>
            </View>
            <Text className="text-xl font-extrabold text-gray-900 mt-4">
              Sepetin boş
            </Text>
            <Text className="text-sm text-gray-500 mt-2 text-center">
              Bir ürün veya hizmet ekleyince burada görünecek.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 150, paddingTop: 8 }}
      />

      {/* Premium Footer */}
      {cart.length > 0 && (
        <View className="absolute bottom-0 w-full px-5 pb-5 pt-4 bg-white border-t border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-[12px] text-gray-500">Toplam</Text>
              <Animated.Text
                style={{ transform: [{ scale: totalScale }] }}
                className="text-2xl font-extrabold text-gray-900 mt-1"
              >
                {formatTL(total)}
              </Animated.Text>
            </View>

            <View className="px-3 py-2 rounded-2xl bg-gray-50 border border-gray-100">
              <Text className="text-[11px] text-gray-600 font-semibold">
                Güvenli ödeme • Hızlı işlem
              </Text>
            </View>
          </View>

          <Pressable onPress={handleCheckout}>
            <LinearGradient
              colors={["#F97316", "#FB7185"]} // orange -> pink premium
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 18,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text className="text-white font-extrabold text-[16px]">
                ÖDEMEYE GEÇ
              </Text>
              <Text className="text-white/90 text-[11px] mt-1">
                Sepeti Onayla • Siparişi Tamamla
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {/* Address Modal */}
      <AddressModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onConfirm={handleOrderConfirm}
      />

      {/* Payment Modal */}
      <PaymentModal
        visible={paymentModalVisible}
        paymentUrl={paymentUrl}
        onClose={() => {
          setPaymentModalVisible(false);
          setPaymentUrl(null);
        }}
        onPaymentComplete={handlePaymentComplete}
      />
    </SafeAreaView>
  );
};

export default CartScreen;
