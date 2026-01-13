import { homeApi } from "@/lib/api";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

// ==================== TYPES ====================

// Featured Products için
export interface FeaturedProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  is_featured: boolean;
  image_url: string | null;
}

export interface FeaturedProductsResponse {
  message: string;
  data: FeaturedProduct[];
}

// Pagination için
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedProductsResponse {
  message: string;
  data: FeaturedProduct[];
  pagination: PaginationMeta;
}

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

// Otel listesi için
export interface Hotel {
  id: string;
  hotel_name: string;
  description: string;
  address: string;
  logo_url: string | null;
  latitude: number;
  longitude: number;
  phone_number: string;
  working_hours: string;
  created_at: string;
}

export interface HotelsResponse {
  message: string;
  data: Hotel[];
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

// Shop ürünleri için
export interface ShopProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  weight_kg: number | null;
  age_group: string | null;
  low_stock_threshold: number | null;
  is_featured: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  product_categories: {
    id: string;
    name: string;
    name_tr: string;
  };
  pet_types: {
    id: string;
    name: string;
    name_tr: string;
  };
}

export interface ShopProductsResponse {
  message: string;
  data: ShopProduct[];
  total: number;
}

// Sitter detayı için
export interface SitterDetail {
  id: string;
  display_name: string;
  bio: string | null;
  experience_years: number | null;
  logo_url: string | null;
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

export interface Sitter {
  id: string;
  display_name: string;
  bio: string | null;
  logo_url: string | null;
  phone_number: string;
  experience_years: number | null;
}

export interface SittersResponse {
  message: string;
  data: Sitter[];
  total_count: number;
}

export interface PetShop {
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

export interface PetShopsResponse {
  message: string;
  data: PetShop[];
  total_count: number;
}

// ==================== HOOKS ====================

/**
 * Ana sayfa için rastgele öne çıkan ürünler
 */
export const useFeaturedProducts = () => {
  return useQuery<FeaturedProductsResponse>({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const response = await homeApi.getFeaturedProducts();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 dakika
  });
};

/**
 * Tüm ürünler - Infinite scroll için
 */
export const useAllProducts = () => {
  return useInfiniteQuery<PaginatedProductsResponse>({
    queryKey: ["all-products"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await homeApi.getAllProducts(pageParam as number, 10);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 2, // 2 dakika
  });
};

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
 * Ana sayfa için otel listesi
 */
export const useHotelsForHome = () => {
  return useQuery<HotelsResponse>({
    queryKey: ["hotels-home"],
    queryFn: async () => {
      const response = await homeApi.getHotelsForHome();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 dakika
  });
};

/**
 * Ana sayfa için bakıcı listesi
 */
export const useSittersForHome = () => {
  return useQuery<SittersResponse>({
    queryKey: ["sitters-home"],
    queryFn: async () => {
      const response = await homeApi.getSittersForHome();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 dakika
  });
};

/**
 * Ana sayfa için pet shop listesi
 */
export const usePetShopsForHome = () => {
  return useQuery<PetShopsResponse>({
    queryKey: ["pet-shops-home"],
    queryFn: async () => {
      const response = await homeApi.getPetShopsForHome();
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
 * Shop ürünlerini getir
 */
export const useShopProducts = (shopId: string) => {
  return useQuery<ShopProductsResponse>({
    queryKey: ["shop-products", shopId],
    queryFn: async () => {
      const response = await homeApi.getShopProducts(shopId);
      return response.data;
    },
    enabled: !!shopId,
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

// ==================== HOTEL SERVICES ====================
/**
 * Otel hizmeti tipi
 */
export interface HotelService {
  id: string;
  hotel_profile_id: string;
  service_category_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  pet_hotel_service_categories: {
    id: string;
    name: string;
    name_tr: string;
    icon_url: string | null;
    description: string | null;
  };
}

export interface HotelServicesResponse {
  message: string;
  data: HotelService[];
  total: number;
}

/**
 * Otel hizmetlerini getir
 */
export const useHotelServices = (hotelId: string) => {
  return useQuery<HotelServicesResponse>({
    queryKey: ["hotel-services", hotelId],
    queryFn: async () => {
      const response = await homeApi.getHotelServices(hotelId);
      return response.data;
    },
    enabled: !!hotelId,
    staleTime: 1000 * 60 * 5,
  });
};

// ==================== SITTER SERVICES ====================
/**
 * Sitter hizmeti tipi
 */
export interface SitterService {
  id: string;
  pet_sitter_profile_id: string;
  service_category_id: string;
  price: number | null;
  price_type: "daily" | "hourly" | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  pet_sitter_service_categories: {
    id: string;
    name: string;
    name_tr: string;
    icon_url: string | null;
    description: string | null;
  };
}

export interface SitterServicesResponse {
  message: string;
  data: SitterService[];
  total: number;
}

/**
 * Sitter hizmetlerini getir
 */
export const useSitterServices = (sitterId: string) => {
  return useQuery<SitterServicesResponse>({
    queryKey: ["sitter-services", sitterId],
    queryFn: async () => {
      const response = await homeApi.getSitterServices(sitterId);
      return response.data;
    },
    enabled: !!sitterId,
    staleTime: 1000 * 60 * 5,
  });
};
