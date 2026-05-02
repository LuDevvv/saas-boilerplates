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
      colors: {
        primary: {
          DEFAULT: "var(--primary, #004080)",
          50: "var(--primary-50, #F1F5F9)",
          100: "var(--primary-100, #E2E8F0)",
          200: "var(--primary-200, #CBD5E1)",
          300: "var(--primary-300, #94A3B8)",
          400: "var(--primary-400, #64748B)",
          500: "var(--primary, #004080)",
          600: "var(--primary-600, #003366)",
          700: "var(--primary-700, #00264d)",
          800: "var(--primary-800, #001a33)",
          900: "var(--primary-900, #000d1a)",
          950: "var(--primary-950, #000000)",
        },
        secondary: {
          DEFAULT: "var(--secondary, #00E6E6)",
        },
        accent: {
          DEFAULT: "var(--accent, #4D94DB)",
        },
        canvas: "var(--canvas, #F8FAFC)",
        surface: "var(--surface, #FFFFFF)",

        /* Radix/Shadcn UI Base mappings */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        /* Functional Status Colors for UI Components (Badges, Alerts, Toasts) */
        success: {
          DEFAULT: "var(--status-success, #10B981)",
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          900: "#14532d",
        },
        warning: {
          DEFAULT: "var(--status-warning, #F59E0B)",
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          900: "#78350f",
        },
        danger: {
          DEFAULT: "var(--status-error, #EF4444)",
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          900: "#7f1d1d",
        },
        info: {
          DEFAULT: "var(--status-info, #3B82F6)",
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          900: "#1e3a8a",
        },
      },
      fontWeight: {
        label: "var(--font-weight-label)",
        heading: "var(--font-weight-heading)",
        body: "var(--font-weight-body)",
        medium: "var(--font-weight-medium)",
        kpi: "var(--font-weight-kpi)",
        black: "var(--font-weight-black)",
      },
      borderRadius: {
        /* Updated Hyper-Rounded Scale matching index.css */
        sm: "var(--radius-sm, 6px)",
        md: "var(--radius-md, 10px)",
        lg: "var(--radius-lg, 16px)",
        xl: "var(--radius-xl, 20px)",
        "2xl": "var(--radius-2xl, 24px)",
        "3xl": "var(--radius-3xl, 32px)",
        hero: "var(--radius-hero, 40px)",
      },
      boxShadow: {
        /* Tinted Premium Shadows */
        premium: "0 4px 14px 0 rgba(0, 64, 128, 0.2)",
        "premium-hover": "0 6px 20px rgba(0, 64, 128, 0.3)",
        bento: "0 4px 20px -4px rgba(0, 64, 128, 0.03)",
        "bento-hover": "0 8px 30px -4px rgba(0, 64, 128, 0.06)",
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