import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { petOtelServiceApi } from '../lib/api';

/**
 * Hizmet kategorilerini getir
 */
export function usePetOtelServiceCategories() {
  return useQuery({
    queryKey: ['petotelservices', 'categories'],
    queryFn: async () => {
      const response = await petOtelServiceApi.getCategories();
      return response.data.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 dakika (kategoriler nadiren değişir)
  });
}

/**
 * Pet otel'in hizmetlerini getir
 */
export function useMyPetOtelServices() {
  return useQuery({
    queryKey: ['petotelservices', 'my-services'],
    queryFn: async () => {
      const response = await petOtelServiceApi.getMyServices();
      return response.data;
    },
  });
}

/**
 * Yeni hizmet ekle
 */
export function useAddPetOtelService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category_id: string) =>
      petOtelServiceApi.addService(category_id),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({
        queryKey: ['petotelservices', 'my-services'],
      });
    },
  });
}

/**
 * Hizmet durumu güncelle
 */
export function useUpdatePetOtelServiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      petOtelServiceApi.toggleServiceStatus(id, status),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({ queryKey: ['petotelservices'] });
    },
  });
}

/**
 * Hizmet sil
 */
export function useDeletePetOtelService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => petOtelServiceApi.deleteService(id),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({
        queryKey: ['petotelservices', 'my-services'],
      });
    },
  });
}

/**
 * Hizmet detayını getir
 */
export function usePetOtelServiceDetail(id: string) {
  return useQuery({
    queryKey: ['petotelservices', 'detail', id],
    queryFn: async () => {
      const response = await petOtelServiceApi.getServiceById(id);
      return response.data.data || null;
    },
    enabled: !!id, // id varsa query çalışsın
  });
}

