import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

/**
 * Backend'den dönen user tipi
 */
export interface UserRole {
  id: string;
  user_id: string;
  role_type: 'pet_owner' | 'pet_shop' | 'pet_clinic' | 'pet_sitter' | 'pet_hotel';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata?: any;
  roles: UserRole[];
  profile: UserProfile | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Kullanıcının aktif rolünü al (approved olan ilk rol)
 */
export function getActiveRole(user: User | null | undefined): UserRole | null {
  if (!user || !user.roles || user.roles.length === 0) {
    return null;
  }
  
  // Approved olan ilk rolü bul
  const approvedRole = user.roles.find((role) => role.status === 'approved');
  return approvedRole || null;
}

/**
 * TanStack Query Hook: Mevcut kullanıcı bilgilerini çeker
 * 
 * @returns Query object with user data
 * 
 * Özellikler:
 * - AsyncStorage'dan initial data olarak yükler (hızlı başlangıç)
 * - Auth varsa backend'den güncel veriyi çeker
 * - Auth yoksa disabled olur
 * - 5 dakika boyunca fresh kabul eder
 */
export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: async (): Promise<User> => {
      const response = await authApi.getMe();
      return response.data.user as User;
    },
    // Auth varsa çalıştır, yoksa disabled
    enabled: isAuthenticated,
    // 5 dakika boyunca fresh kabul et
    staleTime: 1000 * 60 * 5,
    // Ekrana dönüldüğünde otomatik yenile
    refetchOnWindowFocus: true,
    // Mount olunca otomatik çek
    refetchOnMount: true,
  });
}

