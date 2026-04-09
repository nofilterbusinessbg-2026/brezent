import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0F1117",
        surface: "#1A1D27",
        accent: "#F59E0B",
        income: "#10B981",
        expense: "#EF4444",
        bank: "#3B82F6",
        foreground: "#F8FAFC",
        muted: "#6B7280",
      },
    },
  },
  plugins: [],
};

export default config;

