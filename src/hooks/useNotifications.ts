import { useEffect, useRef, useState } from "react";
import { NotificationService } from "../services/notificationService";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";

/**
 * Push notification yönetimi için custom hook.
 *
 * @param isAuthenticated - Token kaydı ve silme sadece giriş yapılmışken çalışır.
 */
export const useNotifications = (isAuthenticated: boolean = false) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  // Token'ın zaten backend'e kaydedilip kaydedilmediğini takip et
  const registeredTokenRef = useRef<string | null>(null);

  // Auth durumu değiştiğinde token kayıt
  useEffect(() => {
    if (!isAuthenticated) {
      // Logout temizliği burada yapılmıyor.
      // authApi.logout() içinde DELETE /profile/push-token zaten çağrılıyor
      // ve auth token hâlâ geçerliyken siliniyor. Burada tekrar çağırmak
      // "Refresh token bulunamadı" hatasına neden olur.
      registeredTokenRef.current = null;
      setIsRegistered(false);
      setExpoPushToken(null);
      return;
    }

    // Kullanıcı giriş yaptı → push notification kaydı
    const registerPushNotifications = async () => {
      const token = await NotificationService.registerForPushNotifications();

      if (token) {
        setExpoPushToken(token);

        // Aynı token bu oturumda zaten kaydedildiyse tekrar gönderme
        if (registeredTokenRef.current === token) return;

        const success = await NotificationService.savePushTokenToBackend(token);
        if (success) {
          registeredTokenRef.current = token;
          setIsRegistered(true);
        }
      }
    };

    registerPushNotifications();
  }, [isAuthenticated]);

  // Notification listener'ları (auth durumundan bağımsız, uygulama açıkken)
  useEffect(() => {
    const cleanup = NotificationService.addNotificationListeners(
      // Foreground'da bildirim geldiğinde
      (notification) => {
        console.log("📱 Foreground bildirim:", notification);
      },
      // Bildirime tıklandığında
      (response) => {
        const data = response.notification.request.content.data as {
          type?: string;
          conversation_id?: string;
          pet_id?: string;
          vaccination_id?: string;
        };
        console.log("🔔 Bildirime tıklandı, data:", data);

        // Mesaj bildirimine tıklandıysa chat ekranına yönlendir
        if (data?.type === "NEW_MESSAGE" && data?.conversation_id) {
          router.push(`/(protected)/chat/${data.conversation_id}`);
        }

        // Aşı hatırlatıcısına tıklandıysa aşı detay sayfasına git
        if (data?.type === "VACCINATION_REMINDER" && data?.vaccination_id) {
          router.push(`/(protected)/pets/vaccination/${data.vaccination_id}`);
        }
      }
    );

    return () => {
      cleanup();
    };
  }, []);

  return {
    expoPushToken,
    isRegistered,
  };
};
