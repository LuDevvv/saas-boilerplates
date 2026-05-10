import { lookup } from "dns";
import { isIP } from "net";
import { parse } from "url";
import { promisify } from "util";

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
    const [o0, o1] = [ipv4Parts[0]!, ipv4Parts[1]!];
    if (o0 === 10) return true; // 10.0.0.0/8
    if (o0 === 172 && o1 >= 16 && o1 <= 31) return true; // 172.16.0.0/12
    if (o0 === 192 && o1 === 168) return true; // 192.168.0.0/16
    if (o0 === 169 && o1 === 254) return true; // 169.254.0.0/16 (Link-local)
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
