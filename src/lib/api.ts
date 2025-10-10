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

      const { data } = await instance.post("/auth/register", newUser);

      // ⭐ Backend'den gelen response'u AsyncStorage'a kaydet
      if (data?.data?.session) {
        await AsyncStorage.setItem(
          "access_token",
          data.data.session.access_token
        );
        await AsyncStorage.setItem(
          "refresh_token",
          data.data.session.refresh_token
        );

        // ⭐ User bilgilerini userRole ile birlikte kaydet
        if (data.data.user) {
          const userWithRole = {
            ...data.data.user,
            role_type: roleType,
            role_status: data.data.roleStatus || "pending",
          };
          await AsyncStorage.setItem("user", JSON.stringify(userWithRole));
          console.log(
            "✅ Register: User with role saved to storage:",
            userWithRole
          );
        }
      }

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

        // ⭐ User bilgilerini userRole ile birlikte kaydet
        if (data.data.user && data.data.userRole) {
          const userWithRole = {
            ...data.data.user,
            role_type: data.data.userRole.role_type,
            role_status: data.data.userRole.status,
          };
          await AsyncStorage.setItem("user", JSON.stringify(userWithRole));
          console.log(
            "✅ Login: User with role saved to storage:",
            userWithRole
          );
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

  // ⭐ Kullanıcı bilgilerini rol ve profil ile birlikte getir
  getMe: async () => {
    try {
      const { data } = await instance.get("/auth/me");

      // Backend'den gelen user bilgisini AsyncStorage'a kaydet
      if (data?.data?.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.data.user));
        console.log("✅ GetMe: User data updated in storage");
      }

      return data;
    } catch (error: any) {
      console.log("GetMe Error:", error.response?.data || error.message);
      throw error;
    }
  },
};

// Profile API
export const profileApi = {
  // Avatar yükleme
  uploadAvatar: async (imageUri: string) => {
    try {
      // FormData oluştur
      const formData = new FormData();

      // React Native'de dosya bilgilerini çıkar
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image/jpeg";

      // FormData'ya dosyayı ekle
      formData.append("avatar", {
        uri: imageUri,
        name: filename || "avatar.jpg",
        type,
      } as any);

      // Multipart request gönder
      const { data } = await instance.post("/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Avatar uploaded:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Avatar Upload Error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Profil bilgilerini güncelle
  updateInformation: async (data: {
    full_name?: string;
    phone_number?: string;
  }) => {
    try {
      const response = await instance.put("/profile/information", data);
      console.log("✅ Profile information updated:", response.data);
      return response.data;
    } catch (error: any) {
      console.log(
        "Update Information Error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Avatar silme
  deleteAvatar: async () => {
    try {
      const { data } = await instance.delete("/profile/avatar");
      console.log("✅ Avatar deleted:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Delete Avatar Error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};
