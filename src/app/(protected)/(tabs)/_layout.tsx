import { Tabs } from "expo-router";
import { useAuthStore } from "../../../stores";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { COLORS } from "../../../styles/theme/color";

export default function TabsLayout() {
  const { user } = useAuthStore();
  const roleType = user?.role_type;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        headerShown: false,
        animation: "fade",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderRadius: 100,
          marginVertical: 30,
          marginHorizontal: 20,
          paddingTop: 8,
          height: 75,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -3 },
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      {/* Ana Sayfa */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          href: roleType === "pet_owner" ? undefined : null,
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />

      {/* İlanlar */}
      <Tabs.Screen
        name="listings"
        options={{
          title: "İlanlar",
          href: roleType === "pet_owner" ? undefined : null,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="pets" size={24} color={color} />
          ),
        }}
      />

      {/* Harita */}
      <Tabs.Screen
        name="map"
        options={{
          title: "Harita",
          href: roleType === "pet_owner" ? undefined : null,
          tabBarIcon: ({ color }) => (
            <Feather name="map" size={24} color={color} />
          ),
        }}
      />

      {/* Ürünler */}
      <Tabs.Screen
        name="products"
        options={{
          title: "Ürünler",
          href: roleType === "pet_shop" ? undefined : null,
          tabBarIcon: ({ color }) => (
            <Feather name="shopping-bag" size={24} color={color} />
          ),
        }}
      />

      {/* Veterinerler */}
      <Tabs.Screen
        name="doctors"
        options={{
          title: "Veterinerler",
          href: roleType === "pet_clinic" ? undefined : null,
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="user-md" size={24} color={color} />
          ),
        }}
      />

      {/* Hizmetler */}
      <Tabs.Screen
        name="services"
        options={{
          title: "Hizmetler",
          href:
            roleType === "pet_clinic" ||
            roleType === "pet_sitter" ||
            roleType === "pet_hotel"
              ? undefined
              : null,
          tabBarIcon: ({ color }) => (
            <Feather name="briefcase" size={24} color={color} />
          ),
        }}
      />

      {/* Mesajlar */}
      <Tabs.Screen
        name="messages"
        options={{
          title: "Mesajlar",
          tabBarIcon: ({ color }) => (
            <Feather name="message-circle" size={24} color={color} />
          ),
        }}
      />

      {/* Profil */}
      <Tabs.Screen
        name="profiles"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
