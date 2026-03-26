import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/styles/theme/color";
import { ReviewType } from "@/lib/api";
import { useCreateReview } from "@/hooks/useReviews";

interface ReviewFormProps {
  visible: boolean;
  onClose: () => void;
  reviewType: ReviewType;
  targetId: string;
  targetName?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  visible,
  onClose,
  reviewType,
  targetId,
  targetName,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { mutate: createReview, isPending } = useCreateReview(
    reviewType,
    targetId,
  );

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert("Puan gerekli", "Lütfen bir puan seçin.");
      return;
    }
    if (comment.trim().length < 5) {
      Alert.alert("Yorum çok kısa", "Lütfen en az 5 karakter yazın.");
      return;
    }

    createReview(
      { rating, comment: comment.trim() },
      {
        onSuccess: () => {
          Alert.alert(
            "Yorumunuz Alındı",
            "Onaylandıktan sonra yayınlanacaktır.",
          );
          setRating(0);
          setComment("");
          onClose();
        },
        onError: (err: any) => {
          Alert.alert(
            "Hata",
            err?.response?.data?.message || "Yorum gönderilemedi.",
          );
        },
      },
    );
  };

  const handleClose = () => {
    if (!isPending) {
      setRating(0);
      setComment("");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={handleClose}
        />

        <View
          className="rounded-t-3xl px-6 pt-4 pb-8"
          style={{ backgroundColor: COLORS.background }}
        >
          {/* Handle bar */}
          <View className="w-10 h-1 rounded-full bg-gray-300 self-center mb-4" />

          {/* Başlık */}
          <View className="flex-row items-center justify-between mb-5">
            <Text
              className="text-lg font-bold"
              style={{ color: COLORS.text }}
            >
              {targetName ? `${targetName} için Yorum` : "Yorum Yaz"}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Yıldız seçici */}
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: COLORS.text }}
          >
            Puanınız
          </Text>
          <View className="flex-row gap-2 mb-5">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={36}
                  color={star <= rating ? "#F59E0B" : "#D1D5DB"}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Yorum metin alanı */}
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: COLORS.text }}
          >
            Yorumunuz
          </Text>
          <TextInput
            className="border rounded-2xl px-4 py-3 text-sm min-h-[100px]"
            style={{
              borderColor: COLORS.border,
              color: COLORS.text,
              backgroundColor: COLORS.white,
              textAlignVertical: "top",
            }}
            placeholder="Deneyiminizi paylaşın..."
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
          />
          <Text className="text-xs text-gray-400 text-right mt-1">
            {comment.length}/500
          </Text>

          {/* Gönder butonu */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            className="mt-4 py-4 rounded-2xl items-center"
            style={{
              backgroundColor: COLORS.primary,
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                Yorumu Gönder
              </Text>
            )}
          </TouchableOpacity>

          <Text className="text-xs text-gray-400 text-center mt-3">
            Yorumunuz, onaylandıktan sonra yayınlanacaktır.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
