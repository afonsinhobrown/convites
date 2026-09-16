import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SUPERADMIN_COOKIE_NAME = "superadmin_token";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
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

function getSecret(): string {
  return process.env.SUPERADMIN_COOKIE_SECRET || process.env.SUPERADMIN_PASSWORD || "superadmin-fallback-secret-2026";
}

async function hmacSign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return bytesToBase64Url(new Uint8Array(sig));
}

export async function createSuperAdminSessionToken(payload: {
  sub: string;
  email: string;
  name: string;
  isMaster: boolean;
}): Promise<string> {
  const exp = Date.now() + SESSION_TTL_MS;
  const data = bytesToBase64Url(enc.encode(JSON.stringify({ ...payload, exp })));
  const signature = await hmacSign(data);
  return `${data}.${signature}`;
}

export async function verifySuperAdminSessionToken(token: string): Promise<{
  sub: string;
  email: string;
  name: string;
  isMaster: boolean;
} | null> {
  const parts = token.split(".");
  if (parts.length !== 2) {
    // Fallback para token estático antigo (SUPERADMIN_COOKIE_SECRET puro)
    if (token === process.env.SUPERADMIN_COOKIE_SECRET) {
      return {
        sub: "master",
        email: "superadmin@doremi.local",
        name: "SuperAdmin Master",
        isMaster: true,
      };
    }
    return null;
  }

  const [payloadB64, signature] = parts;
  const expected = await hmacSign(payloadB64);
  if (signature.length !== expected.length || signature !== expected) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadB64)));
    if (typeof payload?.sub !== "string" || typeof payload?.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    return {
      sub: payload.sub,
      email: payload.email || "superadmin@doremi.local",
      name: payload.name || "SuperAdmin",
      isMaster: Boolean(payload.isMaster),
    };
  } catch {
    return null;
  }
}

export async function getCurrentAdmin() {
  const token = cookies().get(SUPERADMIN_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySuperAdminSessionToken(token);
  if (!session) return null;

  if (session.sub === "master") {
    return {
      id: "master",
      email: "master@doremi.local",
      name: "SuperAdmin Master",
      isMaster: true,
      active: true,
    };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, isMaster: true, active: true },
  });

  if (!admin || !admin.active) return null;
  return admin;
}
