import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi, petApi } from "../lib/api";

/**
 * Pet türlerini getir
 */
export function usePetTypes() {
  return useQuery({
    queryKey: ["pets", "types"],
    queryFn: async () => {
      const response = await petApi.getPetTypes();
      return response.data.pet_types || [];
    },
    staleTime: 1000 * 60 * 30, // 30 dakika (pet types nadiren değişir)
  });
}

/**
 * Kullanıcının hayvanlarını getir
 */
export function useMyPets() {
  return useQuery({
    queryKey: ["pets", "myPets"],
    queryFn: async () => {
      const response = await petApi.getMyPets();
      return response.data.pets || [];
    },
    staleTime: 1000 * 60 * 5, // 5 dakika
    // 401 hatası için retry yapma (token geçersiz)
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Yeni hayvan ekleme
 */
export function useAddPet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: petApi.addPet,
    onSuccess: () => {
      // Pet listesini yenile
      queryClient.invalidateQueries({ queryKey: ["pets", "myPets"] });
      console.log("✅ Pet added successfully");
    },
    onError: (error: any) => {
      console.error("❌ Pet add failed:", error);
    },
  });
}

/**
 * Hayvan detayını getir
 */
export function usePetDetail(petId: string) {
  return useQuery({
    queryKey: ["pets", "detail", petId],
    queryFn: async () => {
      const response = await petApi.getPetDetail(petId);
      return response.data.pet;
    },
    enabled: !!petId, // petId varsa query çalışsın
    staleTime: 1000 * 60 * 5, // 5 dakika
    // 401 hatası için retry yapma (token geçersiz)
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Pet resimlerini getir
 */
export function usePetImages(petId: string) {
  return useQuery({
    queryKey: ["pets", "images", petId],
    queryFn: async () => {
      const response = await petApi.getPetImages(petId);
      return response.data.images || [];
    },
    enabled: !!petId, // petId varsa query çalışsın
    staleTime: 1000 * 60 * 5, // 5 dakika
    // 401 hatası için retry yapma (token geçersiz)
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hayvan bilgilerini güncelle
 */
export function useUpdatePet(petId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (petData: any) => petApi.updatePet(petData, petId),
    onSuccess: (response) => {
      // Pet detayını güncelle
      queryClient.setQueryData(["pets", "detail", petId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          ...response.data.pet,
        };
      });

      // Pet listesini yenile
      queryClient.invalidateQueries({ queryKey: ["pets", "myPets"] });
      queryClient.invalidateQueries({ queryKey: ["pets", "detail", petId] });

      console.log("✅ Pet updated successfully");
    },
    onError: (error: any) => {
      console.error("❌ Pet update failed:", error);
    },
  });
}

/**
 * Pet resmini sil
 */
export function useDeletePetImage(petId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => petApi.deletePetImage(imageId),
    onSuccess: () => {
      // Pet detayını ve resimlerini yenile
      queryClient.invalidateQueries({ queryKey: ["pets", "detail", petId] });
      queryClient.invalidateQueries({ queryKey: ["pets", "images", petId] });
      queryClient.invalidateQueries({ queryKey: ["pets", "myPets"] });
      console.log("✅ Pet image deleted successfully");
    },
    onError: (error: any) => {
      console.error("❌ Pet image delete failed:", error);
    },
  });
}

/**
 * Aşı bilgisi ekleme
 */
export function useAddVaccination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: petApi.addVaccination,
    onSuccess: () => {
      // Pet listesini yenile
      queryClient.invalidateQueries({ queryKey: ["pets", "myPets"] });
      // Aşılar listesini yenile (tüm petId'ler için)
      queryClient.invalidateQueries({ queryKey: ["pets", "vaccination"] });
      console.log("✅ Pet Vaccination added successfully");
    },
    onError: (error: any) => {
      console.error("❌ Pet Vaccination add failed:", error);
    },
  });
}

/**
 * Pet aşı bilgilerini getir
 */
export function usePetVaccination(petId: string) {
  return useQuery({
    queryKey: ["pets", "vaccination", petId],
    queryFn: async () => {
      const response = await petApi.getVaccination(petId);
      return response.data.vaccinations || [];
    },
    enabled: !!petId, // petId varsa query çalışsın
    staleTime: 1000 * 60 * 5, // 5 dakika
    // 401 hatası için retry yapma (token geçersiz)
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Tek bir aşının detayını getir
 */
export function useVaccinationDetail(vaccinationId: string) {
  return useQuery({
    queryKey: ["vaccination", "detail", vaccinationId],
    queryFn: async () => {
      const response = await petApi.getVaccinationDetail(vaccinationId);
      return response.data.vaccination;
    },
    enabled: !!vaccinationId, // vaccinationId varsa query çalışsın
    staleTime: 1000 * 60 * 5, // 5 dakika
    // 401 hatası için retry yapma (token geçersiz)
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Kayıp hayvan ilanı ekleme
 */
export function useAddLostPet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: petApi.addLostPet,
    onSuccess: () => {
      // Lost pet listings listesini yenile
      queryClient.invalidateQueries({ queryKey: ["lostPets", "nearby"] });
      console.log("✅ Lost pet listing added successfully");
    },
    onError: (error: any) => {
      console.error("❌ Lost pet listing add failed:", error);
    },
  });
}

/**
 * Yakındaki kayıp hayvanları getir
 */
export function useNearbyLostPets(latitude: number, longitude: number) {
  return useQuery({
    queryKey: ["lostPets", "nearby", latitude, longitude],
    queryFn: async () => {
      const response = await petApi.getNearbyLostPets(latitude, longitude);
      // Backend response: { code: 200, data: { data: [...], message: "...", total_count: 2 } }
      // İçteki data array'ini döndür
      return response.data?.data || [];
    },
    enabled: !!latitude && !!longitude, // latitude ve longitude varsa query çalışsın
    staleTime: 1000 * 60 * 5, // 5 dakika
    // 401 hatası için retry yapma (token geçersiz)
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Kayıp hayvan ilanı detayını getir
 */
export function useLostPetDetail(lostPetId: string) {
  return useQuery({
    queryKey: ["lostPets", "detail", lostPetId],
    queryFn: async () => {
      const response = await petApi.getLostPetDetail(lostPetId);
      // Backend response.data.listing döndürüyor
      return response.data.listing;
    },
    enabled: !!lostPetId, // lostPetId varsa query çalışsın
    staleTime: 1000 * 60 * 5, // 5 dakika
    // 401 hatası için retry yapma (token geçersiz)
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useLostPetImages(lostPetId: string) {
  return useQuery({
    queryKey: ["lostPets", "images", lostPetId],
    queryFn: async () => {
      const response = await petApi.getLostPetImages(lostPetId);
      return response.data.images || [];
    },
    enabled: !!lostPetId, // lostPetId varsa query çalışsın
    staleTime: 1000 * 60 * 5, // 5 dakika
    // 401 hatası için retry yapma (token geçersiz)
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
