import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Platform,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useForm } from "react-hook-form";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { Controller } from "react-hook-form";
import { useState } from "react";
import { roles } from "../../components/RoleOption";

import RoleOption from "../../components/RoleOption";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../stores";

export default function SignIn() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState("pet_owner");

  // Zustand store'dan signIn fonksiyonunu al
  const { signIn } = useAuthStore();

  const getRoleLabel = () => {
    return roles.find((role) => role.id === selectedRole)?.label || "";
  };

  const onSubmit = async (data: any) => {
    try {
      const loginData = {
        email: data.email,
        password: data.password,
        roleType: selectedRole,
      };

      // Zustand store üzerinden login yap
      const result = await signIn(loginData);

      if (result.error) {
        // Hata varsa toast göster
        Toast.show({
          type: "error",
          text1: "Başarısız Giriş",
          text2: result.error,
          bottomOffset: 40,
        });
      } else {
        // Başarılı - AuthProvider otomatik olarak yönlendirecek
        Toast.show({
          type: "success",
          text1: "Giriş Başarılı",
          text2: "Hoş geldiniz!",
          bottomOffset: 40,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.description ||
        error.response?.data?.error?.message ||
        error.message ||
        "Bilinmeyen bir hata oluştu";

      Toast.show({
        type: "error",
        text1: "Başarısız Giriş",
        text2: errorMessage,
        bottomOffset: 40,
      });
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-background">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              className="flex-1 px-6 pt-8"
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View className="mb-8">
                <Text className="text-3xl font-bold text-text mb-2">
                  Tekrar Hoş Geldiniz
                </Text>
                <Text className="text-base text-text/60">
                  Giriş Yapmak için aşağıdan devam ediniz..
                </Text>
              </View>

              {/* Role Selection */}
              <View className="mb-6">
                <Text className="text-base text-text mb-2">Ben bir...</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  className="flex-row items-center bg-card border border-primary rounded-xl p-5"
                >
                  <View className="mr-3">
                    {roles.find((role) => role.id === selectedRole)?.icon}
                  </View>
                  <Text className="flex-1 text-base text-text">
                    {getRoleLabel()}
                  </Text>
                  <View className="w-6 h-6 rounded-full border-2 border-primary bg-primary">
                    <View className="w-2 h-2 bg-white rounded-full m-auto" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Email */}
              <View className="mb-6">
                <Text className="text-base text-text mb-2">E-posta</Text>
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: "E-posta alanı zorunludur",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Geçerli bir e-posta adresi girin",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`bg-card border rounded-xl p-5 text-base text-text ${
                        errors.email ? "border-red-500" : "border-border"
                      }`}
                      placeholder="E-posta adresinizi girin"
                      placeholderTextColor="#999"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  )}
                />
                {errors.email && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.email.message as string}
                  </Text>
                )}
              </View>

              {/* password */}
              <View className="mb-8">
                <Text className="text-base text-text mb-2">Şifre</Text>
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: "Şifre alanı zorunludur",
                    minLength: {
                      value: 6,
                      message: "Şifre en az 6 karakter olmalıdır",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`bg-card border rounded-xl p-5 text-base text-text ${
                        errors.password ? "border-red-500" : "border-border"
                      }`}
                      placeholder="Şifrenizi girin"
                      placeholderTextColor="#999"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value || ""}
                      defaultValue=""
                      secureTextEntry
                      autoComplete="current-password"
                      textContentType="password"
                      autoCorrect={false}
                      autoCapitalize="none"
                      keyboardType="default"
                    />
                  )}
                />
                {errors.password && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.password.message as string}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                className="bg-primary rounded-xl p-5 mb-6 shadow-lg"
              >
                <Text className="text-white text-center text-base font-semibold">
                  Giriş Yap
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center gap-2 mb-6">
                <Text className="text-text/60 text-base">
                  Halen hesabınız yok mu?
                </Text>
                <Link href="/signin" asChild>
                  <TouchableOpacity>
                    <Link
                      className="text-primary text-base font-semibold"
                      href={"/signup"}
                    >
                      Kayıt Ol
                    </Link>
                  </TouchableOpacity>
                </Link>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

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
