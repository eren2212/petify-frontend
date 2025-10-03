import { View, Text } from "react-native";
import { useForm } from "react-hook-form";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";

export default function SignIn() {
  return (
    <SafeAreaProvider className="flex justify-center items-center">
      <SafeAreaView>
        <Link href="/signup">deneme</Link>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
