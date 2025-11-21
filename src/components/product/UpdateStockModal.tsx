import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../styles/theme/color";
import Toast from "react-native-toast-message";
import { useUpdateProductStock } from "../../hooks";

interface UpdateStockModalProps {
  visible: boolean;
  onClose: () => void;
  productId: string;
  currentStock: number;
  productName: string;
}

export default function UpdateStockModal({
  visible,
  onClose,
  productId,
  currentStock,
  productName,
}: UpdateStockModalProps) {
  const [stockValue, setStockValue] = useState<string>(currentStock.toString());
  const { mutate: updateStock, isPending } = useUpdateProductStock();

  const handleSubmit = () => {
    const newStock = parseInt(stockValue);

    if (isNaN(newStock) || newStock < 0) {
      Toast.show({
        type: "error",
        text1: "Geçersiz stok değeri!",
        text2: "Lütfen 0 veya daha büyük bir sayı girin",
        bottomOffset: 40,
      });
      return;
    }

    updateStock(
      { id: productId, stock_quantity: newStock },
      {
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: "Stok başarıyla güncellendi!",
            bottomOffset: 40,
          });
          onClose();
        },
        onError: (error: any) => {
          Toast.show({
            type: "error",
            text1:
              error?.response?.data?.message ||
              "Stok güncellenirken bir hata oluştu",
            bottomOffset: 40,
          });
        },
      }
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-2xl w-full max-w-md">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">
              Stok Güncelle
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="p-6">
            <Text className="text-base text-gray-700 mb-4">
              <Text className="font-semibold">{productName}</Text> ürününün stok
              miktarını güncelleyin
            </Text>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Yeni Stok Miktarı
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                placeholder="Stok miktarı girin"
                placeholderTextColor="#9CA3AF"
                value={stockValue}
                onChangeText={setStockValue}
                keyboardType="number-pad"
                autoFocus
              />
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                disabled={isPending}
              >
                <Text className="text-gray-700 font-semibold text-base">
                  İptal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                className={`flex-1 rounded-xl py-3 items-center ${
                  isPending ? "bg-gray-300" : "bg-primary"
                }`}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Tamam
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

