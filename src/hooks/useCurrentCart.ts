import { useCartStore } from "../stores/useCartStore";

export const useCurrentCart = () => {
  // HATALI OLAN KISIM BURASIYDI:
  // const activeUserId = useAuthStore((state) => state.session?.user?.id);

  // DOĞRU OLAN: ID'yi direkt olarak CartStore'dan alıyoruz.
  // Çünkü AuthProvider zaten buraya set ediyor.
  const activeUserId = useCartStore((state) => state.activeUserId);

  const carts = useCartStore((state) => state.carts);

  // Store fonksiyonları
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const addQuantity = useCartStore((state) => state.addQuantity);
  const removeQuantity = useCartStore((state) => state.removeQuantity);
  // Eğer kullanıcı ID'si varsa onun sepetini, yoksa boş dizi döndür
  const currentCart =
    activeUserId && carts[activeUserId] ? carts[activeUserId] : [];

  const getTotalPrice = () => {
    return currentCart.reduce((total, item) => {
      if (item.type === "product") {
        return total + item.price * item.quantity;
      }
      return total + item.price;
    }, 0);
  };

  return {
    cart: currentCart,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalPrice,
    addQuantity,
    removeQuantity,
    activeUserId,
  };
};
