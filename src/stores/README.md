# Zustand Store Yapısı

Bu proje Zustand kullanarak state yönetimi yapmaktadır. Aşağıda store yapısı ve kullanım örnekleri bulunmaktadır.

## Store Yapısı

### 1. AuthStore (`authStore.ts`)

Kullanıcı kimlik doğrulama işlemlerini yönetir:

- Giriş/çıkış işlemleri
- Kullanıcı oturumu
- Yükleme durumları
- AsyncStorage ile kalıcı saklama

### 2. AppStore (`appStore.ts`)

Uygulama genelindeki ayarları yönetir:

- Tema (karanlık/açık mod)
- Dil ayarları
- Onboarding durumu
- İlk açılış kontrolü

### 3. UserStore (`userStore.ts`)

Kullanıcı profil bilgilerini yönetir:

- Profil bilgileri
- Profil güncelleme
- Profil yükleme durumları

## Kullanım

### Temel Kullanım

```tsx
import { useAuthStore, useAppStore, useUserStore } from '../stores';

// Component içinde
const MyComponent = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useAppStore();
  const { profile } = useUserStore();

  return (
    // JSX içeriği
  );
};
```

### Hook'lar ile Kullanım (Önerilen)

```tsx
import { useAuth, useAuthActions, useTheme } from '../stores/hooks';

const MyComponent = () => {
  const { user, isAuthenticated } = useAuth();
  const { signIn, signOut } = useAuthActions();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleLogin = async () => {
    const result = await signIn('email@example.com', 'password');
    if (result.error) {
      // Hata işleme
    }
  };

  return (
    // JSX içeriği
  );
};
```

### Tüm Store'lara Erişim

```tsx
import { useStores } from "../stores";

const MyComponent = () => {
  const { auth, app, user } = useStores();

  // auth.user, auth.signIn, app.isDarkMode, user.profile vb.
};
```

## Provider Kurulumu

Eski AuthProvider yerine ZustandAuthProvider kullanın:

```tsx
// _layout.tsx içinde
import { ZustandAuthProvider } from "../providers/ZustandAuthProvider";

export default function RootLayout() {
  return <ZustandAuthProvider>{/* Diğer componentler */}</ZustandAuthProvider>;
}
```

## Önemli Özellikler

### 1. Persist (Kalıcı Saklama)

- Auth ve App store'ları AsyncStorage ile kalıcı olarak saklanır
- Uygulama yeniden başlatıldığında veriler korunur

### 2. Type Safety

- Tüm store'lar TypeScript ile tip güvenliği sağlar
- Interface'ler export edilmiştir

### 3. Performance

- Hook'lar sadece ihtiyaç duyulan verileri seçer
- Gereksiz re-render'lar önlenir

### 4. Reset Functionality

- Çıkış yaparken tüm store'ları temizleyebilirsiniz:

```tsx
import { resetAllStores } from "../stores";

const handleLogout = () => {
  resetAllStores();
};
```

## Örnek Componentler

`examples.tsx` dosyasında kullanım örnekleri bulunmaktadır:

- AuthExample: Giriş/çıkış işlemleri
- ThemeExample: Tema değiştirme
- LanguageExample: Dil değiştirme
- UserProfileExample: Kullanıcı profili

## Migration (Eski AuthProvider'dan Geçiş)

1. Eski `useAuth` hook'larını `useAuth` ve `useAuthActions` ile değiştirin
2. `AuthProvider` yerine `ZustandAuthProvider` kullanın
3. Context API yerine Zustand store'larını kullanın

## Best Practices

1. **Hook'ları kullanın**: Direkt store'lara erişim yerine hook'ları tercih edin
2. **Selective subscription**: Sadece ihtiyacınız olan verileri seçin
3. **Actions'ları ayırın**: State ve actions'ları ayrı hook'larda kullanın
4. **Type safety**: TypeScript tiplerini kullanın
5. **Error handling**: Async işlemlerde hata yönetimini unutmayın



