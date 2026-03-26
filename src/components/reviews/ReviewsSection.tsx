import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/styles/theme/color";
import { ReviewType } from "@/lib/api";
import { useReviews } from "@/hooks/useReviews";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { useAuthStore } from "@/stores";

interface ReviewsSectionProps {
  reviewType: ReviewType;
  targetId: string;
  targetName?: string;
}

/** Yıldız dağılım barı */
const RatingBar = ({ count, total }: { count: number; total: number }) => {
  const width = total > 0 ? (count / total) * 100 : 0;
  return (
    <View className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
      <View
        className="h-full rounded-full"
        style={{ width: `${width}%`, backgroundColor: "#F59E0B" }}
      />
    </View>
  );
};

/**
 * Tüm yorumlar bölümü — profil detay sayfalarında extraSections içine eklenir.
 * Kendi içinde paginasyon barındırır.
 */
export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviewType,
  targetId,
  targetName,
}) => {
  const [page, setPage] = useState(1);
  const [formVisible, setFormVisible] = useState(false);
  const { user } = useAuthStore();

  const { data, isLoading, isError, isFetching } = useReviews(
    reviewType,
    targetId,
    page,
  );

  const reviews = data?.reviews ?? [];
  const stats = data?.stats;
  const pagination = data?.pagination;

  return (
    <View className="w-full px-5 mb-6">
      {/* Kart başlığı */}
      <View
        className="bg-white rounded-[32px] p-6 border border-gray-100"
        style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8 }}
      >
        {/* Başlık + yorum yaz butonu */}
        <View className="flex-row items-center justify-between mb-4">
          <Text
            className="text-base font-bold"
            style={{ color: COLORS.text }}
          >
            Yorumlar
            {stats && stats.total > 0 && (
              <Text className="font-normal text-sm text-gray-500">
                {" "}({stats.total})
              </Text>
            )}
          </Text>

          {user && (
            <TouchableOpacity
              onPress={() => setFormVisible(true)}
              className="flex-row items-center gap-1 px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: COLORS.border }}
            >
              <Ionicons name="add" size={16} color={COLORS.primary} />
              <Text
                className="text-xs font-semibold"
                style={{ color: COLORS.primary }}
              >
                Yorum Yaz
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* İstatistikler */}
        {stats && stats.total > 0 && (
          <View className="flex-row items-center gap-4 mb-5 pb-5 border-b border-gray-100">
            {/* Büyük ortalama */}
            <View className="items-center">
              <Text
                className="text-4xl font-black"
                style={{ color: COLORS.primary }}
              >
                {stats.average.toFixed(1)}
              </Text>
              <View className="flex-row gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons
                    key={s}
                    name={
                      s <= Math.round(stats.average) ? "star" : "star-outline"
                    }
                    size={12}
                    color="#F59E0B"
                  />
                ))}
              </View>
              <Text className="text-xs text-gray-400 mt-0.5">
                {stats.total} yorum
              </Text>
            </View>

            {/* Dağılım barları */}
            <View className="flex-1 gap-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <View key={star} className="flex-row items-center gap-2">
                  <Text className="text-xs text-gray-400 w-3">{star}</Text>
                  <Ionicons name="star" size={10} color="#F59E0B" />
                  <RatingBar
                    count={stats.distribution[star] ?? 0}
                    total={stats.total}
                  />
                  <Text className="text-xs text-gray-400 w-4 text-right">
                    {stats.distribution[star] ?? 0}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Yorum listesi */}
        {isLoading && (
          <View className="py-8 items-center">
            <ActivityIndicator color={COLORS.primary} />
          </View>
        )}

        {isError && (
          <View className="py-6 items-center">
            <Text className="text-sm text-gray-400">
              Yorumlar yüklenemedi.
            </Text>
          </View>
        )}

        {!isLoading && !isError && reviews.length === 0 && (
          <View className="py-8 items-center gap-2">
            <Ionicons name="chatbubbles-outline" size={36} color="#D1D5DB" />
            <Text className="text-sm text-gray-400">
              Henüz yorum yapılmamış.
            </Text>
            {user && (
              <Text className="text-xs text-gray-400">
                İlk yorumu sen yaz!
              </Text>
            )}
          </View>
        )}

        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            reviewType={reviewType}
            targetId={targetId}
            currentUserId={user?.id}
          />
        ))}

        {/* Paginasyon */}
        {pagination && pagination.totalPages > 1 && (
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <TouchableOpacity
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="flex-row items-center gap-1 px-3 py-2 rounded-xl"
              style={{
                backgroundColor: page === 1 ? "#F3F4F6" : COLORS.border,
                opacity: page === 1 ? 0.5 : 1,
              }}
            >
              <Ionicons name="chevron-back" size={14} color={COLORS.primary} />
              <Text
                className="text-xs font-medium"
                style={{ color: COLORS.primary }}
              >
                Önceki
              </Text>
            </TouchableOpacity>

            <Text className="text-xs text-gray-400">
              {page} / {pagination.totalPages}
            </Text>

            <TouchableOpacity
              onPress={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page === pagination.totalPages || isFetching}
              className="flex-row items-center gap-1 px-3 py-2 rounded-xl"
              style={{
                backgroundColor:
                  page === pagination.totalPages ? "#F3F4F6" : COLORS.border,
                opacity: page === pagination.totalPages ? 0.5 : 1,
              }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: COLORS.primary }}
              >
                Sonraki
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Yorum formu modal */}
      <ReviewForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        reviewType={reviewType}
        targetId={targetId}
        targetName={targetName}
      />
    </View>
  );
};
