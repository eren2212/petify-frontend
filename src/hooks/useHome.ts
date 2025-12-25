import { homeApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

// ==================== TYPES ====================

// Klinik listesi için
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

// Klinik detayı için
export interface ClinicDetail {
  id: string;
  clinic_name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  phone_number: string;
  emergency_phone: string | null;
  email: string | null;
  website_url: string | null;
  instagram_url: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  working_hours: Array<{ day: string; hours: string }> | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicDetailResponse {
  message: string;
  data: ClinicDetail;
}

// Otel detayı için
export interface HotelDetail {
  id: string;
  hotel_name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  phone_number: string;
  emergency_phone: string | null;
  email: string | null;
  website_url: string | null;
  instagram_url: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  capacity: number | null;
  check_in_time: string | null;
  check_out_time: string | null;
  working_hours: Array<{ day: string; hours: string }> | null;
  average_rating: number | null;
  total_reviews: number | null;
  created_at: string;
  updated_at: string;
}

export interface HotelDetailResponse {
  message: string;
  data: HotelDetail;
}

// Shop detayı için
export interface ShopDetail {
  id: string;
  shop_name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  phone_number: string;
  email: string | null;
  website_url: string | null;
  instagram_url: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  working_hours: Array<{ day: string; hours: string }> | null;
  created_at: string;
  updated_at: string;
}

export interface ShopDetailResponse {
  message: string;
  data: ShopDetail;
}

// Sitter detayı için
export interface SitterDetail {
  id: string;
  display_name: string;
  bio: string | null;
  experience_years: number | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  phone_number: string;
  instagram_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface SitterDetailResponse {
  message: string;
  data: SitterDetail;
}

// ==================== HOOKS ====================

/**
 * Ana sayfa için klinik listesi
 */
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

/**
 * Klinik detayı getir
 */
export const useClinicDetail = (id: string) => {
  return useQuery<ClinicDetailResponse>({
    queryKey: ["clinic-detail", id],
    queryFn: async () => {
      const response = await homeApi.getClinicDetail(id);
      return response.data;
    },
    enabled: !!id, // ID varsa sorguyu çalıştır
    staleTime: 1000 * 60 * 5, // 5 dakika
  });
};

/**
 * Otel detayı getir
 */
export const useHotelDetail = (id: string) => {
  return useQuery<HotelDetailResponse>({
    queryKey: ["hotel-detail", id],
    queryFn: async () => {
      const response = await homeApi.getHotelDetail(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Shop detayı getir
 */
export const useShopDetail = (id: string) => {
  return useQuery<ShopDetailResponse>({
    queryKey: ["shop-detail", id],
    queryFn: async () => {
      const response = await homeApi.getShopDetail(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Sitter detayı getir
 */
export const useSitterDetail = (id: string) => {
  return useQuery<SitterDetailResponse>({
    queryKey: ["sitter-detail", id],
    queryFn: async () => {
      const response = await homeApi.getSitterDetail(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
