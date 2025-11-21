import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../lib/api";

/**
 * Ürün kategorilerini getir
 */
export function useProductCategories() {
  return useQuery({
    queryKey: ["products", "categories"],
    queryFn: async () => {
      const response = await productApi.getCategories();
      return response.data.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 dakika (kategoriler nadiren değişir)
  });
}

/**
 * Pet shop'un ürünlerini getir
 */
export function useMyProducts(
  page = 1,
  limit = 10,
  categoryId?: string,
  status?: boolean
) {
  return useQuery({
    queryKey: ["products", "my-products", page, limit, categoryId, status],
    queryFn: async () => {
      const response = await productApi.getMyProducts(
        page,
        limit,
        categoryId,
        status
      );
      return response.data;
    },
  });
}

/**
 * Yeni ürün ekle
 */
export function useAddProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: any) => productApi.addProduct(productData),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({ queryKey: ["products", "my-products"] });
    },
  });
}

/**
 * Ürün güncelle
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productApi.updateProduct(id, data),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * Ürün stok güncelle
 */
export function useUpdateProductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      stock_quantity,
    }: {
      id: string;
      stock_quantity: number;
    }) => productApi.updateProductStock(id, stock_quantity),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * Ürün durumu güncelle (aktif/pasif)
 */
export function useUpdateProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      productApi.updateProductStatus(id, status),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * Ürün sil
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => {
      // Cache'i yenile
      queryClient.invalidateQueries({ queryKey: ["products", "my-products"] });
    },
  });
}

/**
 * Tüm ürünleri getir
 */
export function useAllProducts(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["products", "all", page, limit],
    queryFn: async () => {
      const response = await productApi.getAllProducts(page, limit);
      return response.data;
    },
  });
}

/**
 * Kategoriye göre ürünleri getir
 */
export function useProductsByCategory(
  categoryName: string,
  page = 1,
  limit = 10
) {
  return useQuery({
    queryKey: ["products", "category", categoryName, page, limit],
    queryFn: async () => {
      const response = await productApi.getProductsByCategory(
        categoryName,
        page,
        limit
      );
      return response.data;
    },
    enabled: !!categoryName,
  });
}

/**
 * Ürün detayını getir
 */
export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ["products", "detail", id],
    queryFn: async () => {
      const response = await productApi.getProductById(id);
      return response.data.product;
    },
    enabled: !!id,
  });
}
