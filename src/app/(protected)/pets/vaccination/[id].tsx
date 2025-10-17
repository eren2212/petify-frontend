import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVaccinationDetail } from "../../../../hooks/useProfile";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Entypo } from "@expo/vector-icons";

export default function VaccinationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const vaccinationId = Array.isArray(id) ? id[0] : id;

  // Aşı detayını çek
  const {
    data: vaccination,
    isLoading,
    error,
  } = useVaccinationDetail(vaccinationId);

  // Tarih formatlama
  const formatDate = (dateString: string) => {
    if (!dateString) return "Belirtilmemiş";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Kısa tarih formatı (15 Oca 2024)
  const formatShortDate = (dateString: string) => {
    if (!dateString) return "Belirtilmemiş";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Sonraki aşı tarihi durumu kontrolü
  const getNextDueStatus = (nextDueDate: string) => {
    if (!nextDueDate) return null;

    const now = new Date();
    const dueDate = new Date(nextDueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        color: "red",
        bg: "bg-red-50",
        textColor: "text-red-600",
        icon: "alert-circle",
        text: "Gecikmiş",
        days: Math.abs(diffDays),
      };
    } else if (diffDays <= 7) {
      return {
        color: "orange",
        bg: "bg-orange-50",
        textColor: "text-orange-600",
        icon: "alert",
        text: "Yaklaşıyor",
        days: diffDays,
      };
    } else if (diffDays <= 30) {
      return {
        color: "yellow",
        bg: "bg-yellow-50",
        textColor: "text-yellow-600",
        icon: "clock",
        text: "Yakında",
        days: diffDays,
      };
    } else {
      return {
        color: "green",
        bg: "bg-green-50",
        textColor: "text-green-600",
        icon: "checkmark-circle",
        text: "Zamanında",
        days: diffDays,
      };
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="text-gray-600 mt-4 font-medium">Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !vaccination) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text className="text-red-500 text-lg text-center font-medium mt-4">
            Aşı bilgileri yüklenirken bir hata oluştu
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-purple-600 px-8 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const nextDueStatus = vaccination.next_due_date
    ? getNextDueStatus(vaccination.next_due_date)
    : null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header Card */}
        <View className="px-5 pt-4 pb-6">
          <View
            className="bg-primary rounded-3xl p-6"
            style={{
              shadowColor: "#8B5CF6",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-white/20 w-16 h-16 rounded-2xl items-center justify-center">
                <MaterialCommunityIcons name="needle" size={32} color="white" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-white/80 text-sm mb-1">Aşı Adı</Text>
                <Text className="text-white text-2xl font-bold">
                  {vaccination.vaccine_name}
                </Text>
              </View>
            </View>

            {vaccination.pet && (
              <View className="bg-white/10 rounded-xl p-3 flex-row items-center">
                <Ionicons name="paw" size={20} color="white" />
                <Text className="text-white ml-2 font-medium">
                  {vaccination.pet.name}
                </Text>
                {vaccination.pet.pet_type && (
                  <Text className="text-white/70 ml-2">
                    • {vaccination.pet.pet_type.name_tr}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Tarih Bilgileri */}
        <View className="px-5 mb-6">
          <View
            className="bg-white rounded-3xl p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Text className="text-xl font-bold text-gray-900 mb-5">
              Tarih Bilgileri
            </Text>

            {/* Yapılma Tarihi */}
            <View className="flex-row items-center py-4">
              <View className="bg-purple-50 w-12 h-12 rounded-xl items-center justify-center">
                <Ionicons name="calendar" size={24} color="#8B5CF6" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-gray-500 text-sm mb-1">
                  Yapılma Tarihi
                </Text>
                <Text className="text-gray-900 font-bold text-base">
                  {formatDate(vaccination.vaccination_date)}
                </Text>
              </View>
              <View className="bg-green-50 px-3 py-1.5 rounded-full">
                <Text className="text-green-600 font-semibold text-xs">
                  <Entypo name="check" size={12} color="#16A34A" /> Yapıldı
                </Text>
              </View>
            </View>

            {/* Sonraki Aşı Tarihi */}
            {vaccination.next_due_date && (
              <>
                <View className="h-px bg-gray-100 my-1" />
                <View className="flex-row items-center py-4">
                  <View
                    className={`${nextDueStatus?.bg} w-12 h-12 rounded-xl items-center justify-center`}
                  >
                    <Ionicons
                      name={nextDueStatus?.icon as any}
                      size={24}
                      color={
                        nextDueStatus?.color === "red"
                          ? "#DC2626"
                          : nextDueStatus?.color === "orange"
                            ? "#EA580C"
                            : nextDueStatus?.color === "yellow"
                              ? "#CA8A04"
                              : "#16A34A"
                      }
                    />
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="text-gray-500 text-sm mb-1">
                      Sonraki Doz
                    </Text>
                    <Text className="text-gray-900 font-bold text-base">
                      {formatDate(vaccination.next_due_date)}
                    </Text>
                    {nextDueStatus && (
                      <Text
                        className={`${nextDueStatus.textColor} text-xs mt-1 font-medium`}
                      >
                        {nextDueStatus.days > 0
                          ? `${nextDueStatus.days} gün kaldı`
                          : `${nextDueStatus.days} gün geçti`}
                      </Text>
                    )}
                  </View>
                  <View
                    className={`${nextDueStatus?.bg} px-3 py-1.5 rounded-full`}
                  >
                    <Text
                      className={`${nextDueStatus?.textColor} font-semibold text-xs`}
                    >
                      {nextDueStatus?.text}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Veteriner ve Klinik Bilgileri */}
        {(vaccination.veterinarian_name || vaccination.clinic_name) && (
          <View className="px-5 mb-6">
            <View
              className="bg-white rounded-3xl p-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <Text className="text-xl font-bold text-gray-900 mb-5">
                Sağlık Kurumu
              </Text>

              {vaccination.veterinarian_name && (
                <View className="flex-row items-center py-3.5">
                  <View className="bg-blue-50 w-10 h-10 rounded-xl items-center justify-center">
                    <MaterialCommunityIcons
                      name="doctor"
                      size={22}
                      color="#3B82F6"
                    />
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="text-gray-500 text-sm mb-1">
                      Veteriner
                    </Text>
                    <Text className="text-gray-900 font-semibold text-base">
                      {vaccination.veterinarian_name}
                    </Text>
                  </View>
                </View>
              )}

              {vaccination.veterinarian_name && vaccination.clinic_name && (
                <View className="h-px bg-gray-100 my-1" />
              )}

              {vaccination.clinic_name && (
                <View className="flex-row items-center py-3.5">
                  <View className="bg-cyan-50 w-10 h-10 rounded-xl items-center justify-center">
                    <MaterialCommunityIcons
                      name="hospital-building"
                      size={22}
                      color="#06B6D4"
                    />
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="text-gray-500 text-sm mb-1">Klinik</Text>
                    <Text className="text-gray-900 font-semibold text-base">
                      {vaccination.clinic_name}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Parti Numarası */}
        {vaccination.batch_number && (
          <View className="px-5 mb-6">
            <View
              className="bg-white rounded-3xl p-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <View className="flex-row items-center">
                <View className="bg-amber-50 w-12 h-12 rounded-xl items-center justify-center">
                  <MaterialCommunityIcons
                    name="barcode"
                    size={24}
                    color="#F59E0B"
                  />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-gray-500 text-sm mb-1">
                    Parti / Lot Numarası
                  </Text>
                  <Text className="text-gray-900 font-bold text-base font-mono">
                    {vaccination.batch_number}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Notlar */}
        {vaccination.notes && (
          <View className="px-5 mb-6">
            <View
              className="bg-white rounded-3xl p-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <View className="flex-row items-center mb-4">
                <MaterialCommunityIcons
                  name="text-box"
                  size={24}
                  color="#8B5CF6"
                />
                <Text className="text-xl font-bold text-gray-900 ml-2">
                  Notlar
                </Text>
              </View>
              <View className="bg-purple-50 rounded-2xl p-4">
                <Text className="text-gray-700 text-base leading-6">
                  {vaccination.notes}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Kayıt Tarihi */}
        <View className="px-5">
          <View className="flex-row items-center justify-center">
            <Ionicons name="time" size={16} color="#9CA3AF" />
            <Text className="text-gray-400 text-sm ml-2">
              Kayıt Tarihi:{" "}
              {vaccination.created_at
                ? formatShortDate(vaccination.created_at)
                : "Bilinmiyor"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
