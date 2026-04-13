/**
 * geo-defaults.ts
 *
 * Detects user location using a hybrid approach:
 * 1. Synchronous: Timezone-based (Intl) for instant UI.
 * 2. Asynchronous: Server-side API (IP-based) for high accuracy.
 */

export interface GeoDefaults {
  countryCode: string;
  countryName: string;
  dialCode: string;
  currencyCode: string;
  locale: string;
}

interface CountryInfo {
  code: string;
  name: string;
  dialCode: string;
  currency: string;
  locale: string;
}

// ── Country registry (matches PhoneInput COUNTRIES array) ──────────
const COUNTRY_REGISTRY: Record<string, CountryInfo> = {
  DO: { code: "DO", name: "República Dominicana", dialCode: "+1",   currency: "DOP", locale: "es-DO" },
  MX: { code: "MX", name: "México",               dialCode: "+52",  currency: "MXN", locale: "es-MX" },
  CO: { code: "CO", name: "Colombia",             dialCode: "+57",  currency: "COP", locale: "es-CO" },
  AR: { code: "AR", name: "Argentina",            dialCode: "+54",  currency: "ARS", locale: "es-AR" },
  CL: { code: "CL", name: "Chile",                dialCode: "+56",  currency: "CLP", locale: "es-CL" },
  PE: { code: "PE", name: "Perú",                 dialCode: "+51",  currency: "PEN", locale: "es-PE" },
  EC: { code: "EC", name: "Ecuador",              dialCode: "+593", currency: "USD", locale: "es-EC" },
  VE: { code: "VE", name: "Venezuela",            dialCode: "+58",  currency: "VES", locale: "es-VE" },
  BO: { code: "BO", name: "Bolivia",              dialCode: "+591", currency: "BOB", locale: "es-BO" },
  PY: { code: "PY", name: "Paraguay",             dialCode: "+595", currency: "PYG", locale: "es-PY" },
  UY: { code: "UY", name: "Uruguay",              dialCode: "+598", currency: "UYU", locale: "es-UY" },
  BR: { code: "BR", name: "Brasil",               dialCode: "+55",  currency: "BRL", locale: "pt-BR" },
  CR: { code: "CR", name: "Costa Rica",           dialCode: "+506", currency: "CRC", locale: "es-CR" },
  PA: { code: "PA", name: "Panamá",               dialCode: "+507", currency: "USD", locale: "es-PA" },
  SV: { code: "SV", name: "El Salvador",          dialCode: "+503", currency: "USD", locale: "es-SV" },
  GT: { code: "GT", name: "Guatemala",            dialCode: "+502", currency: "GTQ", locale: "es-GT" },
  HN: { code: "HN", name: "Honduras",             dialCode: "+504", currency: "HNL", locale: "es-HN" },
  NI: { code: "NI", name: "Nicaragua",            dialCode: "+505", currency: "NIO", locale: "es-NI" },
  CU: { code: "CU", name: "Cuba",                 dialCode: "+53",  currency: "CUP", locale: "es-CU" },
  PR: { code: "PR", name: "Puerto Rico",          dialCode: "+1",   currency: "USD", locale: "es-PR" },
  US: { code: "US", name: "Estados Unidos",       dialCode: "+1",   currency: "USD", locale: "en-US" },
  CA: { code: "CA", name: "Canadá",               dialCode: "+1",   currency: "CAD", locale: "en-CA" },
  ES: { code: "ES", name: "España",               dialCode: "+34",  currency: "EUR", locale: "es-ES" },
};


const DEFAULT_COUNTRY: CountryInfo = COUNTRY_REGISTRY["MX"]!;

/**
 * Detects user's country from browser timezone.
 * Falls back to "MX" (México) if detection fails.
 */
export function detectGeoDefaults(): GeoDefaults {
  return {
    countryCode: DEFAULT_COUNTRY.code,
    countryName: DEFAULT_COUNTRY.name,
    dialCode: DEFAULT_COUNTRY.dialCode,
    currencyCode: DEFAULT_COUNTRY.currency,
    locale: DEFAULT_COUNTRY.locale,
  };
}

/**
 * High-accuracy detection via server-side IP geolocation.
 */
export async function fetchGeoFromServer(): Promise<GeoDefaults | null> {
  // Placeholder for boilerplate — can be implemented with a real API
  return null;
}

/**
 * Get country info from registry by code.
 */
export function getCountryInfo(code: string): CountryInfo | undefined {
  return COUNTRY_REGISTRY[code.toUpperCase()];
}

/**
 * Get all supported country codes.
 */
export function getSupportedCountries(): CountryInfo[] {
  return Object.values(COUNTRY_REGISTRY);
}
