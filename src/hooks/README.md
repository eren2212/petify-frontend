# Custom Hooks Yapısı

Bu klasör, Zustand store'larını kullanmak için özel hook'ları içerir. Her hook kategorisi ayrı dosyalarda organize edilmiştir.

## 📁 Dosya Yapısı

```
hooks/
├── index.ts          # Tüm hook'ları export eden ana dosya
├── useAuth.ts        # Authentication hook'ları
├── useApp.ts         # App state hook'ları
├── useUser.ts        # User profile hook'ları
├── useStores.ts      # Store management hook'ları
├── examples.tsx      # Kullanım örnekleri
└── README.md         # Bu dosya
```

## 🎯 Hook Kategorileri

### 1. Authentication Hooks (`useAuth.ts`)

```tsx
import { useAuth, useAuthActions, useAuthFull } from "../hooks";

// Sadece state'e erişim (performance için önerilen)
const { user, isAuthenticated, isLoading } = useAuth();

// Sadece action'lara erişim
const { signIn, signUp, signOut } = useAuthActions();

// Hem state hem action'lara erişim (tek hook)
const authFull = useAuthFull();
```

### 2. App State Hooks (`useApp.ts`)

```tsx
import { useTheme, useLanguage, useOnboarding, useAppLoading } from "../hooks";

// Tema yönetimi
const { isDarkMode, toggleDarkMode } = useTheme();

// Dil yönetimi
const { language, setLanguage } = useLanguage();

// Onboarding durumu
const { isFirstLaunch, setFirstLaunch } = useOnboarding();

// App loading durumu
const { isAppLoading, setAppLoading } = useAppLoading();
```

### 3. User Profile Hooks (`useUser.ts`)

```tsx
import { useUserProfile, useUserActions, useAuthUser } from "../hooks";

// Profil bilgileri
const { profile, isProfileLoading } = useUserProfile();

// Profil işlemleri
const { updateProfile, fetchProfile } = useUserActions();

// Auth + User birleşik veri
const { user, profile, fullUser } = useAuthUser();
```

### 4. Store Management Hooks (`useStores.ts`)

```tsx
import { useStores, useStoreReset } from "../hooks";

// Tüm store'lara erişim
const { auth, app, user } = useStores();

// Store reset işlemleri
const { resetAllStores, resetAuth } = useStoreReset();
```

## 💡 Kullanım Önerileri

### 1. Performance İçin Selective Subscription

```tsx
// ✅ İyi - Sadece ihtiyaç duyulan veriler
const { user } = useAuth();
const { isDarkMode } = useTheme();

// ❌ Kötü - Gereksiz re-render'lara sebep olur
const authFull = useAuthFull(); // Tüm auth state'i dinler
```

### 2. Action'ları Ayrı Kullanın

```tsx
// ✅ İyi - Action'lar ayrı hook'ta
const { user } = useAuth();
const { signOut } = useAuthActions();

// ❌ Kötü - Gereksiz state subscription
const { user, signOut } = useAuthFull();
```

### 3. Combined Hook'ları Dikkatli Kullanın

```tsx
// ✅ İyi - Gerçekten her ikisine de ihtiyaç varsa
const { user, profile, fullUser } = useAuthUser();

// ✅ Daha iyi - Sadece ihtiyaç duyulana göre
const { user } = useAuth();
const { profile } = useUserProfile();
```

## 🔧 Yeni Hook Ekleme

Yeni bir hook eklemek için:

1. İlgili dosyaya hook'u ekleyin
2. `index.ts`'de export edin
3. `examples.tsx`'e örnek ekleyin

```tsx
// useApp.ts'e yeni hook ekleme
export const useNotifications = () => {
  const { notifications, setNotifications } = useAppStore();
  return { notifications, setNotifications };
};

// index.ts'e export ekleme
export { useNotifications } from "./useApp";
```

## 📋 Hook Listesi

### Auth Hooks

- `useAuth()` - Auth state (user, isAuthenticated, isLoading)
- `useAuthActions()` - Auth actions (signIn, signUp, signOut)
- `useAuthFull()` - Hem state hem actions

### App Hooks

- `useTheme()` - Tema yönetimi
- `useLanguage()` - Dil yönetimi
- `useOnboarding()` - Onboarding durumu
- `useAppLoading()` - App loading durumu
- `useAppFull()` - Tüm app state ve actions

### User Hooks

- `useUserProfile()` - User profil state
- `useUserActions()` - User profil actions
- `useUserFull()` - Hem state hem actions
- `useAuthUser()` - Auth + User birleşik

### Store Hooks

- `useStores()` - Tüm store'lara erişim
- `useStoreReset()` - Store reset işlemleri

## 🎨 Örnek Kullanım

Detaylı örnekler için `examples.tsx` dosyasına bakın. Her hook kategorisi için ayrı örnek componentler bulunmaktadır.

## 🚀 Best Practices

1. **Selective Subscription**: Sadece ihtiyacınız olan verileri seçin
2. **Separate Concerns**: State ve action'ları ayrı hook'larda kullanın
3. **Type Safety**: TypeScript tiplerini kullanın
4. **Performance**: Gereksiz re-render'lardan kaçının
5. **Consistency**: Naming convention'lara uyun
