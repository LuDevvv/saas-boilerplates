import { siteConfig } from "../config/site-config";

export const buildBranchUrl = (domain: string): string => {
  const isCustomDomain = domain.includes(".");
  if (isCustomDomain) {
    return `https://${domain}`;
  }
  return `https://${domain}.${siteConfig.platformDomain}`;
};

export const isDemoUrl = (url: string): boolean => {
  return url.includes(`${siteConfig.demoSubdomain}.${siteConfig.platformDomain}`);
};

export const isUrlActive = async (url: string): Promise<boolean> => {
  try {
    const absoluteUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await fetch(absoluteUrl, {
      method: "HEAD",
      mode: "no-cors",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    return true; 
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError' && !error.message.includes('Failed to fetch')) {
        console.warn('[URL Validator] URL check failed:', error.message);
    }
    return false;
  }
};
