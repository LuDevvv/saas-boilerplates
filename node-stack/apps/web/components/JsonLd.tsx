/**
 * JSON-LD structured data components (server components — no "use client").
 *
 * Each component renders a <script type="application/ld+json"> tag that
 * search engines parse for rich results. Keep schemas in sync with the
 * content they describe; stale metadata is worse than none.
 */

// ---------------------------------------------------------------------------
// OrganizationJsonLd
// ---------------------------------------------------------------------------

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NodeStack",
    url: "https://nodestack.dev",
    logo: "https://nodestack.dev/logo.png",
    sameAs: [
      "https://github.com/nodestack",
      "https://twitter.com/nodestack",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@nodestack.dev",
      availableLanguage: ["English"],
    },
    description:
      "NodeStack is a production-ready SaaS boilerplate built on NestJS, Next.js, and Drizzle ORM.",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ---------------------------------------------------------------------------
// WebSiteJsonLd
// ---------------------------------------------------------------------------

export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NodeStack",
    url: "https://nodestack.dev",
    description:
      "Ship your SaaS in days with a production-ready NestJS + Next.js + Drizzle monorepo.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://nodestack.dev/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "NodeStack",
      url: "https://nodestack.dev",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ---------------------------------------------------------------------------
// SoftwareApplicationJsonLd
// ---------------------------------------------------------------------------

export function SoftwareApplicationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "NodeStack",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Linux, macOS, Windows",
    url: "https://nodestack.dev",
    description:
      "Production-ready SaaS boilerplate with NestJS, Next.js, Drizzle ORM, RLS, 2FA, audit logs, billing, and AI integrations.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    softwareVersion: "1.0.0",
    downloadUrl: "https://github.com/nodestack/node-stack",
    releaseNotes: "https://nodestack.dev/changelog",
    author: {
      "@type": "Organization",
      name: "NodeStack",
      url: "https://nodestack.dev",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "128",
      bestRating: "5",
      worstRating: "1",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ---------------------------------------------------------------------------
// FAQJsonLd
// ---------------------------------------------------------------------------

export interface FAQItem {
  question: string;
  answer: string;
}

export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
