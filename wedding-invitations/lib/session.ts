import { cookies } from "next/headers";
import { verifyOrganizerSessionToken } from "@/lib/organizer-auth";

export const ORGANIZER_COOKIE_NAME = "organizer_token";

export async function getCurrentOrganizerId(): Promise<string | null> {
  const token = cookies().get(ORGANIZER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyOrganizerSessionToken(token);
}