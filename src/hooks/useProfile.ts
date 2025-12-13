import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  profileApi,
  petApi,
  petShopApi,
  petSitterApi,
  petClinicApi,
} from "../lib/api";
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
 * Pet Shop profil oluşturma mutation hook'u
 */
export function useCreatePetShopProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: petShopApi.createProfile,
    onSuccess: () => {
      // Pet shop profilini cache'e invalidate et
      queryClient.invalidateQueries({ queryKey: ["petshop", "profile"] });
      console.log("✅ Pet shop profile created successfully");
    },
    onError: (error: any) => {
      console.error("❌ Pet shop profile creation failed:", error);
    },
  });
}

/**
 * Pet Shop profil getirme query hook'u
 */
export function usePetShopProfile() {
  return useQuery({
    queryKey: ["petshop", "profile"],
    queryFn: petShopApi.getProfile,
    retry: 1,
  });
}

/**
 * Pet Shop logo yükleme mutation hook'u
 */
export function useUploadPetShopLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageUri: string) => petShopApi.uploadLogo(imageUri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petshop", "profile"] });
      console.log("✅ Pet shop logo uploaded successfully");
    },
    onError: (error: any) => {
      console.error("❌ Pet shop logo upload failed:", error);
    },
  });
}

/**
 * Pet Shop logo silme mutation hook'u
 */
export function useDeletePetShopLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: petShopApi.deleteLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petshop", "profile"] });
      console.log("✅ Pet shop logo deleted successfully");
    },
    onError: (error: any) => {
      console.error("❌ Pet shop logo delete failed:", error);
    },
  });
}

/**
 * Pet Sitter profil oluşturma mutation hook'u
 */
export function useCreatePetSitterProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: petSitterApi.createProfile,
    onSuccess: () => {
      // Pet shop profilini cache'e invalidate et
      queryClient.invalidateQueries({ queryKey: ["petsitter", "profile"] });
      console.log("✅ Pet sitter profile created successfully");
    },
    onError: (error: any) => {
      console.error("❌ Pet sitter profile creation failed:", error);
    },
  });
}

/**
 * Pet Sitter profil getirme query hook'u
 */
export function usePetSitterProfile() {
  return useQuery({
    queryKey: ["petsitter", "profile"],
    queryFn: petSitterApi.getProfile,
    retry: 1,
  });
}

/**
 * Pet Sitter logo yükleme mutation hook'u
 */
export function useUploadPetSitterLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageUri: string) => petSitterApi.uploadLogo(imageUri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petsitter", "profile"] });
      console.log("✅ Pet sitter logo uploaded successfully");
    },
    onError: (error: any) => {
      console.error("❌ Pet sitter logo upload failed:", error);
    },
  });
}

/**
 * Pet Sitter logo silme mutation hook'u
 */
export function useDeletePetSitterLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: petSitterApi.deleteLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petsitter", "profile"] });
      console.log("✅ Pet sitter logo deleted successfully");
    },
    onError: (error: any) => {
      console.error("❌ Pet sitter logo delete failed:", error);
    },
  });
}

/**
 * Pet Clinic profil oluşturma mutation hook'u
 */
export function useCreatePetClinicProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: petClinicApi.createProfile,
    onSuccess: () => {
      // Pet clinic profilini cache'e invalidate et
      queryClient.invalidateQueries({ queryKey: ["petclinic", "profile"] });
      console.log("✅ Pet clinic profile created successfully");
    },
    onError: (error: any) => {
      console.error("❌ Pet clinic profile creation failed:", error);
    },
  });
}

/**
 * Pet Clinic profil getirme query hook'u
 */
export function usePetClinicProfile() {
  return useQuery({
    queryKey: ["petclinic", "profile"],
    queryFn: petClinicApi.getProfile,
    retry: 1,
  });
}

/**
 * Pet Clinic logo yükleme mutation hook'u
 */
export function useUploadPetClinicLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageUri: string) => petClinicApi.uploadLogo(imageUri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petclinic", "profile"] });
      console.log("✅ Pet clinic logo uploaded successfully");
    },
    onError: (error: any) => {
      console.error("❌ Pet clinic logo upload failed:", error);
    },
  });
}

/**
 * Pet Clinic logo silme mutation hook'u
 */
export function useDeletePetClinicLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: petClinicApi.deleteLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petclinic", "profile"] });
      console.log("✅ Pet clinic logo deleted successfully");
    },
    onError: (error: any) => {
      console.error("❌ Pet clinic logo delete failed:", error);
    },
  });
}
