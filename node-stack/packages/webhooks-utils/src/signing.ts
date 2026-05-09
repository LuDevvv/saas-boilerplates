import { createHmac } from "node:crypto";

export interface WebhookSignature {
  timestamp: number;
  hash: string;
}

export function generateWebhookSignature(
  secret: string,
  payload: Record<string, unknown>,
  timestamp: number = Math.floor(Date.now() / 1000),
): WebhookSignature {
  const jsonPayload = JSON.stringify(payload);
  const data = `${timestamp}.${jsonPayload}`;
  const hmac = createHmac("sha256", secret);
  hmac.update(data);
  const hash = hmac.digest("hex");

  return { timestamp, hash };
}

export function formatWebhookHeader(signature: WebhookSignature): string {
  return `t=${signature.timestamp},v1=${signature.hash}`;
}

export function verifyWebhookSignature(
  secret: string,
  header: string,
  payload: Record<string, unknown>,
  toleranceSeconds: number = 300, // 5 min
): boolean {
  try {
    const parts = header.split(",");
    const tPart = parts.find((p) => p.startsWith("t="));
    const v1Part = parts.find((p) => p.startsWith("v1="));

    if (!tPart || !v1Part) return false;

    const timestamp = parseInt(tPart.split("=")[1] ?? "", 10);
    const hash = v1Part.split("=")[1] ?? "";

    if (isNaN(timestamp)) return false;

    // Check clock drift (replay attacks)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > toleranceSeconds) {
      return false;
    }

    const expected = generateWebhookSignature(secret, payload, timestamp);
    return expected.hash === hash;
  } catch {
    return false;
  }
}
