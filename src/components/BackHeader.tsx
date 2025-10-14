import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

interface BackHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function BackHeader({ title, onBack }: BackHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View className="flex-row items-center justify-center bg-white px-4 py-4 border-b border-gray-200">
      <TouchableOpacity
        onPress={handleBack}
        className="absolute left-4 p-2"
        activeOpacity={0.7}
      >
        <Text className="text-2xl text-gray-700">←</Text>
      </TouchableOpacity>

      <Text className="text-lg font-semibold text-center">{title}</Text>
    </View>
  );
}
