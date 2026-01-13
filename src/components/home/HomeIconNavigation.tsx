import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type IconItem = {
  id: string;
  label: string;
  icon:
    | keyof typeof Ionicons.glyphMap
    | keyof typeof MaterialCommunityIcons.glyphMap;
  iconFamily: "ionicons" | "material";
  backgroundColor: string;
  onPress: () => void;
};

export const HomeIconNavigation = () => {
  const iconItems: IconItem[] = [
    {
      id: "Mağaza",
      label: "Mağaza",
      icon: "bag-handle",
      iconFamily: "ionicons",
      backgroundColor: "bg-orange-100",
      onPress: () => {
        // TODO: Shop sayfasına yönlendir
        console.log("Shop tıklandı");
      },
    },
    {
      id: "Veteriner",
      label: "Veteriner",
      icon: "medical",
      iconFamily: "ionicons",
      backgroundColor: "bg-teal-100",
      onPress: () => {
        // TODO: Vet/Doctors sayfasına yönlendir
        console.log("Vet tıklandı");
      },
    },
    {
      id: "Otel",
      label: "Otel",
      icon: "home",
      iconFamily: "ionicons",
      backgroundColor: "bg-blue-100",
      onPress: () => {
        // TODO: Hotel sayfasına yönlendir
        console.log("Hotel tıklandı");
      },
    },
    {
      id: "Bakıcı",
      label: "Bakıcı",
      icon: "paw",
      iconFamily: "ionicons",
      backgroundColor: "bg-purple-100",
      onPress: () => {
        // TODO: Sitter sayfasına yönlendir
        console.log("Sitter tıklandı");
      },
    },
    {
      id: "İlanlar",
      label: "İlanlar",
      icon: "heart",
      iconFamily: "ionicons",
      backgroundColor: "bg-red-100",
      onPress: () => {
        router.push("/(protected)/(tabs)/listings");
      },
    },
  ];

  const renderIcon = (item: IconItem) => {
    const iconColor =
      item.id === "Mağaza"
        ? "#F97316" // orange-500
        : item.id === "Veteriner"
          ? "#14B8A6" // teal-500
          : item.id === "Otel"
            ? "#3B82F6" // blue-500
            : item.id === "Bakıcı"
              ? "#A855F7" // purple-500
              : item.id === "İlanlar"
                ? "#FF0000" // pink-500
                : "#FF0000"; // pink-500 (İlanlar)

    if (item.iconFamily === "material") {
      return (
        <MaterialCommunityIcons
          name={item.icon as any}
          size={32}
          color={iconColor}
        />
      );
    }

    return <Ionicons name={item.icon as any} size={32} color={iconColor} />;
  };

  return (
    <View className="px-6 py-6 ">
      <View className="flex-row items-center justify-between bg-white/10">
        {iconItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={item.onPress}
            activeOpacity={0.7}
            className="items-center"
          >
            {/* Icon Container */}
            <View
              className={`w-16 h-16 rounded-3xl ${item.backgroundColor} items-center justify-center mb-2`}
            >
              {renderIcon(item)}
            </View>

            {/* Label */}
            <Text className="text-gray-700 text-sm font-medium">
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
