import { View, Text } from "react-native";
import { useForm } from "react-hook-form";

export default function SignUp() {
  const { control, handleSubmit } = useForm();

  return (
    <View>
      <Text>SignUp</Text>
    </View>
  );
}
