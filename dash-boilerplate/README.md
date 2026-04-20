# Dash Boilerplate

A high-performance, standalone dashboard boilerplate built with **React 18**, **Vite**, **TypeScript**, and **Tailwind CSS**.

## ✨ Features

- **Premium UI**: Crafted with high-end modern design tokens.
- **API-Agnostic**: Standard Axios client ready to connect to any backend.
- **Mock Strategy**: Built-in support for mock data using JSON files.
- **Auth Foundation**: Pre-built Login, Register, Password Reset, and Profile flows.
- **PWA Ready**: Offline support and installable out of the box.
- **Light/Dark Mode**: Perfected dark mode with glassmorphism effects.

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   Create a `.env` file:
   ```env
   VITE_SERVER_URL=http://your-api.com/v1
   VITE_USE_MOCKS=true
   ```

3. **Run development server**:
   ```bash
   pnpm dev
   ```

## 📁 Project Structure

- `src/components`: UI components and common elements.
- `src/services`: Data Fetching layer (extends `BaseService`).
- `src/stores`: State management with Zustand.
- `src/config`: App configuration (navigation, site info).
- `src/layouts`: Dashboard and Auth layouts.

## 🛠 Tech Stack

- **React Router 7**
- **Zustand** (State management)
- **Axios** (HTTP Client)
- **Lucide React** (Icons)
- **Framer Motion / GSAP** (Animations)
- **React Hook Form + Zod** (Validation)

## 🎨 Customization

Update `src/config/site-config.ts` to change the project name, logo, and core behavior.

---

Built by Antigravity (Advanced Agentic Coding team).
