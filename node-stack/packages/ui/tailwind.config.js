/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [], // Se mantiene vacío si este paquete se consume desde la app principal
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#7144F9",
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#7144F9",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
          950: "#2E1065",
        },
        secondary: {
          DEFAULT: "#06D3BE",
          50: "#F0FDFA",
          100: "#CCFBF1",
          500: "#06D3BE",
          900: "#134E4A",
        },
        accent: {
          DEFAULT: "#7CAEF5",
        },
        canvas: {
          DEFAULT: "#FFFFFF",
          dark: "#0A0A0A",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "rgba(255, 255, 255, 0.05)",
        },

        /* Radix/Shadcn UI Base mappings */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        /* Functional Status Colors */
        success: {
          DEFAULT: "#10B981",
          50: "#f0fdf4",
          500: "#10B981",
        },
        warning: {
          DEFAULT: "#F59E0B",
          50: "#fffbeb",
          500: "#f59e0b",
        },
        danger: {
          DEFAULT: "#EF4444",
          50: "#fef2f2",
          500: "#ef4444",
        },
        info: {
          DEFAULT: "#3B82F6",
          50: "#eff6ff",
          500: "#3b82f6",
        },
      },
      fontWeight: {
        label: "400",
        heading: "700",
        body: "400",
        medium: "500",
        kpi: "700",
        black: "900",
      },
      borderRadius: {
        input: "12px",
        button: "16px",
        card: "20px",
        hero: "32px",
        full: "9999px",
        /* Mapping standard tokens for compatibility */
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "32px",
        "6xl": "40px",
      },
      boxShadow: {
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        glow: "0 0 15px rgba(113, 68, 249, 0.2)",
        premium: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "slide-up-fade": {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up-fade": "slide-up-fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms")({ strategy: "class" }),
    require("@tailwindcss/typography"),
  ],
};