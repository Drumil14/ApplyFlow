import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./stores/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      colors: {
        ink: "#07090d",
        surface: "#0b0f17",
        panel: "#10141f",
        muted: "#8a93a6",
        line: "rgba(255,255,255,0.09)",
        brand: "#7cf7d4",
        violet: "#a78bfa",
        amber: "#f4c66a",
        rose: "#fb7185"
      },
      boxShadow: {
        panel: "0 20px 80px rgba(0, 0, 0, 0.35)",
        glow: "0 0 50px rgba(124, 247, 212, 0.16)"
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        shimmer: "shimmer 1.6s infinite"
      }
    }
  },
  plugins: []
};

export default config;
