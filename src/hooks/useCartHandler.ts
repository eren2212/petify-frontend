import { Alert } from "react-native";
import { useCurrentCart } from "./useCurrentCart"; // DEĞİŞİKLİK BURADA
import { CartItem } from "../types/type";

export const useCartHandler = () => {
  // useCartStore YERİNE useCurrentCart kullanıyoruz
  const { cart, addToCart, clearCart, activeUserId } = useCurrentCart();

  const safeAddToCart = (newItem: CartItem) => {
    if (!activeUserId) {
      Alert.alert(
        "Giriş Yapın",
        "Sepete ürün eklemek için lütfen giriş yapın."
      );
      return;
    }

    // 1. Sepet Boşsa -> Ekle
    if (cart.length === 0) {
      addToCart(newItem);
      return;
    }

    const currentCartType = cart[0].type;

    // 2. Tipler Aynıysa -> Ekle
    if (currentCartType === newItem.type) {
      addToCart(newItem);
    }
    // 3. Tipler Farklıysa -> UYARI
    else {
      const isNewService = newItem.type === "service";
      Alert.alert(
        "Sepet Türü Değişiyor",
        isNewService
          ? "Sepetinizde ürünler var. Hizmet randevusu için sepet temizlenmeli. Onaylıyor musunuz?"
          : "Sepetinizde randevu var. Ürün almak için sepet temizlenmeli. Onaylıyor musunuz?",
        [
          { text: "Vazgeç", style: "cancel" },
          {
            text: "Temizle ve Ekle",
            onPress: () => {
              clearCart();
              addToCart(newItem);
            },
            style: "destructive",
          },
        ]
      );
    }
  };

  return { safeAddToCart };
};
