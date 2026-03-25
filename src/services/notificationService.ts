import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { instance } from "../lib/api";

// Foreground'da uygulama açıkken gelen bildirimlerin davranışı
// expo-notifications ^0.29+ → shouldShowBanner + shouldShowList zorunlu
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  /**
   * İzin kontrolü + Expo Push Token alma.
   * Sadece fiziksel cihazda çalışır.
   */
  static async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log("⚠️ Push notifications sadece fiziksel cihazlarda çalışır");
        return null;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("❌ Bildirim izni verilmedi");
        return null;
      }

      // projectId, app.json → extra.eas.projectId'den okunmalı.
      // process.env Expo runtime'ında güvenilmez; Constants.expoConfig kullan.
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      if (!projectId) {
        throw new Error(
          "Expo projectId bulunamadı. app.json → extra.eas.projectId kontrol et."
        );
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log("✅ Push Token alındı:", tokenData.data);

      // Android notification kanalları (bildirim tipleri için)
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Genel",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF6B6B",
        });

        await Notifications.setNotificationChannelAsync("messages", {
          name: "Mesajlar",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF6B6B",
          sound: "default",
        });
      }

      return tokenData.data;
    } catch (error) {
      console.error("❌ Push notification kayıt hatası:", error);
      return null;
    }
  }

  /**
   * Token'ı backend'e kaydet (login sonrası çağrılır)
   */
  static async savePushTokenToBackend(token: string): Promise<boolean> {
    try {
      await instance.put("/profile/push-token", { push_token: token });
      console.log("✅ Push token backend'e kaydedildi");
      return true;
    } catch (error) {
      console.error("❌ Push token backend'e kaydedilemedi:", error);
      return false;
    }
  }

  /**
   * Token'ı backend'den sil (logout sırasında çağrılır)
   */
  static async removePushTokenFromBackend(): Promise<boolean> {
    try {
      await instance.delete("/profile/push-token");
      console.log("✅ Push token backend'den silindi");
      return true;
    } catch (error) {
      console.error("❌ Push token backend'den silinemedi:", error);
      return false;
    }
  }

  /**
   * Notification listener'larını kurar, cleanup fonksiyonu döner.
   * expo-notifications ^0.29+ → subscription.remove() kullanılmalı
   */
  static addNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (
      response: Notifications.NotificationResponse
    ) => void
  ) {
    const receivedSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📩 Bildirim alındı:", notification);
        onNotificationReceived?.(notification);
      });

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 Bildirime tıklandı:", response);
        onNotificationTapped?.(response);
      });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }

  static async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }

  static async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }
}
