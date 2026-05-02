/**
 * Utility to detect and fetch geographical defaults for PhoneInput and other components.
 */

export interface GeoData {
  countryCode: string;
  dialCode: string;
}

/**
 * Detects country code based on the user's timezone.
 */
export const detectGeoDefaults = (): GeoData => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Mapping some common timezones to country codes
    if (timezone.includes("Mexico")) return { countryCode: "MX", dialCode: "+52" };
    if (timezone.includes("Santo_Domingo")) return { countryCode: "DO", dialCode: "+1" };
    if (timezone.includes("Bogota")) return { countryCode: "CO", dialCode: "+57" };
    if (timezone.includes("Buenos_Aires")) return { countryCode: "AR", dialCode: "+54" };
    if (timezone.includes("Santiago")) return { countryCode: "CL", dialCode: "+56" };
    if (timezone.includes("Lima")) return { countryCode: "PE", dialCode: "+51" };
    if (timezone.includes("Madrid")) return { countryCode: "ES", dialCode: "+34" };
    if (timezone.includes("New_York") || timezone.includes("Los_Angeles") || timezone.includes("Chicago")) 
      return { countryCode: "US", dialCode: "+1" };
      
    // Default to Dominican Republic as it seems to be the user's primary market
    return { countryCode: "DO", dialCode: "+1" };
  } catch (e) {
    return { countryCode: "DO", dialCode: "+1" };
  }
};

/**
 * Fetches geographical data from a server-side endpoint (simulated here).
 */
export const fetchGeoFromServer = async (): Promise<GeoData | null> => {
  // In a real app, this would call an API like ip-api.com or a local endpoint
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(detectGeoDefaults());
    }, 500);
  });
};
