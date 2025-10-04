import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import RoleOption, { roles } from "../../components/RoleOption";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { authApi } from "../../lib/api";
import Toast from "react-native-toast-message";

export default function SignUp() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState("pet_owner");

  const onSubmit = async (data: any) => {
    try {
      const formData = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phoneNumber, // phoneNumber -> phone
        roleType: selectedRole, // role -> roleType
      };

      await authApi.register(formData);
      Toast.show({
        type: "success",
        text1: "Başarılı",
        text2: "Lütfen mail kutunuza gelen maili onaylayın!!",
        bottomOffset: 40,
      });
      // Başarılı kayıt sonrası yönlendirme yapılabilir
      router.push("/signin");
    } catch (error: any) {
      // Backend'den gelen hata mesajını al
      const errorMessage =
        error.response?.data?.error?.description ||
        error.response?.data?.error?.message ||
        error.message ||
        "Bilinmeyen bir hata oluştu";

      Toast.show({
        type: "error",
        text1: "Kayıt Başarısız",
        text2: errorMessage,
      });
    }
  };

  const getRoleLabel = () => {
    return roles.find((role) => role.id === selectedRole)?.label || "";
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
                  Hesabını Oluştur
                </Text>
                <Text className="text-base text-text/60">
                  Evcil hayvan severler topluluğumuza katıl!
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

              {/* Full Name */}
              <View className="mb-6">
                <Text className="text-base text-text mb-2">Ad Soyad</Text>
                <Controller
                  control={control}
                  name="fullName"
                  rules={{ required: "Ad soyad alanı zorunludur" }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`bg-card border rounded-xl p-5 text-base text-text ${
                        errors.fullName ? "border-red-500" : "border-border"
                      }`}
                      placeholder="Adınızı ve soyadınızı girin"
                      placeholderTextColor="#999"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.fullName && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.fullName.message as string}
                  </Text>
                )}
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

              {/* Phone Number */}
              <View className="mb-6">
                <Text className="text-base text-text mb-2">
                  Telefon Numarası
                </Text>
                <Controller
                  control={control}
                  name="phoneNumber"
                  rules={{
                    required: "Telefon numarası alanı zorunludur",
                    pattern: {
                      value: /^(\+90|0)?5\d{9}$/,
                      message: "Geçerli bir telefon numarası giriniz",
                    },
                    maxLength: {
                      value: 10,
                      message: "En fazla 10 karakter olmalı!",
                    },
                    minLength: {
                      value: 10,
                      message: "En az 10 karakter olmalı!",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`bg-card border rounded-xl p-5 text-base text-text ${
                        errors.phoneNumber ? "border-red-500" : "border-border"
                      }`}
                      placeholder="(555 xxx xx xx)"
                      placeholderTextColor="#999"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="phone-pad"
                    />
                  )}
                />
                {errors.phoneNumber && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber.message as string}
                  </Text>
                )}
              </View>

              {/* Password */}
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
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                      message:
                        "Şifre en az bir büyük harf, bir küçük harf, bir sayı ve bir özel karakter içermelidir",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`bg-card border rounded-xl p-5 text-base text-text ${
                        errors.password ? "border-red-500" : "border-border"
                      }`}
                      placeholder="Bir şifre oluşturun"
                      placeholderTextColor="#999"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry
                    />
                  )}
                />
                {errors.password && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.password.message as string}
                  </Text>
                )}
              </View>

              {/* Create Account Button */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                className="bg-primary rounded-xl p-5 mb-6 shadow-lg"
              >
                <Text className="text-white text-center text-base font-semibold">
                  Hesap Oluştur
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center gap-2 mb-6">
                <Text className="text-text/60 text-base">
                  Zaten hesabınız var mı?
                </Text>
                <Link href="/signin" asChild>
                  <TouchableOpacity>
                    <Text className="text-primary text-base font-semibold">
                      Giriş Yap
                    </Text>
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
