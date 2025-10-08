import { View, Text, Pressable } from "react-native";
import { useAuthStore } from "../../../../stores/authStore";

export default function () {
  const { signOut } = useAuthStore();
  return (
    <View className="flex-1 justify-center items-center">
      <Text>BABABAAA</Text>

      <Pressable onPress={() => signOut()}>
        <Text>çıkış</Text>
      </Pressable>
    </View>
  );
}
