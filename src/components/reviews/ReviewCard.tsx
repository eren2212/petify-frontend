import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/styles/theme/color";
import {
  Review,
  useReplyToReview,
  useDeleteReview,
  useDeleteReply,
  useReportReview,
} from "@/hooks/useReviews";
import { ReviewType } from "@/lib/api";
import { useAuthStore } from "@/stores";

interface ReviewCardProps {
  review: Review;
  reviewType: ReviewType;
  targetId: string;
  currentUserId?: string;
}

const StarRow = ({ rating }: { rating: number }) => (
  <View className="flex-row gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= rating ? "star" : "star-outline"}
        size={14}
        color={star <= rating ? "#F59E0B" : "#D1D5DB"}
      />
    ))}
  </View>
);

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  reviewType,
  targetId,
  currentUserId,
}) => {
  const [replyVisible, setReplyVisible] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { user } = useAuthStore();

  const { mutate: deleteReview, isPending: deletingReview } = useDeleteReview(
    reviewType,
    targetId,
  );
  const { mutate: replyToReview, isPending: sendingReply } = useReplyToReview(
    reviewType,
    targetId,
  );
  const { mutate: deleteReply, isPending: deletingReply } = useDeleteReply(
    reviewType,
    targetId,
  );
  const { mutate: reportReview, isPending: reporting } = useReportReview();

  const isOwnReview = review.reviewer_user_id === currentUserId;
  const authorName = review.user_profiles?.full_name ?? "Kullanıcı";
  const formattedDate = new Date(review.created_at).toLocaleDateString(
    "tr-TR",
    { day: "numeric", month: "long", year: "numeric" },
  );

  const handleDelete = () => {
    Alert.alert("Yorumu Sil", "Bu yorumu silmek istediğinizden emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => deleteReview(review.id),
      },
    ]);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    replyToReview(
      { reviewId: review.id, reply_text: replyText, role_type: user?.role_type },
      {
        onSuccess: () => {
          setReplyText("");
          setReplyVisible(false);
          Alert.alert("Cevabınız alındı", "Onaylandıktan sonra görünecektir.");
        },
        onError: (err: any) => {
          Alert.alert(
            "Hata",
            err?.response?.data?.message || "Cevap gönderilemedi.",
          );
        },
      },
    );
  };

  const handleReport = () => {
    Alert.alert("Yorumu Şikayet Et", "Bu yorumu neden şikayet ediyorsunuz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Spam",
        onPress: () =>
          reportReview(
            { reviewId: review.id, reason: "spam" },
            {
              onSuccess: () => Alert.alert("Teşekkürler", "Şikayetiniz alındı."),
              onError: (err: any) =>
                Alert.alert(
                  "Hata",
                  err?.response?.data?.message || "İşlem başarısız.",
                ),
            },
          ),
      },
      {
        text: "Uygunsuz İçerik",
        onPress: () =>
          reportReview(
            { reviewId: review.id, reason: "inappropriate" },
            {
              onSuccess: () => Alert.alert("Teşekkürler", "Şikayetiniz alındı."),
              onError: (err: any) =>
                Alert.alert(
                  "Hata",
                  err?.response?.data?.message || "İşlem başarısız.",
                ),
            },
          ),
      },
      {
        text: "Sahte Yorum",
        onPress: () =>
          reportReview(
            { reviewId: review.id, reason: "fake" },
            {
              onSuccess: () => Alert.alert("Teşekkürler", "Şikayetiniz alındı."),
              onError: (err: any) =>
                Alert.alert(
                  "Hata",
                  err?.response?.data?.message || "İşlem başarısız.",
                ),
            },
          ),
      },
    ]);
  };

  return (
    <View
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4 }}
    >
      {/* Üst satır: avatar placeholder + isim + tarih + aksiyon */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center gap-2 flex-1">
          {/* Avatar placeholder */}
          <View
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: COLORS.border }}
          >
            <Text
              className="font-bold text-sm"
              style={{ color: COLORS.primary }}
            >
              {authorName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View className="flex-1">
            <Text
              className="font-semibold text-sm"
              style={{ color: COLORS.text }}
            >
              {authorName}
            </Text>
            <Text className="text-xs text-gray-400">{formattedDate}</Text>
          </View>
        </View>

        {/* Aksiyon butonları */}
        <View className="flex-row items-center gap-2">
          {isOwnReview ? (
            <TouchableOpacity onPress={handleDelete} disabled={deletingReview}>
              {deletingReview ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleReport} disabled={reporting}>
              <Ionicons name="flag-outline" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Yıldız puanı */}
      <StarRow rating={review.rating} />

      {/* Yorum metni */}
      <Text
        className="mt-2 text-sm leading-5"
        style={{ color: COLORS.text }}
      >
        {review.comment}
      </Text>

      {/* Cevaplar */}
      {review.review_replies && review.review_replies.length > 0 && (
        <View className="mt-3 pl-3 border-l-2" style={{ borderColor: COLORS.border }}>
          {review.review_replies
            .filter((r) => r.status === "approved")
            .map((reply) => {
              const replierName =
                reply.user_roles?.user_profiles?.full_name ?? "Yanıt";
              const roleType = reply.user_roles?.role_type;
              const roleLabel =
                roleType === "pet_shop"
                  ? "Pet Shop"
                  : roleType === "pet_hotel"
                    ? "Pet Otel"
                    : roleType === "pet_sitter"
                      ? "Bakıcı"
                      : roleType === "pet_clinic"
                        ? "Klinik"
                        : "Kullanıcı";

              return (
                <View key={reply.id} className="mb-2">
                  <View className="flex-row items-center gap-1 mb-0.5">
                    <Text
                      className="font-semibold text-xs"
                      style={{ color: COLORS.primary }}
                    >
                      {replierName}
                    </Text>
                    <View
                      className="px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: COLORS.border }}
                    >
                      <Text
                        className="text-[10px]"
                        style={{ color: COLORS.primary }}
                      >
                        {roleLabel}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-gray-600">{reply.reply_text}</Text>
                </View>
              );
            })}
        </View>
      )}

      {/* Cevap ver butonu */}
      {!isOwnReview && (
        <TouchableOpacity
          className="mt-3 flex-row items-center gap-1"
          onPress={() => setReplyVisible((v) => !v)}
        >
          <Ionicons
            name="chatbubble-outline"
            size={14}
            color={COLORS.primary}
          />
          <Text className="text-xs" style={{ color: COLORS.primary }}>
            {replyVisible ? "Vazgeç" : "Cevap Ver"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Cevap input alanı */}
      {replyVisible && (
        <View className="mt-2 flex-row items-center gap-2">
          <TextInput
            className="flex-1 border rounded-xl px-3 py-2 text-sm"
            style={{ borderColor: COLORS.border, color: COLORS.text }}
            placeholder="Cevabınızı yazın..."
            placeholderTextColor="#9CA3AF"
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity
            onPress={handleSendReply}
            disabled={sendingReply || !replyText.trim()}
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: COLORS.primary, opacity: replyText.trim() ? 1 : 0.5 }}
          >
            {sendingReply ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={14} color="white" />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
