import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import RoleOption from "../../components/RoleOption";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";

export default function SignUp() {
  const { control, handleSubmit } = useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState("pet_owner");

  const onSubmit = (data: any) => {
    // Form gönderilirken seçili rol da dahil edilir
    const formData = {
      ...data,
      role: selectedRole,
    };
    console.log("Form Data:", formData);
    // API çağrısı buraya gelecek
  };

  return (
    <SafeAreaProvider className="flex justify-center items-center">
      <SafeAreaView>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="border p-4 rounded-lg"
        >
          <Text>Select Role: {selectedRole}</Text>
        </TouchableOpacity>

        <RoleOption
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
