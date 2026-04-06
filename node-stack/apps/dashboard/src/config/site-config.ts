/**
 * Global site configuration for the Dashboard.
 * Centrally manages metadata, links, and base UI settings.
 */
export const siteConfig = {
  name: "Universal Dashboard",
  description: "A high-performance, generic dashboard boilerplate compatible with Node and Edge stacks.",
  supportEmail: "support@example.com",
  defaultLogo: "/logo.svg",
  platformDomain: "platform.com",
  demoSubdomain: "demo",
  links: {
    twitter: "https://twitter.com/ludevv",
    github: "https://github.com/LuDevvv/saas-boilerplates",
    docs: "https://github.com/LuDevvv/saas-boilerplates#readme",
  },
  auth: {
    tokenKey: "auth_token",
    storage: "cookie" as "cookie" | "localStorage",
  },
};

export type SiteConfig = typeof siteConfig;
