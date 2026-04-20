import { parse } from "url";
import { lookup } from "dns";
import { promisify } from "util";
import { isIP } from "net";

const lookupAsync = promisify(lookup);

/**
 * Checks if an IP address is private/reserved.
 * Covers IPv4 and IPv6 private ranges.
 */
export function isPrivateIP(ip: string): boolean {
  // IPv4 Private ranges
  if (ip === "127.0.0.1" || ip === "0.0.0.0") return true;
  
  const ipv4Parts = ip.split(".").map(Number);
  if (ipv4Parts.length === 4) {
    if (ipv4Parts[0] === 10) return true; // 10.0.0.0/8
    if (ipv4Parts[0] === 172 && ipv4Parts[1] >= 16 && ipv4Parts[1] <= 31) return true; // 172.16.0.0/12
    if (ipv4Parts[0] === 192 && ipv4Parts[1] === 168) return true; // 192.168.0.0/16
    if (ipv4Parts[0] === 169 && ipv4Parts[1] === 254) return true; // 169.254.0.0/16 (Link-local)
  }

  // IPv6 Private / Loopback / Link-local
  if (ip === "::1" || ip === "::") return true;
  if (ip.startsWith("fe80:")) return true;
  if (ip.startsWith("fc00:") || ip.startsWith("fd00:")) return true;

  return false;
}

/**
 * Validates a URL for webhook delivery.
 * Rejects non-HTTP(S) and private/internal IP addresses to prevent SSRF.
 */
export async function validateWebhookUrl(url: string): Promise<boolean> {
  try {
    const parsed = parse(url);
    if (!parsed.protocol || !["http:", "https:"].includes(parsed.protocol)) {
      return false;
    }

    const host = parsed.hostname;
    if (!host) return false;

    // Check if host is already an IP
    if (isIP(host)) {
      return !isPrivateIP(host);
    }

    // Resolve hostname to IP and check
    const { address } = await lookupAsync(host);
    return !isPrivateIP(address);
  } catch {
    return false;
  }
}
