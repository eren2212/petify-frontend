import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { petOtelApi } from "../lib/api";

/**
 * Pet Otel profil oluşturma mutation hook'u
 */
export function useCreatePetOtelProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: petOtelApi.createProfile,
    onSuccess: () => {
      // Pet shop profilini cache'e invalidate et
      queryClient.invalidateQueries({ queryKey: ["petotel", "profile"] });
      console.log("✅ Pet otel profile created successfully");
    },
    onError: (error: any) => {
      console.error("❌ Pet otel profile creation failed:", error);
    },
  });
}

/**
 * Pet Otel profil getirme query hook'u
 */
export function usePetOtelProfile() {
  return useQuery({
    queryKey: ["petotel", "profile"],
    queryFn: petOtelApi.getProfile,
    retry: (failureCount, error: any) => {
      // 404 (profil yok) veya 403 (rol yok) durumunda retry yapma
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      // Diğer hatalar için maksimum 2 kez retry yap
      return failureCount < 2;
    },
    // 404 hatası normal bir durum (profil henüz oluşturulmamış), error fırlatma
    throwOnError: false,
  });
}

/**
 * Pet Otel logo yükleme mutation hook'u
 */
export function useUploadPetOtelLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageUri: string) => petOtelApi.uploadLogo(imageUri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petotel", "profile"] });
      console.log("✅ Pet otel logo uploaded successfully");
    },
    onError: (error: any) => {
      console.error("❌ Pet otel logo upload failed:", error);
    },
  });
}

/**
 * Pet Otel logo silme mutation hook'u
 */
export function useDeletePetOtelLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: petOtelApi.deleteLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petotel", "profile"] });
      console.log("✅ Pet otel logo deleted successfully");
    },
    onError: (error: any) => {
      console.error("❌ Pet otel logo delete failed:", error);
    },
  });
}
