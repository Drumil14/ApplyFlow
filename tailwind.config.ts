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
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"]
      },
      // Type scale with optical, size-specific tracking + leading (Apple §15).
      // Large sizes get negative tracking; small sizes stay near 0 / slightly positive.
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.01em" }],
        xs: ["0.75rem", { lineHeight: "1.125rem", letterSpacing: "0.005em" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem", letterSpacing: "0" }],
        base: ["0.875rem", { lineHeight: "1.5rem", letterSpacing: "0" }],
        md: ["0.9375rem", { lineHeight: "1.5rem", letterSpacing: "-0.006em" }],
        lg: ["1.0625rem", { lineHeight: "1.5rem", letterSpacing: "-0.01em" }],
        xl: ["1.25rem", { lineHeight: "1.625rem", letterSpacing: "-0.016em" }],
        "2xl": ["1.5rem", { lineHeight: "1.875rem", letterSpacing: "-0.02em" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.023em" }],
        "4xl": ["2.375rem", { lineHeight: "2.625rem", letterSpacing: "-0.028em" }],
        "5xl": ["3rem", { lineHeight: "3.125rem", letterSpacing: "-0.032em" }]
      },
      colors: {
        // Semantic tokens (preferred). rgb(var / <alpha-value>) enables the
        // /opacity modifier on every token.
        canvas: {
          DEFAULT: "rgb(var(--bg) / <alpha-value>)",
          subtle: "rgb(var(--bg-subtle) / <alpha-value>)"
        },
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          hover: "rgb(var(--surface-hover) / <alpha-value>)",
          inset: "rgb(var(--line) / 0.03)"
        },
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        hairline: {
          DEFAULT: "rgb(var(--line) / 0.08)",
          strong: "rgb(var(--line) / 0.15)"
        },
        content: {
          DEFAULT: "rgb(var(--text) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--text-tertiary) / <alpha-value>)"
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          hover: "rgb(var(--accent-hover) / <alpha-value>)",
          fg: "rgb(var(--accent-fg) / <alpha-value>)"
        },
        status: {
          neutral: "rgb(var(--status-neutral) / <alpha-value>)",
          amber: "rgb(var(--status-amber) / <alpha-value>)",
          blue: "rgb(var(--status-blue) / <alpha-value>)",
          violet: "rgb(var(--status-violet) / <alpha-value>)",
          green: "rgb(var(--status-green) / <alpha-value>)",
          rose: "rgb(var(--status-rose) / <alpha-value>)"
        },

        // Legacy keys — repointed to tokens so untouched surfaces degrade
        // gracefully (no glow soup) until they're redesigned.
        ink: "rgb(var(--bg) / <alpha-value>)",
        panel: "rgb(var(--surface) / <alpha-value>)",
        muted: "rgb(var(--text-tertiary) / <alpha-value>)",
        line: "rgb(var(--line) / 0.08)",
        brand: "rgb(var(--accent) / <alpha-value>)",
        violet: "rgb(var(--status-violet) / <alpha-value>)",
        amber: "rgb(var(--status-amber) / <alpha-value>)",
        rose: "rgb(var(--status-rose) / <alpha-value>)"
      },
      borderRadius: {
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem"
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        // Legacy names repointed to neutral elevation (no colored glow).
        panel: "var(--shadow-md)",
        glow: "var(--shadow-sm)"
      },
      ringColor: {
        DEFAULT: "var(--ring)"
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
