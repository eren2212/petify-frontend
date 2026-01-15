import { useQuery } from "@tanstack/react-query";
import { mapApi } from "../lib/api";

/**
 * Haritadaki yakındaki tüm ilanları ve profilleri getir
 * @param latitude - Kullanıcının enlemi
 * @param longitude - Kullanıcının boylamı
 * @param radius - Arama yarıçapı (metre, default: 50000 = 50km)
 * @param types - Getir edilecek tipler (comma separated: "adoption,lost_pet,clinic,hotel,shop")
 */
export function useNearbyMapItems(
  latitude: number,
  longitude: number,
  radius: number = 50000,
  types: string = "adoption,lost_pet,clinic,hotel,shop"
) {
  return useQuery({
    queryKey: ["map", "nearby", latitude, longitude, radius, types],
    queryFn: async () => {
      const response = await mapApi.getNearbyItems(
        latitude,
        longitude,
        radius,
        types
      );
      // Backend response: { code: 200, data: { data: {...}, message: "...", total_count: X } }
      return response.data;
    },
    enabled: !!latitude && !!longitude, // latitude ve longitude varsa query çalışsın
    staleTime: 1000 * 60 * 2, // 2 dakika (harita için daha sık güncelleme)
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2; // Map için daha az retry
    },
  });
}
