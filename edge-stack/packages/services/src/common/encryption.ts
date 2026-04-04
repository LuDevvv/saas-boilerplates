/**
 * Utility for symmetric data encryption at rest using the WebCrypto API (AES-GCM).
 * Optimized for Cloudflare Workers (Edge runtime).
 */

/**
 * Encrypts a plaintext string using a base64-encoded master key.
 * Returns a concatenated string: iv:ciphertext (base64 encoded).
 *
 * @param plaintext - Data to encrypt
 * @param keyBase64 - Base64 encoded 32-byte master key
 */
export async function encrypt(
  plaintext: string,
  keyBase64: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const keyData = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey("raw", keyData, "AES-GCM", false, [
    "encrypt",
  ]);

  const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM standard IV length
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );

  const ivBase64 = btoa(String.fromCharCode(...iv));
  const encryptedBase64 = btoa(
    String.fromCharCode(...new Uint8Array(encrypted)),
  );

  return `${ivBase64}:${encryptedBase64}`;
}

/**
 * Decrypts a ciphertext string using a base64-encoded master key.
 *
 * @param encryptedString - Format: iv:ciphertext
 * @param keyBase64 - Base64 encoded 32-byte master key
 */
export async function decrypt(
  encryptedString: string,
  keyBase64: string,
): Promise<string> {
  const [ivBase64, encryptedBase64] = encryptedString.split(":");
  if (!ivBase64 || !encryptedBase64)
    throw new Error("Invalid encrypted data format");

  const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
  const encrypted = Uint8Array.from(atob(encryptedBase64), (c) =>
    c.charCodeAt(0),
  );
  const keyData = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey("raw", keyData, "AES-GCM", false, [
    "decrypt",
  ]);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
