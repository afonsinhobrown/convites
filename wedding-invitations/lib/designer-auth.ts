export const DESIGNER_COOKIE_NAME = "designer_token";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const enc = new TextEncoder();

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacSign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(process.env.DESIGNER_COOKIE_SECRET ?? ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return bytesToBase64Url(new Uint8Array(sig));
}

export async function createDesignerSessionToken(designerId: string): Promise<string> {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = bytesToBase64Url(enc.encode(JSON.stringify({ sub: designerId, exp })));
  const signature = await hmacSign(payload);
  return `${payload}.${signature}`;
}

export async function verifyDesignerSessionToken(token: string): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;

  const expected = await hmacSign(payloadB64);
  if (signature.length !== expected.length || signature !== expected) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadB64)));
    if (typeof payload?.sub !== "string" || typeof payload?.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    return payload.sub;
  } catch {
    return null;
  }
}