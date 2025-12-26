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

// ==================== CLINIC DOCTORS ====================

/**
 * Doktor tipi
 */
export interface ClinicDoctor {
  id: string;
  clinic_profile_id: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female";
  specialization: string;
  experience_years: number;
  bio: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicDoctorsResponse {
  message: string;
  data: ClinicDoctor[];
  total: number;
}

/**
 * Kliniğin doktorlarını getir
 */
export const useClinicDoctors = (clinicId: string) => {
  return useQuery<ClinicDoctorsResponse>({
    queryKey: ["clinic-doctors", clinicId],
    queryFn: async () => {
      const response = await homeApi.getClinicDoctors(clinicId);
      return response.data;
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5,
  });
};

export interface DoctorDetailResponse {
  message: string;
  data: DoctorDetail;
}

export interface DoctorDetail {
  id: string;
  clinic_profile_id: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female";
  specialization: string;
  experience_years: number;
  bio: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Doktor detayını getir (Public - herkes görebilir)
 */
export const useDoctorDetail = (
  clinicId: string,
  doctorId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery<DoctorDetailResponse>({
    queryKey: ["doctor-detail-public", clinicId, doctorId],
    queryFn: async () => {
      const response = await homeApi.getDoctorDetail(clinicId, doctorId);
      return response.data;
    },
    enabled:
      options?.enabled !== undefined
        ? options.enabled
        : !!clinicId && !!doctorId,
    staleTime: 1000 * 60 * 5,
  });
};

// ==================== CLINIC SERVICES ====================

/**
 * Klinik hizmeti tipi
 */
export interface ClinicService {
  id: string;
  clinic_profile_id: string;
  service_category_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  clinic_service_categories: {
    id: string;
    name: string;
    name_tr: string;
    icon_url: string | null;
    description: string | null;
  };
}

export interface ClinicServicesResponse {
  message: string;
  data: ClinicService[];
  total: number;
}

/**
 * Kliniğin hizmetlerini getir
 */
export const useClinicServices = (clinicId: string) => {
  return useQuery<ClinicServicesResponse>({
    queryKey: ["clinic-services", clinicId],
    queryFn: async () => {
      const response = await homeApi.getClinicServices(clinicId);
      return response.data;
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5,
  });
};
