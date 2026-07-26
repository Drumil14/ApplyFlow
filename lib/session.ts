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
