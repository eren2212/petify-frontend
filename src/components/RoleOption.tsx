import { View, Text, Modal, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Fontisto from "@expo/vector-icons/Fontisto";

import { COLORS } from "../styles/theme/color";
export const roles = [
  {
    id: "pet_owner",
    label: "Evcil Hayvan Sahibi",
    icon: <MaterialIcons name="pets" size={24} color={COLORS.text} />,
  },
  {
    id: "pet_shop",
    label: "Evcil Hayvan Dükkanı",
    icon: <AntDesign name="shop" size={24} color={COLORS.text} />,
  },
  {
    id: "pet_clinic",
    label: "Veteriner Kliniği",
    icon: <FontAwesome5 name="clinic-medical" size={22} color={COLORS.text} />,
  },
  {
    id: "pet_sitter",
    label: "Evcil Hayvan Bakıcısı",
    icon: (
      <MaterialCommunityIcons name="baby-buggy" size={26} color={COLORS.text} />
    ),
  },
  {
    id: "pet_hotel",
    label: "Evcil Hayvan Oteli",
    icon: <Fontisto name="hotel-alt" size={22} color={COLORS.text} />,
  },
];

interface RoleOptionProps {
  visible: boolean;
  onClose: () => void;
  selectedRole: string;
  onSelectRole: (role: string) => void;
}

export default function RoleOption({
  visible,
  onClose,
  selectedRole,
  onSelectRole,
}: RoleOptionProps) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-text/20">
        <View className="bg-card rounded-lg p-6 w-11/12 shadow-lg">
          <Text className="text-xl font-bold mb-4 text-text">
            Profilizi Seçin
          </Text>

          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              onPress={() => onSelectRole(role.id)}
              className={`flex-row items-center p-5 mb-3 border rounded-lg ${
                selectedRole === role.id
                  ? "border-primary bg-primary/10"
                  : "border-border"
              }`}
            >
              <Text className="text-2xl mr-3">{role.icon}</Text>
              <Text className="flex-1 text-base text-text">{role.label}</Text>
              <View
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedRole === role.id
                    ? "border-primary bg-primary"
                    : "border-border"
                }`}
              >
                {selectedRole === role.id && (
                  <View className="w-2 h-2 bg-white rounded-full m-auto" />
                )}
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={onClose}
            className="mt-4 bg-primary p-5 rounded-lg shadow"
          >
            <Text className="text-white text-center font-semibold">Tamam</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
