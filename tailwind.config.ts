import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(80, 230, 190, 0.12)",
        panel: "0 18px 70px rgba(0, 0, 0, 0.35)"
      },
      colors: {
        ink: "#07090d",
        panel: "#0d1119",
        line: "rgba(255,255,255,0.08)",
        mint: "#5df2c4",
        flame: "#ff8a5b"
      }
    }
  },
  plugins: []
};

export default config;
