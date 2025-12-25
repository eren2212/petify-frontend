# Profile Detail View Yapısı

Bu klasör, tüm profil tiplerinin (Klinik, Otel, Shop, Sitter) detay sayfaları için **ortak** ve **modular** bir yapı içerir.

## 📁 Yapı

```
components/profile/
├── ProfileDetailView.tsx          # ⭐ Ortak base component
├── petclinic/                     # Klinik sahibinin kendi profili
├── petotel/                       # Otel sahibinin kendi profili
├── petshop/                       # Shop sahibinin kendi profili
└── petsitter/                     # Sitter'ın kendi profili
```

```
app/(protected)/
├── clinics/[id].tsx               # 👁️ Klinik detay (ziyaretçi görünümü)
├── hotels/[id].tsx                # 👁️ Otel detay (ziyaretçi görünümü)
├── shops/[id].tsx                 # 👁️ Shop detay (ziyaretçi görünümü)
└── sitters/[id].tsx               # 👁️ Sitter detay (ziyaretçi görünümü)
```

## 🎯 Felsefe

### 1. **Ortak Base Component** (`ProfileDetailView.tsx`)
Tüm profil tipleri için ortak alanları render eder:
- Logo/Avatar
- İsim
- Açıklama
- İletişim bilgileri (telefon, email, website, instagram)
- Çalışma saatleri
- Adres ve harita
- Yol tarifi butonu

### 2. **Props ile Esneklik**
```tsx
<ProfileDetailView
  profileType="clinic"           // 'clinic' | 'hotel' | 'shop' | 'sitter'
  profileData={data}             // Ortak profil verileri
  editable={false}               // Düzenleme modu (kendi profilinde true)
  onEdit={() => router.push('/edit')}
  logoImagePath="/home/images/clinic-logo/"
  extraSections={
    // Profil tipine özel ekstra içerik
    <ClinicDoctorsList />
  }
/>
```

### 3. **Profil Tipine Özel Özelleştirmeler**
Her profil tipi için farklı:
- **Icon**: Klinik (medkit), Otel (home), Shop (storefront), Sitter (person)
- **Renk**: Her tip için farklı tema rengi
- **Extra Sections**: Profil tipine özel ekstra içerik

## 🔄 Kullanım Akışı

### Ziyaretçi Görünümü (Read-only)
```tsx
// /clinics/[id].tsx
export default function ClinicDetailScreen() {
  const { id } = useLocalSearchParams();
  const { data } = useClinicDetail(id);
  
  return (
    <ProfileDetailView
      profileType="clinic"
      profileData={data}
      editable={false}              // ❌ Düzenleme yok
      extraSections={<ClinicExtras />}
    />
  );
}
```

### Profil Sahibi Görünümü (Editable)
```tsx
// /(tabs)/(profile)/index.tsx - Klinik sahibi
export default function MyClinicProfile() {
  const { data } = useMyClinicProfile();
  
  return (
    <ProfileDetailView
      profileType="clinic"
      profileData={data}
      editable={true}               // ✅ Düzenleme var
      onEdit={() => router.push('/edit')}
      extraSections={<MyClinicManagement />}
    />
  );
}
```

## 🧩 Extra Sections Örnekleri

Her profil tipi için özel bölümler `extraSections` prop'u ile eklenir:

### Klinik
```tsx
<View>
  <DoctorsList clinicId={id} />
  <ServicesList clinicId={id} />
  <ReviewsList clinicId={id} />
</View>
```

### Otel
```tsx
<View>
  <RoomTypes hotelId={id} />
  <PricingTable hotelId={id} />
  <AmenitiesList hotelId={id} />
</View>
```

### Shop
```tsx
<View>
  <PopularProducts shopId={id} />
  <Categories shopId={id} />
</View>
```

### Sitter
```tsx
<View>
  <ExperienceSection sitterId={id} />
  <CertificatesList sitterId={id} />
  <HourlyRate sitterId={id} />
</View>
```

## 📊 Veri Yapısı

### BaseProfileData Interface
```typescript
interface BaseProfileData {
  id: string;
  name: string;                    // clinic_name, shop_name, hotel_name, sitter_name
  description?: string;
  logo_url?: string | null;
  address: string;
  latitude: number;
  longitude: number;
  phone_number: string;
  emergency_phone?: string;        // Sadece klinik/otel
  email?: string;
  website_url?: string;
  instagram_url?: string;
  working_hours?: Array<{
    day: string;
    hours: string;
  }>;
}
```

## 🎨 Tasarım Sistemi

Her profil tipi için özel renk ve icon:
```typescript
const profileConfig = {
  clinic: { icon: 'medkit', color: '#9333EA' },
  hotel:  { icon: 'home', color: '#FF6B6B' },
  shop:   { icon: 'storefront', color: '#4ECDC4' },
  sitter: { icon: 'person', color: '#95E1D3' },
};
```

## ✅ Avantajlar

1. **DRY (Don't Repeat Yourself)**: Ortak kod tek yerde
2. **Tutarlılık**: Tüm profiller aynı görünüm ve davranış
3. **Bakım Kolaylığı**: Bir değişiklik tüm profillere yansır
4. **Esneklik**: Props ile özelleştirme kolay
5. **Tip Güvenliği**: TypeScript ile tam destek

## 🚀 Sonraki Adımlar

1. ✅ Base component oluşturuldu
2. ✅ Detay sayfaları oluşturuldu
3. ⏳ API endpoint'leri eklenecek (public detail routes)
4. ⏳ Hook'lar yazılacak (useClinicDetail, useHotelDetail, vb.)
5. ⏳ Extra section component'leri yazılacak
6. ⏳ Mock data yerine gerçek API entegrasyonu

## 📝 Notlar

- Şu an tüm detay sayfaları **mock data** ile çalışıyor
- API entegrasyonu için hook'lar yazılacak
- Extra sections için ayrı component'ler oluşturulacak
- Profil sahibinin kendi profilinde `editable={true}` olacak

