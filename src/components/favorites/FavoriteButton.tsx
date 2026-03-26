import React from "react";
import { TouchableOpacity, ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FavoriteType } from "@/lib/api";
import { useFavoriteStatus, useToggleFavorite } from "@/hooks/useFavorites";

interface FavoriteButtonProps {
  favoriteType: FavoriteType;
  targetId: string;
  size?: number;
  containerClassName?: string;
}

/**
 * Herhangi bir detay sayfasında kullanılabilecek favori toggle butonu.
 * Optimistic update ile anlık UI güncellemesi sağlar.
 */
export function FavoriteButton({
  favoriteType,
  targetId,
  size = 24,
  containerClassName,
}: FavoriteButtonProps) {
  const { data: isFavorited = false, isLoading: statusLoading } =
    useFavoriteStatus(favoriteType, targetId);

  const { mutate: toggle, isPending } = useToggleFavorite(
    favoriteType,
    targetId,
  );

  const isLoading = statusLoading || isPending;

  return (
    <TouchableOpacity
      onPress={() => toggle()}
      disabled={isLoading}
      activeOpacity={0.7}
      className={
        containerClassName ||
        "w-11 h-11 rounded-full bg-white items-center justify-center shadow-sm border border-gray-100"
      }
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#EF4444" />
      ) : (
        <Ionicons
          name={isFavorited ? "heart" : "heart-outline"}
          size={size}
          color={isFavorited ? "#EF4444" : "#9CA3AF"}
        />
      )}
    </TouchableOpacity>
  );
}
