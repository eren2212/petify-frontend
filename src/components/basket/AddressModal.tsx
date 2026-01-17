import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (deliveryType: "delivery" | "pickup", address?: string) => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(
    "delivery",
  );
  const [address, setAddress] = useState("");

  const handleConfirm = () => {
    if (deliveryType === "delivery" && !address.trim()) {
      alert("Lütfen teslimat adresi girin");
      return;
    }
    onConfirm(deliveryType, deliveryType === "delivery" ? address : undefined);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-8">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-extrabold text-gray-900">
              Teslimat Bilgileri
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Delivery Type Selection */}
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              Teslimat Türü
            </Text>

            <View className="flex-row gap-3 mb-6">
              {/* Delivery Option */}
              <Pressable
                onPress={() => setDeliveryType("delivery")}
                className="flex-1"
              >
                <View
                  className={`p-4 rounded-2xl border-2 ${
                    deliveryType === "delivery"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <View className="items-center">
                    <Ionicons
                      name="bicycle"
                      size={32}
                      color={
                        deliveryType === "delivery" ? "#F97316" : "#9CA3AF"
                      }
                    />
                    <Text
                      className={`text-sm font-bold mt-2 ${
                        deliveryType === "delivery"
                          ? "text-orange-600"
                          : "text-gray-600"
                      }`}
                    >
                      Teslimat
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">+10 TL</Text>
                  </View>
                </View>
              </Pressable>

              {/* Pickup Option */}
              <Pressable
                onPress={() => setDeliveryType("pickup")}
                className="flex-1"
              >
                <View
                  className={`p-4 rounded-2xl border-2 ${
                    deliveryType === "pickup"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <View className="items-center">
                    <Ionicons
                      name="storefront"
                      size={32}
                      color={deliveryType === "pickup" ? "#F97316" : "#9CA3AF"}
                    />
                    <Text
                      className={`text-sm font-bold mt-2 ${
                        deliveryType === "pickup"
                          ? "text-orange-600"
                          : "text-gray-600"
                      }`}
                    >
                      Mağazadan Al
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">Ücretsiz</Text>
                  </View>
                </View>
              </Pressable>
            </View>

            {/* Address Input (only for delivery) */}
            {deliveryType === "delivery" && (
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-3">
                  Teslimat Adresi
                </Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Adres giriniz..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 text-sm"
                  style={{ minHeight: 100 }}
                />
              </View>
            )}

            {/* Info Box */}
            <View className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mt-6">
              <View className="flex-row items-start gap-3">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text className="flex-1 text-xs text-blue-700">
                  {deliveryType === "delivery"
                    ? "Siparişiniz belirttiğiniz adrese en kısa sürede teslim edilecektir."
                    : "Siparişinizi hazırlandıktan sonra mağazadan teslim alabilirsiniz."}
                </Text>
              </View>
            </View>

            {/* Confirm Button */}
            <Pressable onPress={handleConfirm} className="mt-6">
              <LinearGradient
                colors={["#F97316", "#FB7185"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 18,
                  paddingVertical: 16,
                  alignItems: "center",
                }}
              >
                <Text className="text-white font-extrabold text-base">
                  Siparişi Onayla
                </Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
