import { Slot } from "expo-router";
import "../../global.css";
import { AuthProvider } from "../providers/AuthProvider";
import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import { COLORS } from "../styles/theme/color";

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background, // tüm proje arka plan rengi
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={MyTheme}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </ThemeProvider>
  );
}
