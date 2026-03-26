import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoritesApi, FavoriteType } from "../lib/api";

// ─── Tipler ───────────────────────────────────────────────────────────────────

export interface FavoriteDetail {
  id: string;
  _name: string;
  _image: string | null;
  _route_prefix: string;
  [key: string]: any;
}

export interface FavoriteItem {
  id: string;
  favorite_type: FavoriteType;
  target_id: string;
  created_at: string;
  detail: FavoriteDetail | null;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Kullanıcının favorilerini listele (opsiyonel tip filtresi ile)
 */
export const useMyFavorites = (favorite_type?: FavoriteType) => {
  return useQuery<FavoriteItem[]>({
    queryKey: ["favorites", favorite_type ?? "all"],
    queryFn: async () => {
      const response = await favoritesApi.getMyFavorites(favorite_type);
      // API: { code, data: { message, data: [...] } }
      return response.data?.data ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Belirli bir öğenin favori durumunu kontrol et
 */
export const useFavoriteStatus = (
  favorite_type: FavoriteType,
  target_id: string,
) => {
  return useQuery<boolean>({
    queryKey: ["favorite-status", favorite_type, target_id],
    queryFn: async () => {
      const response = await favoritesApi.checkStatus(favorite_type, target_id);
      return response.data?.is_favorited ?? false;
    },
    enabled: !!target_id && !!favorite_type,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Favori toggle mutasyonu (ekle/kaldır)
 * Optimistic update ile anlık UI güncellemesi yapar
 */
export const useToggleFavorite = (
  favorite_type: FavoriteType,
  target_id: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => favoritesApi.toggle(favorite_type, target_id),

    // Optimistic update — API cevabı beklenmeden UI'yı güncelle
    onMutate: async () => {
      const statusKey = ["favorite-status", favorite_type, target_id];
      await queryClient.cancelQueries({ queryKey: statusKey });

      const previousStatus = queryClient.getQueryData<boolean>(statusKey);
      queryClient.setQueryData<boolean>(statusKey, !previousStatus);

      return { previousStatus };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(
          ["favorite-status", favorite_type, target_id],
          context.previousStatus,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["favorite-status", favorite_type, target_id],
      });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};

/**
 * Bir öğenin toplam favori sayısını getir
 */
export const useFavoriteCount = (
  favorite_type: FavoriteType,
  target_id: string,
) => {
  return useQuery<number>({
    queryKey: ["favorite-count", favorite_type, target_id],
    queryFn: async () => {
      const response = await favoritesApi.getCount(favorite_type, target_id);
      return response.data?.count ?? 0;
    },
    enabled: !!target_id && !!favorite_type,
    staleTime: 1000 * 60 * 5,
  });
};
