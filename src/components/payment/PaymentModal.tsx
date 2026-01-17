import React from "react";
import { Modal, View, Text, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

interface PaymentModalProps {
  visible: boolean;
  paymentUrl: string | null;
  onClose: () => void;
  onPaymentComplete: (success: boolean) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  paymentUrl,
  onClose,
  onPaymentComplete,
}) => {
  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;

    console.log("🔗 WebView URL:", url);

    // SADECE /payments/result URL'ini kontrol et
    // /payments/callback henüz redirect olmadan geldiği için success parametresi yok
    if (url.includes("/payments/result")) {
      // URL'den success parametresi al
      const urlParams = url.split("?")[1] || "";
      const isSuccess = urlParams.includes("success=true");

      console.log("💳 Payment Result Detected:", { url, isSuccess });
      onPaymentComplete(isSuccess);
    }
  };

  if (!paymentUrl) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-orange-500 pt-12 pb-4 px-4 flex-row items-center justify-between">
          <Text className="text-white text-lg font-bold">Güvenli Ödeme</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
        </View>

        {/* WebView */}
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState
          renderLoading={() => (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#F97316" />
              <Text className="text-gray-600 mt-4">
                Ödeme sayfası yükleniyor...
              </Text>
            </View>
          )}
        />
      </View>
    </Modal>
  );
};
