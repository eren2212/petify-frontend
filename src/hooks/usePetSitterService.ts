import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { petSitterServiceApi } from "../lib/api";

/**
 * Hizmet kategorilerini getir
 */
export function usePetSitterServiceCategories() {
  return useQuery({
    queryKey: ["petsitterservices", "categories"],
    queryFn: async () => {
      const response = await petSitterServiceApi.getCategories();
      return response.data.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 dakika (kategoriler nadiren değişir)
  });
}

/**
 * Pet sitter'ın hizmetlerini getir
 */
export function useMyPetSitterServices(
  page = 1,
  limit = 10,
  categoryId?: string,
  status?: boolean
) {
  return useQuery({
    queryKey: [
      "petsitterservices",
      "my-services",
      page,
      limit,
      categoryId,
      status,
    ],
    queryFn: async () => {
      const response = await petSitterServiceApi.getMyServices(
        page,
        limit,
        categoryId,
        status
      );

      return response.data;
    },
  });
}

/**
 * Yeni hizmet ekle
 */
export function useAddPetSitterService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceData: any) =>
      petSitterServiceApi.addService(serviceData),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({
        queryKey: ["petsitterservices", "my-services"],
      });
    },
  });
}

/**
 * Hizmet güncelle
 */
export function useUpdatePetSitterService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      petSitterServiceApi.updateService(id, data),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({ queryKey: ["petsitterservices"] });
    },
  });
}

/**
 * Hizmet durumu güncelle
 */
export function useUpdatePetSitterServiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      petSitterServiceApi.toggleServiceStatus(id, status),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({ queryKey: ["petsitterservices"] });
    },
  });
}

/**
 * Hizmet sil
 */
export function useDeletePetSitterService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => petSitterServiceApi.deleteService(id),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({
        queryKey: ["petsitterservices", "my-services"],
      });
    },
  });
}

/**
 * Hizmet detayını getir
 */
export function usePetSitterServiceDetail(id: string) {
  return useQuery({
    queryKey: ["petsitterservices", "detail", id],
    queryFn: async () => {
      const response = await petSitterServiceApi.getServiceById(id);
      return response.data.data || null;
    },
    enabled: !!id, // id varsa query çalışsın
  });
}


