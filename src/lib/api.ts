import axios from "axios";
import { Login, Register } from "../types/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

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
  },
);

// Token yenileme için değişkenler
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor - Token yenileme ve hata yönetimi
instance.interceptors.response.use(
  (response) => {
    // Başarılı response'ları olduğu gibi döndür
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 hatası = Token geçersiz veya süresi dolmuş
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Zaten refresh işlemi devam ediyorsa, sıraya ekle
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh token ile yeni token al
        const refreshToken = await AsyncStorage.getItem("refresh_token");

        if (!refreshToken) {
          throw new Error("Refresh token bulunamadı");
        }

        console.log("🔄 Token yenileniyor...");

        // Refresh endpoint'ini çağır (axios doğrudan kullan, instance değil)
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        if (data?.data?.session) {
          // Yeni token'ları kaydet
          await AsyncStorage.setItem(
            "access_token",
            data.data.session.access_token,
          );
          await AsyncStorage.setItem(
            "refresh_token",
            data.data.session.refresh_token,
          );

          console.log("✅ Token başarıyla yenilendi!");

          // Başarılı olan istekleri işle
          processQueue(null, data.data.session.access_token);

          // Orijinal isteği yeni token ile tekrarla
          originalRequest.headers.Authorization = `Bearer ${data.data.session.access_token}`;
          return instance(originalRequest);
        } else {
          throw new Error("Token yenileme başarısız");
        }
      } catch (refreshError: any) {
        // Refresh token da geçersizse, çıkış yap
        console.log(
          "🚨 Refresh token geçersiz veya süresi dolmuş, çıkış yapılıyor...",
        );

        processQueue(refreshError, null);

        // AsyncStorage'ı temizle
        await AsyncStorage.multiRemove([
          "access_token",
          "refresh_token",
          "user",
        ]);

        // QueryClient cache'ini temizle
        const { queryClient } = await import("./queryClient");
        queryClient.clear();

        // AuthStore'u temizle
        const { useAuthStore } = await import("../stores/authStore");
        useAuthStore.getState().reset();

        // Signin sayfasına yönlendir
        try {
          router.replace("/(auth)/signin");
        } catch (routerError) {
          console.error("Router yönlendirme hatası:", routerError);
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
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
          data.data.session.access_token,
        );
        await AsyncStorage.setItem(
          "refresh_token",
          data.data.session.refresh_token,
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
            userWithRole,
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
          data.data.session.access_token,
        );
        await AsyncStorage.setItem(
          "refresh_token",
          data.data.session.refresh_token,
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
            userWithRole,
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
      // Push token'ı temizle
      try {
        await instance.delete("/profile/push-token");
        console.log("✅ Push token temizlendi");
      } catch (tokenError) {
        console.log("⚠️ Push token temizlenemedi:", tokenError);
        // Devam et, kritik değil
      }

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
        error.response?.data || error.message,
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
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Push token güncelle
  updatePushToken: async (push_token: string) => {
    try {
      const response = await instance.put("/profile/push-token", {
        push_token,
      });
      console.log("✅ Push token updated:", response.data);
      return response.data;
    } catch (error: any) {
      console.log(
        "Update Push Token Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Push token sil
  deletePushToken: async () => {
    try {
      const response = await instance.delete("/profile/push-token");
      console.log("✅ Push token deleted:", response.data);
      return response.data;
    } catch (error: any) {
      console.log(
        "Delete Push Token Error:",
        error.response?.data || error.message,
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
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

// Pet API
export const petApi = {
  // Pet türlerini getir
  getPetTypes: async () => {
    try {
      const { data } = await instance.get("/pet/types");
      console.log("✅ Pet types fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Pet Types Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Kullanıcının tüm hayvanlarını getir
  getMyPets: async () => {
    try {
      const { data } = await instance.get("/profile/pet");
      console.log("✅ Pets fetched:", data);
      return data;
    } catch (error: any) {
      console.log("Get Pets Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Yeni hayvan ekle
  addPet: async (petData: any) => {
    try {
      const { data } = await instance.post("/profile/pet/add", petData);
      console.log("✅ Pet added:", data);
      return data;
    } catch (error: any) {
      console.log("Add Pet Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Pet resmi yükle
  uploadPetImage: async (petId: string, imageUri: string) => {
    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("petImage", {
        uri: imageUri,
        name: filename || "pet.jpg",
        type,
      } as any);

      const { data } = await instance.post(
        `/profile/pet/${petId}/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("✅ Pet image uploaded:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Pet Image Upload Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Pet'in resimlerini getir
  getPetImages: async (petId: string) => {
    try {
      const { data } = await instance.get(`/profile/pet/${petId}/images`);
      console.log("✅ Pet images fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Pet Images Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Pet resmini sil
  deletePetImage: async (imageId: string) => {
    try {
      const { data } = await instance.delete(`/profile/pet/image/${imageId}`);
      console.log("✅ Pet image deleted:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Delete Pet Image Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Pet detayını getir
  getPetDetail: async (petId: string) => {
    try {
      const { data } = await instance.get(`/pet/my/${petId}`);
      console.log("✅ Pet detail fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Pet Detail Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  updatePet: async (petData: any, petId: string) => {
    try {
      const { data } = await instance.put(`/pet/my/${petId}`, petData);
      console.log("✅ Pet updated:", data);
      return data;
    } catch (error: any) {
      console.log("Update Pet Error:", error.response?.data || error.message);
      throw error;
    }
  },

  addVaccination: async (petVaccination: any) => {
    try {
      const { data } = await instance.post("/pet/vaccination", petVaccination);
      console.log("Vaccination added:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Vaccination added Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  getVaccination: async (petId: string) => {
    try {
      const { data } = await instance.get(`/pet/vaccination/${petId}`);
      console.log("Get Vaccination :", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get vaccination error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Tek bir aşının detayını getir
  getVaccinationDetail: async (vaccinationId: string) => {
    try {
      const { data } = await instance.get(
        `/pet/vaccination/detail/${vaccinationId}`,
      );
      console.log("✅ Vaccination detail fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Vaccination Detail Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Kayıp hayvan ilanı ekle
  addLostPet: async (lostPetData: any) => {
    try {
      const { data } = await instance.post("/pet/lost", lostPetData);
      console.log("✅ Lost pet listing added:", data);
      return data;
    } catch (error: any) {
      console.log("Add Lost Pet Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Kayıp hayvan resmi yükle
  uploadLostPetImage: async (listingId: string, imageUri: string) => {
    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("lostpets", {
        uri: imageUri,
        name: filename || "lost-pet.jpg",
        type,
      } as any);

      formData.append("petId", listingId);

      const { data } = await instance.post("/pet/lost/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Lost pet image uploaded:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Lost Pet Image Upload Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Yakındaki kayıp hayvanları getir
  getNearbyLostPets: async (latitude: number, longitude: number) => {
    try {
      const { data } = await instance.get(
        `/pet/lost/nearby?latitude=${latitude}&longitude=${longitude}`,
      );
      console.log("✅ Nearby lost pets fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Nearby Lost Pets Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  getLostPetDetail: async (lostPetId: string) => {
    try {
      const { data } = await instance.get(`/lostpet/detail/${lostPetId}`);
      console.log("✅ Lost pet detail fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Lost Pet Detail Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  getLostPetImages: async (lostPetId: string) => {
    try {
      const { data } = await instance.get(`/lostpet/image/${lostPetId}`);
      console.log("✅ Lost pet images fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Lost Pet Images Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  getMyLostPetListings: async () => {
    try {
      const { data } = await instance.get("/lostpet/my/listings");
      console.log("✅ My lost pet listings fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get My Lost Pet Listings Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Sahiplendirme ilanı ekle
  addAdoptionPet: async (adoptionPetData: any) => {
    try {
      const { data } = await instance.post("/adoptionpet/add", adoptionPetData);
      console.log("✅ Adoption pet listing added:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Add Adoption Pet Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Sahiplendirme hayvanı resmi yükle
  uploadAdoptionPetImage: async (listingId: string, imageUri: string) => {
    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("adoptionpets", {
        uri: imageUri,
        name: filename || "adoption-pet.jpg",
        type,
      } as any);

      formData.append("petId", listingId);

      const { data } = await instance.post("/adoptionpet/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Adoption pet image uploaded:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Adoption Pet Image Upload Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Yakındaki sahiplendirme ilanlarını getir
  getNearbyAdoptionPets: async (
    latitude: number,
    longitude: number,
    radiusInMeters?: number,
  ) => {
    try {
      let url = `/adoptionpet/nearby?latitude=${latitude}&longitude=${longitude}`;

      // Eğer radius belirtilmişse query'ye ekle
      if (radiusInMeters) {
        url += `&dynamicRadiusInMeters=${radiusInMeters}`;
      }

      const { data } = await instance.get(url);
      console.log("✅ Nearby adoption pets fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Nearby Adoption Pets Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Sahiplendirme ilanı detayını getir
  getAdoptionPetDetail: async (adoptionPetId: string) => {
    try {
      const { data } = await instance.get(
        `/adoptionpet/detail/${adoptionPetId}`,
      );
      console.log("✅ Adoption pet detail fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Adoption Pet Detail Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Kullanıcının sahiplendirme ilanlarını getir
  getMyAdoptionPetListings: async () => {
    try {
      const { data } = await instance.get("/adoptionpet/my/listings");
      console.log("✅ My adoption pet listings fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get My Adoption Pet Listings Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Sahiplendirme ilanını sahiplendirildi olarak işaretle
  markAdoptionPetAsAdopted: async (adoptionPetId: string) => {
    try {
      const { data } = await instance.put(`/adoptionpet/${adoptionPetId}`);
      console.log("✅ Adoption pet marked as adopted:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Mark Adoption Pet As Adopted Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Sahiplendirme ilanını sil
  deleteAdoptionPet: async (adoptionPetId: string) => {
    try {
      const { data } = await instance.delete(`/adoptionpet/${adoptionPetId}`);
      console.log("✅ Adoption pet deleted:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Delete Adoption Pet Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Kayıp hayvan ilanını bulundu olarak işaretle
  markLostPetAsFound: async (lostPetId: string) => {
    try {
      const { data } = await instance.put(`/lostpet/${lostPetId}`);
      console.log("✅ Lost pet marked as found:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Mark Lost Pet As Found Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Kayıp hayvan ilanını sil
  deleteLostPet: async (lostPetId: string) => {
    try {
      const { data } = await instance.delete(`/lostpet/${lostPetId}`);
      console.log("✅ Lost pet deleted:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Delete Lost Pet Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

export const conversationApi = {
  startConversation: async (targetRoleId: string) => {
    try {
      const { data } = await instance.post("/conversations/start", {
        target_role_id: targetRoleId,
      });
      console.log("✅ Conversation started/retrieved:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Start Conversation Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

// Pet Shop API
export const petShopApi = {
  // Pet Shop profili oluştur
  createProfile: async (profileData: any) => {
    try {
      const { data } = await instance.post("/petshop/add/profile", profileData);
      console.log("✅ Pet shop profile created:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Create Pet Shop Profile Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  updatePetShopProfile: async (profileData: any) => {
    try {
      const { data } = await instance.put("/petshop/profile", profileData);
      console.log("✅ Pet shop profile updated:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Update Pet Shop Profile Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
  // Pet Shop profilini getir
  getProfile: async () => {
    try {
      const { data } = await instance.get("/petshop/profile");
      console.log("✅ Pet shop profile fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Pet Shop Profile Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Pet Shop logo yükle
  uploadLogo: async (imageUri: string) => {
    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("petshopprofile", {
        uri: imageUri,
        name: filename || "petshop-logo.jpg",
        type,
      } as any);

      const { data } = await instance.post(
        "/petshop/add/profile/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("✅ Pet shop logo uploaded:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Pet Shop Logo Upload Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Pet Shop logo sil
  deleteLogo: async () => {
    try {
      const { data } = await instance.delete("/petshop/profile/logo");
      console.log("✅ Pet shop logo deleted:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Delete Pet Shop Logo Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

// Product API
export const productApi = {
  // Ürün kategorilerini getir
  getCategories: async () => {
    try {
      const { data } = await instance.get("/products/categories");
      console.log("✅ Product categories fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Product Categories Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Yeni ürün ekle
  addProduct: async (productData: any) => {
    try {
      const { data } = await instance.post("/products/add", productData);
      console.log("✅ Product added:", data);
      return data;
    } catch (error: any) {
      console.log("Add Product Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Ürün güncelle
  updateProduct: async (id: string, productData: any) => {
    try {
      const { data } = await instance.put(`/products/${id}`, productData);
      console.log("✅ Product updated:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Update Product Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Ürün stok güncelle
  updateProductStock: async (id: string, stock_quantity: number) => {
    try {
      const { data } = await instance.patch(`/products/${id}/stock-update`, {
        stock_quantity,
      });
      console.log("✅ Product stock updated:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Update Product Stock Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Ürün durumu güncelle
  updateProductStatus: async (id: string, status: boolean) => {
    try {
      const { data } = await instance.patch(`/products/${id}/status`, {
        status,
      });
      console.log("✅ Product status updated:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Update Product Status Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Ürün sil
  deleteProduct: async (id: string) => {
    try {
      const { data } = await instance.delete(`/products/${id}`);
      console.log("✅ Product deleted:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Delete Product Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Pet shop'un ürünlerini getir
  getMyProducts: async (
    page: number = 1,
    limit: number = 10,
    categoryId?: string,
    status?: boolean,
  ) => {
    try {
      const params: any = { page, limit };
      if (categoryId) params.categoryId = categoryId;
      if (status !== undefined) params.status = status;

      const { data } = await instance.get("/products", { params });
      console.log("✅ My products fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get My Products Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Tüm ürünleri getir
  getAllProducts: async (page: number = 1, limit: number = 10) => {
    try {
      const { data } = await instance.get("/products/all", {
        params: { page, limit },
      });
      console.log("✅ All products fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get All Products Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Kategoriye göre ürünleri getir
  getProductsByCategory: async (
    categoryName: string,
    page: number = 1,
    limit: number = 10,
  ) => {
    try {
      const { data } = await instance.get(
        `/products/category/${categoryName}`,
        {
          params: { page, limit },
        },
      );
      console.log("✅ Products by category fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Products By Category Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Ürün detayını getir
  getProductById: async (id: string) => {
    try {
      const { data } = await instance.get(`/products/${id}`);
      console.log("✅ Product detail fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Product By ID Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Ürün resmi yükle
  uploadProductImage: async (productId: string, imageUri: string) => {
    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("products", {
        uri: imageUri,
        name: filename || "product.jpg",
        type,
      } as any);

      const { data } = await instance.post(
        `/products/image/${productId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("✅ Product image uploaded:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Product Image Upload Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Ürün resmini getir
  getProductImage: async (filename: string) => {
    try {
      const { data } = await instance.get(`/products/image/${filename}`);
      console.log("✅ Product image fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Product Image Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

export const petSitterApi = {
  // Pet Sitter profili oluştur
  createProfile: async (profileData: any) => {
    try {
      const { data } = await instance.post(
        "/petsitter/add/profile",
        profileData,
      );
      console.log("✅ Pet sitter profile created:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Create Pet Sitter Profile Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  updatePetSitterProfile: async (profileData: any) => {
    try {
      const { data } = await instance.put("/petsitter/profile", profileData);
      console.log("✅ Pet sitter profile updated:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Update Pet Sitter Profile Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
  // Pet Shop profilini getir
  getProfile: async () => {
    try {
      const { data } = await instance.get("/petsitter/profile");
      console.log("✅ Pet sitter profile fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Pet Sitter Profile Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Pet Shop logo yükle
  uploadLogo: async (imageUri: string) => {
    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("petsitterprofile", {
        uri: imageUri,
        name: filename || "petsitter-logo.jpg",
        type,
      } as any);

      const { data } = await instance.post(
        "/petsitter/add/profile/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("✅ Pet sitter logo uploaded:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Pet Sitter Logo Upload Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Pet Shop logo sil
  deleteLogo: async () => {
    try {
      const { data } = await instance.delete("/petsitter/profile/image");
      console.log("✅ Pet sitter logo deleted:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Delete Pet Sitter Logo Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

// Pet Sitter Service API
export const petSitterServiceApi = {
  // Hizmet kategorilerini getir
  getCategories: async () => {
    try {
      const { data } = await instance.get("/petsitterservices/categories");
      console.log("✅ Pet sitter service categories fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Pet Sitter Service Categories Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Kullanıcının hizmetlerini getir
  getMyServices: async (
    page: number = 1,
    limit: number = 10,
    categoryId?: string,
    status?: boolean,
  ) => {
    try {
      const params: any = { page, limit };
      if (categoryId) params.categoryId = categoryId;
      if (status !== undefined) params.status = status;

      const { data } = await instance.get("/petsitterservices/my-services", {
        params,
      });
      console.log("✅ My pet sitter services fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get My Pet Sitter Services Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Yeni hizmet ekle
  addService: async (serviceData: any) => {
    try {
      const { data } = await instance.post(
        "/petsitterservices/add-service",
        serviceData,
      );
      console.log("✅ Pet sitter service added:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Add Pet Sitter Service Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Hizmet güncelle
  updateService: async (id: string, serviceData: any) => {
    try {
      const { data } = await instance.put(
        `/petsitterservices/update-service/${id}`,
        serviceData,
      );
      console.log("✅ Pet sitter service updated:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Update Pet Sitter Service Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Hizmet detayını getir
  getServiceById: async (id: string) => {
    try {
      const { data } = await instance.get(`/petsitterservices/service/${id}`);
      console.log("✅ Pet sitter service detail fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Pet Sitter Service Detail Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Hizmet sil
  deleteService: async (id: string) => {
    try {
      const { data } = await instance.delete(
        `/petsitterservices/service/${id}`,
      );
      console.log("✅ Pet sitter service deleted:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Delete Pet Sitter Service Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Hizmet durumu güncelle (aktif/pasif)
  toggleServiceStatus: async (id: string, status: boolean) => {
    try {
      const { data } = await instance.patch(
        `/petsitterservices/toggle-status/${id}`,
        { status },
      );
      console.log("✅ Pet sitter service status updated:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Toggle Pet Sitter Service Status Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

// Pet Otel API
export const petOtelApi = {
  // Pet Otel profili oluştur
  createProfile: async (profileData: any) => {
    try {
      const { data } = await instance.post("/petotel/add/profile", profileData);
      console.log("✅ Pet otel profile created:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Create Pet Otel Profile Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  updatePetOtelProfile: async (profileData: any) => {
    try {
      const { data } = await instance.put("/petotel/profile", profileData);
      console.log("✅ Pet otel profile updated:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Update Pet Otel Profile Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
  // Pet Otel profilini getir
  getProfile: async () => {
    try {
      const { data } = await instance.get("/petotel/profile");
      console.log("✅ Pet otel profile fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Pet Otel Profile Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Pet Otel logo yükle
  uploadLogo: async (imageUri: string) => {
    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("pethotelprofile", {
        uri: imageUri,
        name: filename || "petotel-logo.jpg",
        type,
      } as any);

      const { data } = await instance.post(
        "/petotel/add/profile/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("✅ Pet otel logo uploaded:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Pet Otel Logo Upload Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Pet Otel logo sil
  deleteLogo: async () => {
    try {
      const { data } = await instance.delete("/petotel/profile/logo");
      console.log("✅ Pet otel logo deleted:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Delete Pet Otel Logo Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

// Pet Otel Service API
export const petOtelServiceApi = {
  // Hizmet kategorilerini getir
  getCategories: async () => {
    try {
      const { data } = await instance.get("/petotelservices/categories");
      console.log("✅ Pet otel service categories fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Pet Otel Service Categories Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Kullanıcının hizmetlerini getir
  getMyServices: async () => {
    try {
      const { data } = await instance.get("/petotelservices/my-services");
      console.log("✅ My pet otel services fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get My Pet Otel Services Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Yeni hizmet ekle
  addService: async (category_id: string) => {
    try {
      const { data } = await instance.post("/petotelservices/add", {
        category_id,
      });
      console.log("✅ Pet otel service added:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Add Pet Otel Service Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Hizmet detayını getir
  getServiceById: async (id: string) => {
    try {
      const { data } = await instance.get(`/petotelservices/service/${id}`);
      console.log("✅ Pet otel service detail fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Pet Otel Service Detail Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Hizmet sil
  deleteService: async (id: string) => {
    try {
      const { data } = await instance.delete(`/petotelservices/service/${id}`);
      console.log("✅ Pet otel service deleted:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Delete Pet Otel Service Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Hizmet durumu güncelle (aktif/pasif)
  toggleServiceStatus: async (id: string, status: boolean) => {
    try {
      const { data } = await instance.patch(
        `/petotelservices/toggle-status/${id}`,
        { status },
      );
      console.log("✅ Pet otel service status updated:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Toggle Pet Otel Service Status Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

// Pet Clinic API
export const petClinicApi = {
  // Pet Clinic profili oluştur
  createProfile: async (profileData: any) => {
    try {
      const { data } = await instance.post(
        "/petclinic/add/profile",
        profileData,
      );
      console.log("✅ Pet clinic profile created:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Create Pet Clinic Profile Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  updatePetClinicProfile: async (profileData: any) => {
    try {
      const { data } = await instance.put("/petclinic/profile", profileData);
      console.log("✅ Pet clinic profile updated:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Update Pet Clinic Profile Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
  // Pet Clinic profilini getir
  getProfile: async () => {
    try {
      const { data } = await instance.get("/petclinic/profile");
      console.log("✅ Pet clinic profile fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Pet Clinic Profile Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Pet Clinic logo yükle
  uploadLogo: async (imageUri: string) => {
    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("petclinicprofile", {
        uri: imageUri,
        name: filename || "petclinic-logo.jpg",
        type,
      } as any);

      const { data } = await instance.post(
        "/petclinic/add/profile/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("✅ Pet clinic logo uploaded:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Pet Clinic Logo Upload Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Pet Clinic logo sil
  deleteLogo: async () => {
    try {
      const { data } = await instance.delete("/petclinic/profile/logo");
      console.log("✅ Pet clinic logo deleted:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Delete Pet Shop Logo Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

// Pet Clinic Service API
export const petClinicServiceApi = {
  // Hizmet kategorilerini getir
  getCategories: async () => {
    try {
      const { data } = await instance.get("/petclinicservices/categories");
      console.log("✅ Pet clinic service categories fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Pet Clinic Service Categories Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Kullanıcının hizmetlerini getir
  getMyServices: async () => {
    try {
      const { data } = await instance.get("/petclinicservices/my-services");
      console.log("✅ My pet clinic services fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get My Pet Clinic Services Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Yeni hizmet ekle
  addService: async (category_id: string) => {
    try {
      const { data } = await instance.post("/petclinicservices/add", {
        category_id,
      });
      console.log("✅ Pet clinic service added:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Add Pet Clinic Service Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Hizmet detayını getir
  getServiceById: async (id: string) => {
    try {
      const { data } = await instance.get(`/petclinicservices/service/${id}`);
      console.log("✅ Pet clinic service detail fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Pet Clinic Service Detail Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Hizmet sil
  deleteService: async (id: string) => {
    try {
      const { data } = await instance.delete(
        `/petclinicservices/service/${id}`,
      );
      console.log("✅ Pet clinic service deleted:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Delete Pet Clinic Service Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Hizmet durumu güncelle (aktif/pasif)
  toggleServiceStatus: async (id: string, status: boolean) => {
    try {
      const { data } = await instance.patch(
        `/petclinicservices/toggle-status/${id}`,
        { status },
      );
      console.log("✅ Pet clinic service status updated:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Toggle Pet Clinic Service Status Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

// Pet Clinic Doctors API
export const petClinicDoctorsApi = {
  // Yeni doktor ekle
  addDoctor: async (doctorData: any) => {
    try {
      const { data } = await instance.post("/petclinicdoctors/add", doctorData);
      console.log("✅ Doctor added:", data);
      return data;
    } catch (error: any) {
      console.log("Add Doctor Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Doktorları listele (gender filtresi ile)
  getMyDoctors: async (gender?: "male" | "female") => {
    try {
      const params: any = {};
      if (gender) params.gender = gender;

      const { data } = await instance.get("/petclinicdoctors/my-list", {
        params,
      });
      console.log("✅ My doctors fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get My Doctors Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Doktor detayını getir
  getDoctorDetail: async (id: string) => {
    try {
      const { data } = await instance.get(`/petclinicdoctors/detail/${id}`);
      console.log("✅ Doctor detail fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Doctor Detail Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Doktor güncelle
  updateDoctor: async (id: string, doctorData: any) => {
    try {
      const { data } = await instance.put(
        `/petclinicdoctors/update/${id}`,
        doctorData,
      );
      console.log("✅ Doctor updated:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Update Doctor Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Doktor sil
  deleteDoctor: async (id: string) => {
    try {
      const { data } = await instance.delete(`/petclinicdoctors/delete/${id}`);
      console.log("✅ Doctor deleted:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Delete Doctor Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Doktor resmi yükle
  uploadDoctorImage: async (doctorId: string, imageUri: string) => {
    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("clinic_veterinarians", {
        uri: imageUri,
        name: filename || "doctor.jpg",
        type,
      } as any);

      const { data } = await instance.post(
        `/petclinicdoctors/image/${doctorId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("✅ Doctor image uploaded:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Doctor Image Upload Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

export const bannerApi = {
  // Banner'ları getir
  getBanners: async () => {
    try {
      const { data } = await instance.get("/home/banners");
      console.log("✅ Banners fetched:", data);
      return data;
    } catch (error: any) {
      console.log("Get Banners Error:", error.response?.data || error.message);
      throw error;
    }
  },
};

export const homeApi = {
  // Ana sayfa için öne çıkan ürünler
  getFeaturedProducts: async () => {
    try {
      const { data } = await instance.get("/home/featured-products");
      console.log("✅ Featured products fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Featured Products Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Tüm ürünler - Sayfalama desteği ile
  getAllProducts: async (page: number = 1, limit: number = 10) => {
    try {
      const { data } = await instance.get("/home/featured-products", {
        params: { page, limit },
      });
      console.log(`✅ All products fetched (page ${page}):`, data);
      return data;
    } catch (error: any) {
      console.log(
        "Get All Products Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Ana sayfa için klinik listesi
  getClinicsForHome: async () => {
    try {
      const { data } = await instance.get("/home/clinics");
      console.log("✅ Clinics fetched:", data);
      return data;
    } catch (error: any) {
      console.log("Get Clinics Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Ana sayfa için kayıp hayvanlar
  getLostPets: async () => {
    try {
      const { data } = await instance.get("/home/lost-pets");
      console.log("✅ Lost pets fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Lost Pets Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Klinik detayı getir
  getClinicDetail: async (id: string) => {
    try {
      const { data } = await instance.get(`/home/clinic/${id}`);
      console.log("✅ Clinic detail fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Clinic Detail Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Ana sayfa için otel listesi
  getHotelsForHome: async () => {
    try {
      const { data } = await instance.get("/home/hotels");
      console.log("✅ Hotels fetched:", data);
      return data;
    } catch (error: any) {
      console.log("Get Hotels Error:", error.response?.data || error.message);
      throw error;
    }
  },
  // Otel detayı getir
  getHotelDetail: async (id: string) => {
    try {
      const { data } = await instance.get(`/home/hotel/${id}`);
      console.log("✅ Hotel detail fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Hotel Detail Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
  // Otel hizmetlerini getir
  getHotelServices: async (id: string) => {
    try {
      const { data } = await instance.get(`/home/hotel/${id}/services`);
      console.log("✅ Hotel services fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Hotel Services Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
  // Ana sayfa için pet shop listesi
  getPetShopsForHome: async () => {
    try {
      const { data } = await instance.get("/home/shops");
      console.log("✅ Pet shops fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Pet Shops Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Shop detayı getir
  getShopDetail: async (id: string) => {
    try {
      const { data } = await instance.get(`/home/shop/${id}`);
      console.log("✅ Shop detail fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Shop Detail Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Shop ürünlerini getir
  getShopProducts: async (shopId: string) => {
    try {
      const { data } = await instance.get(`/home/shops/${shopId}/products`);
      console.log("✅ Shop products fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Shop Products Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Ana sayfa için bakıcı listesi
  getSittersForHome: async () => {
    try {
      const { data } = await instance.get("/home/sitters");
      console.log("✅ Sitters fetched:", data);
      return data;
    } catch (error: any) {
      console.log("Get Sitters Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Sitter detayı getir
  getSitterDetail: async (id: string) => {
    try {
      const { data } = await instance.get(`/home/sitter/${id}`);
      console.log("✅ Sitter detail fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Sitter Detail Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Kliniğin doktorlarını getir
  getClinicDoctors: async (clinicId: string) => {
    try {
      const { data } = await instance.get(`/home/clinic/${clinicId}/doctors`);
      console.log("✅ Clinic doctors fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Clinic Doctors Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Doktor detayını getir
  getDoctorDetail: async (clinicId: string, doctorId: string) => {
    try {
      const { data } = await instance.get(
        `/home/clinic/${clinicId}/doctor/${doctorId}`,
      );
      console.log("✅ Doctor detail fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Doctor Detail Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Kliniğin hizmetlerini getir
  getClinicServices: async (clinicId: string) => {
    try {
      const { data } = await instance.get(`/home/clinic/${clinicId}/services`);
      console.log("✅ Clinic services fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Clinic Services Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Sitter'ın hizmetlerini getir
  getSitterServices: async (sitterId: string) => {
    try {
      const { data } = await instance.get(`/home/sitter/${sitterId}/services`);
      console.log("✅ Sitter services fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Sitter Services Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

// Map API
export const mapApi = {
  // Yakındaki tüm ilanları ve profilleri getir
  getNearbyItems: async (
    latitude: number,
    longitude: number,
    radius?: number,
    types?: string,
  ) => {
    try {
      let url = `/map/nearby?latitude=${latitude}&longitude=${longitude}`;

      // Radius belirtilmişse ekle (metre cinsinden)
      if (radius) {
        url += `&radius=${radius}`;
      }

      // Types belirtilmişse ekle (comma separated: adoption,lost_pet,clinic,hotel,shop)
      if (types) {
        url += `&types=${types}`;
      }

      const { data } = await instance.get(url);
      console.log("✅ Nearby map items fetched:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Get Nearby Map Items Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

// Order API
export const orderApi = {
  // Sepetten sipariş oluştur
  createOrder: async (
    userId: string,
    cartItems: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>,
    deliveryType: "delivery" | "pickup",
    address?: string,
  ) => {
    try {
      const requestData = {
        userId,
        cartItems,
        deliveryType,
        address: deliveryType === "delivery" ? address : undefined,
      };

      const { data } = await instance.post("/orders/create", requestData);
      console.log("✅ Orders created:", data);
      return data;
    } catch (error: any) {
      console.log("Create Order Error:", error.response?.data || error.message);
      throw error;
    }
  },
};

// Favorites API
export type FavoriteType =
  | "product"
  | "pet_shop"
  | "pet_sitter"
  | "pet_clinic"
  | "pet_hotel";

export const favoritesApi = {
  // Favori toggle (ekle/kaldır)
  toggle: async (favorite_type: FavoriteType, target_id: string) => {
    try {
      const { data } = await instance.post("/favorites/toggle", {
        favorite_type,
        target_id,
      });
      return data;
    } catch (error: any) {
      console.log(
        "Favorites Toggle Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Kullanıcının favorilerini listele (opsiyonel tip filtresi)
  getMyFavorites: async (favorite_type?: FavoriteType) => {
    try {
      const params: any = {};
      if (favorite_type) params.favorite_type = favorite_type;
      const { data } = await instance.get("/favorites", { params });
      return data;
    } catch (error: any) {
      console.log(
        "Get Favorites Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Tek öğenin favori durumunu kontrol et
  checkStatus: async (favorite_type: FavoriteType, target_id: string) => {
    try {
      const { data } = await instance.get(
        `/favorites/check/${favorite_type}/${target_id}`,
      );
      return data;
    } catch (error: any) {
      console.log(
        "Check Favorite Status Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Öğenin toplam favori sayısını getir
  getCount: async (favorite_type: FavoriteType, target_id: string) => {
    try {
      const { data } = await instance.get(
        `/favorites/counts/${favorite_type}/${target_id}`,
      );
      return data;
    } catch (error: any) {
      console.log(
        "Get Favorite Count Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

// Payment API
export const paymentApi = {
  initializePayment: async (userId: string, orderIds: string[]) => {
    try {
      const { data } = await instance.post("/payments/initialize", {
        userId,
        orderIds,
      });
      console.log("✅ Payment initialized:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Payment Initialize Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};

// Reviews API
export type ReviewType =
  | "pet_shop"
  | "product"
  | "pet_sitter"
  | "pet_clinic"
  | "pet_hotel";

export type ReportReason =
  | "spam"
  | "inappropriate"
  | "fake"
  | "offensive"
  | "other";

export const reviewsApi = {
  // Bir hedefe ait yorumları getir
  getReviews: async (
    reviewType: ReviewType,
    targetId: string,
    page = 1,
    limit = 10,
  ) => {
    try {
      const { data } = await instance.get(
        `/reviews/${reviewType}/${targetId}`,
        { params: { page, limit } },
      );
      return data;
    } catch (error: any) {
      console.log("Get Reviews Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Yorum oluştur
  createReview: async (payload: {
    review_type: ReviewType;
    target_id: string;
    rating: number;
    comment: string;
  }) => {
    try {
      const { data } = await instance.post("/reviews", payload);
      console.log("✅ Review created:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Create Review Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Kendi yorumunu sil
  deleteReview: async (reviewId: string) => {
    try {
      const { data } = await instance.delete(`/reviews/${reviewId}`);
      console.log("✅ Review deleted:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Delete Review Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Yoruma cevap ver
  replyToReview: async (
    reviewId: string,
    reply_text: string,
    role_type?: string,
  ) => {
    try {
      const { data } = await instance.post(`/reviews/${reviewId}/reply`, {
        reply_text,
        role_type,
      });
      console.log("✅ Reply added:", data);
      return data;
    } catch (error: any) {
      console.log("Reply Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Kendi cevabını sil
  deleteReply: async (reviewId: string, replyId: string) => {
    try {
      const { data } = await instance.delete(
        `/reviews/${reviewId}/reply/${replyId}`,
      );
      console.log("✅ Reply deleted:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Delete Reply Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Yorumu şikayet et
  reportReview: async (
    reviewId: string,
    reason: ReportReason,
    description?: string,
  ) => {
    try {
      const { data } = await instance.post(`/reviews/${reviewId}/report`, {
        reason,
        description,
      });
      console.log("✅ Review reported:", data);
      return data;
    } catch (error: any) {
      console.log(
        "Report Review Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Birden fazla hedef için toplu puan istatistiği
  getBulkRatings: async (
    reviewType: ReviewType,
    ids: string[],
  ): Promise<{ data: Record<string, { average: number; total: number }> }> => {
    try {
      const { data } = await instance.get(
        `/reviews/bulk-stats/${reviewType}`,
        { params: { ids: ids.join(",") } },
      );
      return data.data ?? { data: {} };
    } catch (error: any) {
      console.log(
        "getBulkRatings Error:",
        error.response?.data || error.message,
      );
      return { data: {} };
    }
  },
};
