import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../lib/api";

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
      // ✅ currentUser cache'ini invalidate et (yeni avatar_url için)
      queryClient.invalidateQueries({
        queryKey: ["auth", "currentUser"],
      });

      console.log("✅ Avatar uploaded successfully:", response.data.avatar_url);
    },

    onError: (error: any) => {
      console.error("❌ Avatar upload failed:", error);
    },
  });
}

