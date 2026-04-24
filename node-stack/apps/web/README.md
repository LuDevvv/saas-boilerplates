# Node Stack Marketing Site

High-performance marketing landing page built with Next.js 15, React 19, and Tailwind CSS.

## Features

- **Next.js 15 App Router**: Leveraging the latest features for speed and developer experience.
- **Shared UI System**: Uses components from `@node-stack/ui` for consistent branding across the monorepo.
- **SEO Optimized**: Fully configured Metadata API, OpenGraph tags, and automatic sitemap generation.
- **Waitlist Integration**: Functional signup form connected to the NestJS API.
- **Lighthouse Ready**: Optimized for core web vitals (LCP, CLS, FID).

## Getting Started

1. Install dependencies: `pnpm install`
2. Run development server: `pnpm dev`
3. Build for production: `pnpm build`

## Architecture

- `app/`: Next.js 15 App Router pages and layouts.
- `app/globals.css`: Global styles and Tailwind configuration.
- `@node-stack/ui`: Component library located in `packages/ui`.
