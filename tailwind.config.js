/** @type {import('tailwindcss').Config} */
import { COLORS } from './src/styles/theme/color';
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: COLORS.primary,
        background: COLORS.background,
        text: COLORS.text,
        border: COLORS.border,
        textLight: COLORS.textLight,
        card: COLORS.card,
        white: COLORS.white,
      },
    },
  },
  plugins: [],
}