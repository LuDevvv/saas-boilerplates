import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Node Stack - High-Performance SaaS Boilerplate",
  description: "The ultimate monorepo boilerplate for building world-class SaaS applications with NestJS, Next.js, and Drizzle ORM.",
  openGraph: {
    title: "Node Stack - High-Performance SaaS Boilerplate",
    description: "Launch your SaaS in days, not months.",
    type: "website",
    locale: "en_US",
    url: "https://nodestack.dev",
    siteName: "Node Stack",
  },
  twitter: {
    card: "summary_large_image",
    title: "Node Stack - High-Performance SaaS Boilerplate",
    description: "Launch your SaaS in days, not months.",
  },
};

import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
