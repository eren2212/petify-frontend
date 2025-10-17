import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAddVaccination } from "../../hooks/useProfile";
import Toast from "react-native-toast-message";

interface AddVaccinationModalProps {
  visible: boolean;
  onClose: () => void;
  petId: string;
}

export default function AddVaccinationModal({
  visible,
  onClose,
  petId,
}: AddVaccinationModalProps) {
  const { mutate: addVaccination, isPending: isAdding } = useAddVaccination();

  // Form state
  const [vaccineName, setVaccineName] = useState<string>("");
  const [vaccinationDate, setVaccinationDate] = useState<Date | null>(null);
  const [nextDueDate, setNextDueDate] = useState<Date | null>(null);
  const [veterinarianName, setVeterinarianName] = useState<string>("");
  const [clinicName, setClinicName] = useState<string>("");
  const [batchNumber, setBatchNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Date picker states
  const [showVaccinationDatePicker, setShowVaccinationDatePicker] =
    useState(false);
  const [showNextDueDatePicker, setShowNextDueDatePicker] = useState(false);

  // Form reset
  const resetForm = () => {
    setVaccineName("");
    setVaccinationDate(null);
    setNextDueDate(null);
    setVeterinarianName("");
    setClinicName("");
    setBatchNumber("");
    setNotes("");
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!vaccineName.trim() || !vaccinationDate) {
      Toast.show({
        type: "error",
        text1: "Aşı adı ve tarih zorunludur!",
        bottomOffset: 40,
      });
      return;
    }

    const vaccinationData = {
      pet_id: petId,
      vaccine_name: vaccineName.trim(),
      vaccination_date: vaccinationDate.toISOString().split("T")[0],
      next_due_date: nextDueDate
        ? nextDueDate.toISOString().split("T")[0]
        : undefined,
      veterinarian_name: veterinarianName.trim() || undefined,
      clinic_name: clinicName.trim() || undefined,
      batch_number: batchNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    addVaccination(vaccinationData, {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Aşı bilgisi başarıyla eklendi!",
          bottomOffset: 40,
        });
        resetForm();
        onClose();
      },
      onError: (error: any) => {
        Toast.show({
          type: "error",
          text1: error?.response?.data?.message || "Aşı eklenirken hata oluştu",
          bottomOffset: 40,
        });
      },
    });
  };

  const handleVaccinationDateChange = (event: any, selectedDate?: Date) => {
    setShowVaccinationDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setVaccinationDate(selectedDate);
    }
  };

  const handleNextDueDateChange = (event: any, selectedDate?: Date) => {
    setShowNextDueDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setNextDueDate(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Tarih Seç";
    return date.toLocaleDateString("tr-TR");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl h-5/6">
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-900">Aşı Ekle</Text>
              <TouchableOpacity onPress={onClose}>
                <Text className="text-2xl text-gray-500">×</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView
              className="flex-1 px-6 py-4"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Aşı Adı */}
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2">
                  Aşı Adı <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={vaccineName}
                  onChangeText={setVaccineName}
                  placeholder="Örn: Kuduz, Karma, Kene"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
                />
              </View>

              {/* Aşı Tarihi */}
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2">
                  Aşı Tarihi <Text className="text-red-500">*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setShowVaccinationDatePicker(!showVaccinationDatePicker)
                  }
                  className="border border-gray-200 rounded-xl px-4 py-3 bg-white flex-row justify-between items-center"
                >
                  <Text
                    className={
                      vaccinationDate ? "text-gray-900" : "text-gray-400"
                    }
                  >
                    {formatDate(vaccinationDate)}
                  </Text>
                  <Text className="text-gray-400">📅</Text>
                </TouchableOpacity>

                {showVaccinationDatePicker && (
                  <DateTimePicker
                    value={vaccinationDate || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleVaccinationDateChange}
                    maximumDate={new Date()}
                    locale="tr-TR"
                    textColor="black"
                  />
                )}
              </View>

              {/* Sonraki Aşı Tarihi */}
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2">
                  Sonraki Aşı Tarihi (İsteğe Bağlı)
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setShowNextDueDatePicker(!showNextDueDatePicker)
                  }
                  className="border border-gray-200 rounded-xl px-4 py-3 bg-white flex-row justify-between items-center"
                >
                  <Text
                    className={nextDueDate ? "text-gray-900" : "text-gray-400"}
                  >
                    {formatDate(nextDueDate)}
                  </Text>
                  <Text className="text-gray-400">📅</Text>
                </TouchableOpacity>

                {showNextDueDatePicker && (
                  <DateTimePicker
                    value={nextDueDate || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleNextDueDateChange}
                    minimumDate={new Date()}
                    locale="tr-TR"
                    textColor="black"
                  />
                )}
              </View>

              {/* Veteriner Adı */}
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2">
                  Veteriner Adı (İsteğe Bağlı)
                </Text>
                <TextInput
                  value={veterinarianName}
                  onChangeText={setVeterinarianName}
                  placeholder="Veteriner adını girin"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
                />
              </View>

              {/* Klinik Adı */}
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2">
                  Klinik Adı (İsteğe Bağlı)
                </Text>
                <TextInput
                  value={clinicName}
                  onChangeText={setClinicName}
                  placeholder="Klinik adını girin"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
                />
              </View>

              {/* Seri Numarası */}
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2">
                  Seri Numarası (İsteğe Bağlı)
                </Text>
                <TextInput
                  value={batchNumber}
                  onChangeText={setBatchNumber}
                  placeholder="Aşının seri numarasını girin"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
                />
              </View>

              {/* Notlar */}
              <View className="mb-6">
                <Text className="text-sm text-gray-600 mb-2">
                  Notlar (İsteğe Bağlı)
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Ek notlar ekleyin..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white"
                />
              </View>
            </ScrollView>

            {/* Submit Button */}
            <View className="px-6 py-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isAdding || !vaccineName.trim() || !vaccinationDate}
                className={`py-4 rounded-full ${
                  isAdding || !vaccineName.trim() || !vaccinationDate
                    ? "bg-gray-300"
                    : "bg-green-500"
                }`}
              >
                {isAdding ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-center text-base">
                    Aşı Ekle
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
