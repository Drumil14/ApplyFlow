import { NextResponse } from "next/server";

// Auth is intentionally not enforced here. The app is single-user for the demo:
// /dashboard is public and all data is scoped to an implicit user resolved in
// lib/session.ts. NextAuth remains configured for real logins; this middleware
// simply no longer gates any route (empty matcher = runs on nothing).
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: []
};
