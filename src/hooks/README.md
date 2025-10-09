# Hooks Klasörü

Bu klasörde **TanStack Query** ile server state yönetimi için custom hook'lar bulunur.

## Yapı

```
hooks/
  ├── README.md          # Bu dosya
  ├── useAuth.ts         # Auth işlemleri (login, logout, getMe)
  ├── useProfile.ts      # User profile CRUD işlemleri
  ├── useProducts.ts     # Products listing ve CRUD
  ├── useDoctors.ts      # Doctors listing ve CRUD
  ├── useMessages.ts     # Messages işlemleri
  └── ...                # Diğer server state hooks
```

## Kullanım Örneği

```typescript
// hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../lib/api";

export function useUserProfile() {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: userApi.getProfile,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
```

## Component'te Kullanım

```typescript
import { useUserProfile, useUpdateAvatar } from '../hooks/useProfile';

export default function ProfileScreen() {
  const { data: profile, isLoading } = useUserProfile();
  const { mutate: updateAvatar, isPending } = useUpdateAvatar();

  return (
    <View>
      <Image source={{ uri: profile?.avatar_url }} />
      <Button onPress={() => updateAvatar(file)} loading={isPending} />
    </View>
  );
}
```

## Notlar

- ✅ Server state (backend'den gelen data) = TanStack Query hooks
- ✅ Client state (UI state, preferences) = Zustand stores
- ✅ Query keys tutarlı olmalı: `['resource', 'action', ...params]`

