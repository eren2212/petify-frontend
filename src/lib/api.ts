import axios from "axios";
import { Login, Register } from "../types/type";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use(
  async (config) => {
    try {
      // AsyncStorage'dan token al
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
    // 401 hatası = Token geçersiz, storage temizle
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(["access_token", "refresh_token", "user"]);
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async ({
    email,
    password,
    fullName,
    phone,
    roleType,
  }: Register) => {
    try {
      const newUser = {
        email,
        password,
        fullName,
        phone,
        roleType,
      };

      // { newUser } yerine direkt newUser gönder!
      const { data } = await instance.post("/auth/register", newUser);
      return data;
    } catch (error: any) {
      console.log("Register Error:", error.response?.data || error.message);
      throw error;
    }
  },

  login: async ({ email, password, roleType }: Login) => {
    try {
      const userınformation = {
        email,
        password,
        roleType,
      };
      const { data } = await instance.post("/auth/login", userınformation);

      // Backend'den gelen token'ları AsyncStorage'a kaydet
      if (data?.data?.session) {
        await AsyncStorage.setItem(
          "access_token",
          data.data.session.access_token
        );
        await AsyncStorage.setItem(
          "refresh_token",
          data.data.session.refresh_token
        );

        // User bilgilerini de kaydet
        if (data.data.user) {
          await AsyncStorage.setItem("user", JSON.stringify(data.data.user));
        }
      }

      return data;
    } catch (error: any) {
      console.log("Login Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Logout fonksiyonu - Backend'e istek at ve storage temizle
  logout: async () => {
    try {
      // Backend'e logout isteği at
      await instance.post("/auth/logout");

      // Başarılı olduysa local storage'ı temizle
      await AsyncStorage.multiRemove(["access_token", "refresh_token", "user"]);
    } catch (error: any) {
      console.log("Logout Error:", error.response?.data || error.message);

      // Backend hatası olsa bile local storage'ı temizle (client-side logout)
      await AsyncStorage.multiRemove(["access_token", "refresh_token", "user"]);

      throw error;
    }
  },
};
