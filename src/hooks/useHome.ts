import { homeApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export interface Clinic {
  id: string;
  clinic_name: string;
  description: string;
  address: string;
  logo_url: string | null;
  latitude: number;
  longitude: number;
  phone_number: string;
  working_hours: string;
  created_at: string;
}

export interface ClinicsResponse {
  message: string;
  data: Clinic[];
  total_count: number;
}

export const useClinicsForHome = () => {
  return useQuery<ClinicsResponse>({
    queryKey: ["clinics-home"],
    queryFn: async () => {
      const response = await homeApi.getClinicsForHome();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 dakika
  });
};
