import { secureHeaders as honoSecureHeaders } from "hono/secure-headers";

/**
 * Pre-configured secure headers middleware using Hono's default utility.
 * Enforces HSTS, XSS protection, and frame restriction.
 */
export const secureHeaders = honoSecureHeaders({
  strictTransportSecurity: true,
  xContentTypeOptions: true,
  xFrameOptions: "DENY",
  xXssProtection: "1; mode=block",
  referrerPolicy: "strict-origin-when-cross-origin",
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: ["'self'"],
    usb: [],
  },
  contentSecurityPolicy: {
    defaultSrc: ["'none'"],
    baseUri: ["'none'"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'", "fonts.gstatic.com", "cdn.jsdelivr.net"],
    frameAncestors: ["'none'"],
    imgSrc: ["'self'", "data:", "https://*"],
    objectSrc: ["'none'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "cdn.jsdelivr.net",
      "fonts.googleapis.com",
    ],
    upgradeInsecureRequests: [],
  },
});
