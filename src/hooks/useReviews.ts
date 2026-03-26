import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi, ReviewType, ReportReason } from "../lib/api";

// ─── Tipler ───────────────────────────────────────────────────────────────────

export interface ReviewReply {
  id: string;
  reply_text: string;
  created_at: string;
  status: string;
  user_roles?: {
    role_type: string;
    user_profiles?: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_user_id: string;
  user_profiles?: {
    full_name: string;
    avatar_url?: string;
  };
  review_replies?: ReviewReply[];
}

export interface ReviewStats {
  total: number;
  average: number;
  distribution: Record<number, number>;
}

export interface ReviewsResponse {
  reviews: Review[];
  stats: ReviewStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Birden fazla hedef için toplu puan istatistiği getirir.
 * Home kartlarında N+1 sorgu yapmadan rating göstermek için kullanılır.
 */
export const useEntityRatings = (reviewType: ReviewType, ids: string[]) => {
  const stableKey = [...ids].sort().join(",");
  return useQuery<Record<string, { average: number; total: number }>>({
    queryKey: ["entity-ratings", reviewType, stableKey],
    queryFn: async () => {
      const response = await reviewsApi.getBulkRatings(reviewType, ids);
      return response.data ?? {};
    },
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 5, // 5 dakika cache
  });
};

/**
 * Belirli bir hedefe ait yorumları getirir.
 * @param reviewType - Yorum tipi (pet_shop, pet_hotel, vs.)
 * @param targetId   - Hedefin ID'si (profil ID)
 * @param page       - Sayfa numarası
 */
export const useReviews = (
  reviewType: ReviewType,
  targetId: string,
  page = 1,
) => {
  return useQuery<ReviewsResponse>({
    queryKey: ["reviews", reviewType, targetId, page],
    queryFn: async () => {
      const response = await reviewsApi.getReviews(
        reviewType,
        targetId,
        page,
        10,
      );
      return response.data;
    },
    enabled: !!targetId && !!reviewType,
    staleTime: 1000 * 60 * 2, // 2 dakika cache
  });
};

/**
 * Yorum oluşturma mutasyonu
 */
export const useCreateReview = (reviewType: ReviewType, targetId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { rating: number; comment: string }) =>
      reviewsApi.createReview({
        review_type: reviewType,
        target_id: targetId,
        ...payload,
      }),
    onSuccess: () => {
      // Cache'i temizle — liste yenilensin
      queryClient.invalidateQueries({
        queryKey: ["reviews", reviewType, targetId],
      });
    },
  });
};

/**
 * Yorum silme mutasyonu
 */
export const useDeleteReview = (reviewType: ReviewType, targetId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewsApi.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", reviewType, targetId],
      });
    },
  });
};

/**
 * Yoruma cevap verme mutasyonu
 */
export const useReplyToReview = (reviewType: ReviewType, targetId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      reply_text,
      role_type,
    }: {
      reviewId: string;
      reply_text: string;
      role_type?: string;
    }) => reviewsApi.replyToReview(reviewId, reply_text, role_type),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", reviewType, targetId],
      });
    },
  });
};

/**
 * Cevap silme mutasyonu
 */
export const useDeleteReply = (reviewType: ReviewType, targetId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      replyId,
    }: {
      reviewId: string;
      replyId: string;
    }) => reviewsApi.deleteReply(reviewId, replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", reviewType, targetId],
      });
    },
  });
};

/**
 * Yorum şikayet etme mutasyonu
 */
export const useReportReview = () => {
  return useMutation({
    mutationFn: ({
      reviewId,
      reason,
      description,
    }: {
      reviewId: string;
      reason: ReportReason;
      description?: string;
    }) => reviewsApi.reportReview(reviewId, reason, description),
  });
};
