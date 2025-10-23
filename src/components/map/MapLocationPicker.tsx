import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../styles/theme/color";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";

interface MapLocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (
    latitude: number,
    longitude: number,
    address: string
  ) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  initialAddress?: string;
}

export default function MapLocationPicker({
  visible,
  onClose,
  onLocationSelect,
  initialLatitude = 41.0082, // İstanbul koordinatları
  initialLongitude = 28.9784,
  initialAddress = "İstanbul, Türkiye",
}: MapLocationPickerProps) {
  const [selectedLatitude, setSelectedLatitude] = useState(initialLatitude);
  const [selectedLongitude, setSelectedLongitude] = useState(initialLongitude);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const mapRef = useRef<MapView>(null);

  // İstanbul merkez koordinatları
  const initialRegion: Region = {
    latitude: initialLatitude,
    longitude: initialLongitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Harita tıklandığında koordinat al
  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLatitude(latitude);
    setSelectedLongitude(longitude);

    // Adres çözümleme (basit versiyon)
    reverseGeocode(latitude, longitude);
  };

  // Marker sürüklendiğinde
  const handleMarkerDragEnd = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLatitude(latitude);
    setSelectedLongitude(longitude);

    // Adres çözümleme
    reverseGeocode(latitude, longitude);
  };

  // Basit reverse geocoding (gerçek uygulamada Google Geocoding API kullanılmalı)
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      // Bu basit bir örnek, gerçek uygulamada Google Geocoding API kullanın
      const address = `Konum: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setSelectedAddress(address);
    } catch (error) {
      console.error("Adres çözümleme hatası:", error);
      setSelectedAddress(`Konum: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Konumu onayla
  const handleConfirmLocation = () => {
    onLocationSelect(selectedLatitude, selectedLongitude, selectedAddress);
    onClose();
  };

  // Location permission kontrolü
  const checkLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status === "granted") {
        return true;
      }

      // İzin yoksa iste
      const { status: newStatus } =
        await Location.requestForegroundPermissionsAsync();
      return newStatus === "granted";
    } catch (error) {
      console.error("Location permission error:", error);
      return false;
    }
  };

  // Mevcut konumu al (GPS)
  const handleGetCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);

      // Permission kontrolü
      const hasPermission = await checkLocationPermission();

      if (!hasPermission) {
        Alert.alert(
          "Konum İzni Gerekli",
          "Mevcut konumunuzu almak için konum iznine ihtiyacımız var. Lütfen ayarlardan konum iznini açın.",
          [
            { text: "İptal", style: "cancel" },
            {
              text: "Ayarlara Git",
              onPress: () => {
                // iOS'ta Settings app'ini aç
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  // Android'de settings aç
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        return;
      }

      // Mevcut konumu al
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Koordinatları güncelle
      setSelectedLatitude(latitude);
      setSelectedLongitude(longitude);

      // Haritayı yeni konuma odakla
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      }

      // Adres çözümleme
      await reverseGeocode(latitude, longitude);

      // Başarı mesajı
      Alert.alert("Konum Bulundu", "Mevcut konumunuz başarıyla alındı.", [
        { text: "Tamam" },
      ]);
    } catch (error: any) {
      console.error("Get current location error:", error);

      let errorMessage = "Konum alınırken bir hata oluştu.";

      if (error.code === "E_LOCATION_SERVICES_DISABLED") {
        errorMessage = "Konum servisleri kapalı. Lütfen ayarlardan açın.";
      } else if (error.code === "E_LOCATION_TIMEOUT") {
        errorMessage =
          "Konum alınırken zaman aşımı oluştu. Lütfen tekrar deneyin.";
      }

      Alert.alert("Hata", errorMessage, [{ text: "Tamam" }]);
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 mt-10">
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between mt-2 px-4 py-3 border-b border-gray-200 bg-white">
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">
              Konum Seç
            </Text>
            <TouchableOpacity
              onPress={handleConfirmLocation}
              className="bg-primary px-4 py-2 rounded-full"
            >
              <Text className="text-white font-semibold">Seç</Text>
            </TouchableOpacity>
          </View>

          {/* Map Container */}
          <View className="flex-1">
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              initialRegion={initialRegion}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={true}
              mapType="standard"
              provider={PROVIDER_GOOGLE}
            >
              {/* Seçilen konum marker'ı */}
              <Marker
                coordinate={{
                  latitude: selectedLatitude,
                  longitude: selectedLongitude,
                }}
                draggable
                onDragEnd={handleMarkerDragEnd}
                title="Seçilen Konum"
                description={selectedAddress}
              />
            </MapView>

            {/* Loading Overlay */}
            {isLoading && (
              <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 px-4 py-2 rounded-lg">
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}
          </View>

          {/* Bottom Info Panel */}
          <View className="bg-white border-t border-gray-200 p-4">
            {/* Konum Bilgisi */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Seçilen Konum
              </Text>
              <Text className="text-sm text-gray-600" numberOfLines={2}>
                Haritadan konum seçildi
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleGetCurrentLocation}
                className="flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center"
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Ionicons name="locate" size={20} color="#6B7280" />
                )}
                <Text className="text-gray-700 font-medium ml-2">
                  {isGettingLocation ? "Konum Alınıyor..." : "Mevcut Konum"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmLocation}
                className="flex-1 bg-primary py-3 rounded-xl flex-row items-center justify-center"
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text className="text-white font-medium ml-2">Konumu Seç</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
