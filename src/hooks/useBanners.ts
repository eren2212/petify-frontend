import { useQuery } from "@tanstack/react-query";
import { bannerApi } from "@/lib/api";

// Banner tipi
export type Banner = {
  id: string;
  banner_type: string;
  title: string;
  subtitle: string | null; // ← description değil, subtitle!
  image_url: string;
  target_type: string;
  target_id: string | null;
  target_url: string | null; // ← link_url değil, target_url!
  display_order: number;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

// Banner'ları getir
export const useBanners = () => {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      console.log("🔄 Fetching banners...");
      const response = await bannerApi.getBanners();

      return response.data.data as Banner[];
    },
    staleTime: 1000 * 60 * 5, // 5 dakika fresh
  });
};
