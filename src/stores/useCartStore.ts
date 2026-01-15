import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CartItem, ItemType, ProductItem } from "@/types/type";

interface CartState {
  carts: Record<string, CartItem[]>;
  activeUserId: string | null; // BU ALAN ŞART

  setActiveUser: (id: string | null) => void; // BU FONKSİYON ŞART
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string, itemType: ItemType) => void;
  clearCart: () => void;
  addQuantity: (itemId: string, itemType: ItemType) => void;
  removeQuantity: (itemId: string, itemType: ItemType) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: {},
      activeUserId: null, // Başlangıç değeri

      // AuthProvider bunu çağırarak ID'yi buraya yazar
      setActiveUser: (id) => set({ activeUserId: id }),

      addToCart: (item) => {
        const { carts, activeUserId } = get();
        // ID yoksa işlem yapma (veya log bas)
        if (!activeUserId) {
          console.log(
            "Sepet Hatası: Kullanıcı ID'si bulunamadı (Store içinde)"
          );
          return;
        }

        const userCart = carts[activeUserId] || [];
        const updatedCart = [...userCart];

        // ... Ekleme mantığı aynı ...
        if (item.type === "product") {
          const existingIndex = updatedCart.findIndex(
            (c) => c.id === item.id && c.type === "product"
          );
          if (existingIndex !== -1) {
            (updatedCart[existingIndex] as ProductItem).quantity +=
              item.quantity;
          } else {
            updatedCart.push(item);
          }
        } else {
          updatedCart.push(item);
        }

        set({
          carts: { ...carts, [activeUserId]: updatedCart },
        });
      },

      removeFromCart: (itemId, itemType) => {
        const { carts, activeUserId } = get();
        if (!activeUserId) return;

        const userCart = carts[activeUserId] || [];
        const filteredCart = userCart.filter(
          (item) => !(item.id === itemId && item.type === itemType)
        );

        set({
          carts: { ...carts, [activeUserId]: filteredCart },
        });
      },

      clearCart: () => {
        const { carts, activeUserId } = get();
        if (!activeUserId) return;

        set({ carts: { ...carts, [activeUserId]: [] } });
      },

      addQuantity: (itemId: string, itemType: ItemType) => {
        const { carts, activeUserId } = get();
        if (!activeUserId) return;
        const userCart = carts[activeUserId] || [];
        const updatedCart = userCart.map((item) => {
          if (item.id === itemId && item.type === itemType) {
            return { ...item, quantity: (item as ProductItem).quantity + 1 };
          }
          return item;
        });
        set({ carts: { ...carts, [activeUserId]: updatedCart } });
      },
      removeQuantity: (itemId: string, itemType: ItemType) => {
        const { carts, activeUserId } = get();
        if (!activeUserId) return;

        const userCart = carts[activeUserId] || [];

        const updatedCart = userCart
          .map((item) => {
            if (item.id === itemId && item.type === itemType) {
              const current = (item as ProductItem).quantity;
              const next = current - 1;
              return { ...item, quantity: next };
            }
            return item;
          })
          .filter(
            (item) =>
              item.type !== "product" || (item as ProductItem).quantity > 0
          );

        set({ carts: { ...carts, [activeUserId]: updatedCart } });
      },
    }),
    {
      name: "petify-cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
