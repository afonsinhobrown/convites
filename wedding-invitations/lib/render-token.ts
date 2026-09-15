import { createHmac, timingSafeEqual } from "crypto";

// Assinatura das URLs do render interno (/render). Em produção deve ser
// definido RENDER_TOKEN_SECRET no ambiente.
const SECRET = process.env.RENDER_TOKEN_SECRET ?? "dev-render-secret-local";

export function signRenderToken(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function verifyRenderToken(payload: string, token: string | null): boolean {
  if (!token) return false;
  const expected = createHmac("sha256", SECRET).update(payload).digest();
  const received = Buffer.from(token, "hex");
  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}

export function buildRenderUrl(
  baseUrl: string,
  eventId: string,
  mode: "for_print" | "for_guest",
  guestName?: string
): string {
  const params = new URLSearchParams({ eventId, mode });
  if (guestName) params.set("guestName", guestName);
  const payload = `${eventId}:${mode}:${guestName ?? ""}`;
  params.set("tok", signRenderToken(payload));
  return `${baseUrl}/render?${params.toString()}`;
}