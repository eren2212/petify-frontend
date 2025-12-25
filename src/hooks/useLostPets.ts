import { useQuery } from "@tanstack/react-query";
import { homeApi } from "@/lib/api";

export interface LostPet {
  id: string;
  pet_name: string;
  pet_type_id: string;
  gender: string;
  breed: string | null;
  description: string | null;
  last_seen_location: string;
  lost_date: string;
  last_seen_latitude: number | null;
  last_seen_longitude: number | null;
  status: string;
  reward_amount: number | null;
  created_at: string;
  image_url: string | null;
  pet_type: {
    id: string;
    name: string;
    name_tr: string;
  };
}

export interface LostPetsResponse {
  message: string;
  data: LostPet[];
  total_count: number;
}

/**
 * Ana sayfa için kayıp hayvan ilanlarını getiren hook
 */
export const useLostPetsForHome = () => {
  return useQuery<LostPetsResponse>({
    queryKey: ["lost-pets-home"],
    queryFn: async () => {
      const response = await homeApi.getLostPets();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 dakika
  });
};
