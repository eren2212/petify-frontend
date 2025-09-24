import { Text, View } from "react-native";
import { SafeAreaView ,SafeAreaProvider} from "react-native-safe-area-context";
 
export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-primary">
    <View className="flex-1 items-center justify-center bg-primary">
      <Text className="text-xl font-bold text-textLight">
        Welcome to Nativewind !
      </Text>
    </View>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}