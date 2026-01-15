import { SafeAreaView } from "react-native-safe-area-context";
import CartScreenComponent from "@/components/basket/CartScreen";

export default function CartScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CartScreenComponent />
    </SafeAreaView>
  );
}
