import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface BackHeaderProps {
  title: string;
}

export default function BackHeader({ title }: BackHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-center bg-white px-4 py-4 border-b border-gray-200">
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute left-4 p-2"
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text className="text-lg font-semibold text-center">{title}</Text>
    </View>
  );
}
