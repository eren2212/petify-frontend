import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Token alınamadı:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi
instance.interceptors.response.use(
  (response) => {
    // Başarılı response'ları olduğu gibi döndür
    return response;
  },
  async (error) => {
    // 401 hatası = Token geçersiz, logout yap
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("access_token");
      // Buraya logout logic eklenebilir
    }
    return Promise.reject(error);
  }
);
