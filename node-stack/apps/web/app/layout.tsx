import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import {
  OrganizationJsonLd,
  WebSiteJsonLd,
  SoftwareApplicationJsonLd,
} from "@/components/JsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nodestack.dev"),
  title: {
    default: "NodeStack — Production-Ready SaaS Boilerplate",
    template: "%s | NodeStack",
  },
  description:
    "Ship your SaaS in days with a production-ready NestJS + Next.js + Drizzle monorepo. RLS, 2FA, audit logs, billing, AI — all included.",
  keywords: [
    "saas boilerplate",
    "nestjs starter",
    "nextjs boilerplate",
    "drizzle orm",
    "typescript",
    "monorepo",
    "production ready",
  ],
  authors: [{ name: "NodeStack" }],
  creator: "NodeStack",
  publisher: "NodeStack",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nodestack.dev",
    siteName: "NodeStack",
    title: "NodeStack — Production-Ready SaaS Boilerplate",
    description: "Ship your SaaS in days, not months.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NodeStack Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NodeStack — Production-Ready SaaS Boilerplate",
    description: "Ship your SaaS in days, not months.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://nodestack.dev" },
  verification: { google: "REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_TOKEN" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <SoftwareApplicationJsonLd />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
