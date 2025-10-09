import { QueryClient } from "@tanstack/react-query";

// TanStack Query client - Global instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 dakika boyunca fresh kabul et
      gcTime: 1000 * 60 * 30, // 30 dakika garbage collection
      retry: 2, // Hata durumunda 2 kez tekrar dene
      refetchOnWindowFocus: true, // Ekrana dönüldüğünde yenile
      refetchOnReconnect: true, // İnternet bağlantısı yenilendiğinde yenile
    },
  },
});
