import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        volt: "#CCFF00",
        "volt-glow": "#CCFF0033",
        hyperpink: "#F43F5E",
        "hyperpink-glow": "#F43F5E33",
        background: "var(--background)",
        foreground: "var(--foreground)",
        kinetic: {
          dark: "#09090B",
          card: "rgba(24, 24, 27, 0.8)",
          border: "rgba(39, 39, 42, 0.8)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
