import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { petClinicDoctorsApi } from "../lib/api";

/**
 * Doktorları getir (gender filtresi ile)
 */
export function useMyDoctors(gender?: "male" | "female") {
  return useQuery({
    queryKey: ["petClinicDoctors", "my-list", gender],
    queryFn: async () => {
      const response = await petClinicDoctorsApi.getMyDoctors(gender);
      // Backend response: { data: { data: [...], message: "...", total: ... } }
      return response.data?.data || [];
    },
  });
}

/**
 * Doktor detayını getir
 */
export function useDoctorDetail(id: string) {
  return useQuery({
    queryKey: ["petClinicDoctors", "detail", id],
    queryFn: async () => {
      const response = await petClinicDoctorsApi.getDoctorDetail(id);
      // Backend response: { data: { data: {...}, message: "..." } }
      return response.data?.data;
    },
    enabled: !!id,
  });
}

/**
 * Yeni doktor ekle
 */
export function useAddDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (doctorData: any) => petClinicDoctorsApi.addDoctor(doctorData),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({
        queryKey: ["petClinicDoctors", "my-list"],
      });
    },
  });
}

/**
 * Doktor güncelle
 */
export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      petClinicDoctorsApi.updateDoctor(id, data),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({
        queryKey: ["petClinicDoctors", "my-list"],
      });
    },
  });
}

/**
 * Doktor sil
 */
export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => petClinicDoctorsApi.deleteDoctor(id),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({
        queryKey: ["petClinicDoctors", "my-list"],
      });
    },
  });
}
