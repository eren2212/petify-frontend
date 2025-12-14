import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { petClinicServiceApi } from "../lib/api";

/**
 * Hizmet kategorilerini getir
 */
export function usePetClinicServiceCategories() {
  return useQuery({
    queryKey: ["petclinicservices", "categories"],
    queryFn: async () => {
      const response = await petClinicServiceApi.getCategories();
      return response.data.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 dakika (kategoriler nadiren değişir)
  });
}

/**
 * Pet clinic'in hizmetlerini getir
 */
export function useMyPetClinicServices() {
  return useQuery({
    queryKey: ["petclinicservices", "my-services"],
    queryFn: async () => {
      const response = await petClinicServiceApi.getMyServices();
      return response.data;
    },
  });
}

/**
 * Yeni hizmet ekle
 */
export function useAddPetClinicService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category_id: string) =>
      petClinicServiceApi.addService(category_id),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({
        queryKey: ["petclinicservices", "my-services"],
      });
    },
  });
}

/**
 * Hizmet durumu güncelle
 */
export function useUpdatePetClinicServiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      petClinicServiceApi.toggleServiceStatus(id, status),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({ queryKey: ["petclinicservices"] });
    },
  });
}

/**
 * Hizmet sil
 */
export function useDeletePetClinicService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => petClinicServiceApi.deleteService(id),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({
        queryKey: ["petclinicservices", "my-services"],
      });
    },
  });
}

/**
 * Hizmet detayını getir
 */
export function usePetClinicServiceDetail(id: string) {
  return useQuery({
    queryKey: ["petclinicservices", "detail", id],
    queryFn: async () => {
      const response = await petClinicServiceApi.getServiceById(id);
      return response.data.data || null;
    },
    enabled: !!id, // id varsa query çalışsın
  });
}
