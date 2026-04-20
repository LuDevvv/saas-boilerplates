export const siteConfig = {
  name: "Dash Boilerplate",
  description: "A premium boilerplate for building high-end dashboards.",
  logo: {
    light: "/logo-light.png",
    dark: "/logo-dark.png",
  },
  auth: {
    allowRegistration: true,
    requireEmailVerification: false,
  },
  links: {
    github: "https://github.com/your-repo/dashboard-boilerplate",
  },
};

export type SiteConfig = typeof siteConfig;
