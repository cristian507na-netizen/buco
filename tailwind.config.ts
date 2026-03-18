import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F0F0F",
        surface: "#1A1A1A",
        border: "#2A2A2A",
        primary: {
          DEFAULT: "#4F46E5", // Indigo
          hover: "#4338CA",
        },
        success: {
          DEFAULT: "#10B981", // Emerald
          hover: "#059669",
        },
        alert: {
          DEFAULT: "#EF4444", // Red
          hover: "#DC2626",
        },
        warning: {
          DEFAULT: "#F59E0B", // Amber
          hover: "#D97706",
        },
      },
      borderRadius: {
        xl: "1rem", // 16px
      },
    },
  },
  plugins: [],
};
export default config;
