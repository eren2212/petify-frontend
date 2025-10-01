import { View, Text } from "react-native";
import { useForm } from "react-hook-form";

export default function SignIn() {
  const { control, handleSubmit } = useForm();

  return (
    <View>
      <Text>SignIn</Text>
    </View>
  );
}
