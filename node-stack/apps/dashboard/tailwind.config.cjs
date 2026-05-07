/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--primary-rgb) / <alpha-value>)",
          50: "rgb(var(--primary-rgb) / <alpha-value>)",
          100: "rgb(var(--primary-rgb) / <alpha-value>)",
          200: "rgb(var(--primary-rgb) / <alpha-value>)",
          300: "rgb(var(--primary-rgb) / <alpha-value>)",
          400: "rgb(var(--primary-rgb) / <alpha-value>)",
          500: "rgb(var(--primary-rgb) / <alpha-value>)",
          600: "var(--primary-600)",
          700: "var(--primary-600)",
          800: "var(--primary-600)",
          900: "var(--primary-600)",
          950: "var(--primary-600)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary-rgb) / <alpha-value>)",
          50: "rgb(var(--secondary-rgb) / <alpha-value>)",
          100: "rgb(var(--secondary-rgb) / <alpha-value>)",
          500: "rgb(var(--secondary-rgb) / <alpha-value>)",
          900: "rgb(var(--secondary-rgb) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "var(--accent)",
        },
        canvas: {
          DEFAULT: "var(--canvas)",
          dark: "var(--canvas)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          elevated: "var(--surface-elevated)",
          hover: "var(--surface-hover)",
          muted: "var(--surface-muted)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
          subtle: "var(--border-subtle)",
        },
        fg: {
          DEFAULT: "var(--text-primary)",
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          disabled: "var(--text-disabled)",
        },
        ring: {
          DEFAULT: "rgb(var(--ring-rgb) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-bg)",
          border: "var(--sidebar-border)",
          text: {
            DEFAULT: "var(--sidebar-text)",
            active: "var(--sidebar-text-active)",
          },
          active: "var(--sidebar-bg-active)",
        },
        success: {
          DEFAULT: "rgb(var(--status-success-rgb) / <alpha-value>)",
          50: "#f0fdf4",
          500: "rgb(var(--status-success-rgb) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--status-warning-rgb) / <alpha-value>)",
          50: "#fffbeb",
          500: "rgb(var(--status-warning-rgb) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--status-error-rgb) / <alpha-value>)",
          50: "#fef2f2",
          500: "rgb(var(--status-error-rgb) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--status-info-rgb) / <alpha-value>)",
          50: "#eff6ff",
          500: "rgb(var(--status-info-rgb) / <alpha-value>)",
        },
      },
      fontFamily: {
        geist: ["Geist Sans", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["monospace"],
      },
      fontWeight: {
        label: "400",
        heading: "700",
        body: "400",
        medium: "500",
        kpi: "700",
        black: "900",
      },
      spacing: {
        128: "32rem",
        144: "36rem",
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
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      boxShadow: {
        "inner-lg": "inset 0 2px 4px 0 rgb(0 0 0 / 0.1)",
        glow: "0 0 15px rgba(0, 64, 128, 0.2)",
        premium: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
        bento: "0 4px 20px -4px rgba(0, 0, 0, 0.03)",
        "bento-hover": "0 8px 30px -4px rgba(0, 0, 0, 0.06)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-cubic": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      transitionDuration: {
        400: "400ms",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "spin-reverse": {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "bounce-soft": {
          "0%, 100%": {
            transform: "translateY(-5%)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "bounce-subtle-delayed": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "slide-up-fade": {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "toast-enter": {
          "0%": { opacity: "0", transform: "translateY(-16px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "toast-exit": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.95)" },
        },
        "toast-progress": {
          "0%": { width: "100%" },
          "100%": { width: "0%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "fade-in-slow": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.2s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
        "spin-slow": "spin-slow 3s linear infinite",
        "spin-reverse": "spin-reverse 1s linear infinite",
        "pulse-soft": "pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-soft": "bounce-soft 1s infinite",
        "bounce-subtle": "bounce-subtle 4s ease-in-out infinite",
        "bounce-subtle-delayed": "bounce-subtle-delayed 4.5s ease-in-out infinite 1s",
        "slide-up-fade": "slide-up-fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "toast-enter": "toast-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "toast-exit": "toast-exit 0.3s cubic-bezier(0.65, 0, 0.35, 1) forwards",
        "toast-progress": "toast-progress var(--toast-duration, 5s) linear forwards",
        shimmer: "shimmer 2s infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
    require("@tailwindcss/typography"),
  ],
};