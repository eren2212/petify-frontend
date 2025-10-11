import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi, petApi } from "../lib/api";

/**
 * Avatar yükleme mutation hook'u
 *
 * @returns Mutation object
 *
 * Kullanım:
 * const { mutate: uploadAvatar, isPending } = useUploadAvatar();
 * uploadAvatar(imageUri);
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageUri: string) => profileApi.uploadAvatar(imageUri),

    onSuccess: (response) => {
      // Backend'den gelen yeni avatar URL'ini al
      const newAvatarUrl = response.data.avatar_url;

      // Cache'i DOĞRUDAN güncelle (anında yansıma için)
      queryClient.setQueryData(["auth", "currentUser"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          profile: {
            ...oldData.profile,
            avatar_url: newAvatarUrl,
          },
        };
      });

      // Ek güvence için invalidate et
      queryClient.invalidateQueries({
        queryKey: ["auth", "currentUser"],
      });

      console.log("✅ Avatar uploaded successfully:", newAvatarUrl);
    },

    onError: (error: any) => {
      console.error("❌ Avatar upload failed:", error);
    },
  });
}

// hooks/useProfile.ts'e ekle
export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.deleteAvatar,
    onSuccess: () => {
      // Cache'i DOĞRUDAN güncelle
      queryClient.setQueryData(["auth", "currentUser"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          profile: {
            ...oldData.profile,
            avatar_url: null,
          },
        };
      });

      queryClient.invalidateQueries({ queryKey: ["auth", "currentUser"] });
    },
    onError: (error: any) => {
      console.error("❌ Avatar delete failed:", error);
    },
  });
}

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
