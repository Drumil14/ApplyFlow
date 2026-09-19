import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureDemoUser } from "@/lib/demo";
import { prisma } from "@/lib/prisma";

export type CurrentUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

/**
 * The acting user for the current request.
 *
 * Prefers a real NextAuth session; when there is none, it falls back to the
 * single implicit demo user. The app is single-user for the demo, so this
 * always resolves to a valid user and the login screen is never required.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user;

  const demo = await ensureDemoUser(prisma);
  return { id: demo.id, name: demo.name, email: demo.email, image: demo.image };
}

export async function getCurrentUserId(): Promise<string> {
  return (await getCurrentUser()).id;
}

/**
 * Used by every API route. It no longer returns a 401 — it always resolves to a
 * valid `userId` (real session or the implicit demo user), so existing routes
 * that do `if (response) return response;` keep working unchanged.
 */
export async function requireUser(): Promise<{ userId: string; response: null }> {
  return { userId: await getCurrentUserId(), response: null };
}

/**
 * Pull the first syntactically-valid IP out of an `x-forwarded-for` value.
 * The header can be a comma-separated chain (`client, proxy1, proxy2`); on
 * Vercel the left-most entry is the real client, so we take the first that
 * parses as an IPv4/IPv6 address.
 */
function firstValidIp(forwardedFor: string | null): string | null {
  if (!forwardedFor) return null;
  for (const part of forwardedFor.split(",")) {
    const candidate = part.trim();
    if (isProbablyIp(candidate)) return candidate;
  }
  return null;
}

function isProbablyIp(value: string): boolean {
  if (!value) return false;
  // IPv4 dotted quad, or anything containing ":" (IPv6). Loose on purpose — we
  // only need a stable key, not strict validation.
  const ipv4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  return ipv4.test(value) || value.includes(":");
}

/**
 * Identifier for AI rate limiting. Prefers a real authenticated user id; falls
 * back to a server-derived client IP so anonymous demo traffic is still bounded.
 *
 * Security: the IP is read only from trusted proxy headers server-side. No
 * caller-supplied body value is ever used, so a browser cannot forge its bucket.
 */
export async function getRateLimitIdentifier(request: Request): Promise<string> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return `user:${session.user.id}`;

  const headers = request.headers;
  const ip = firstValidIp(headers.get("x-forwarded-for")) ?? headers.get("x-real-ip")?.trim();
  return `ip:${ip && isProbablyIp(ip) ? ip : "unknown"}`;
}
