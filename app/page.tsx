import { redirect } from "next/navigation";

// Single-user demo: drop visitors straight into the working dashboard.
// The marketing landing (components/landing/LandingPage.tsx) is kept in the
// repo but is no longer routed to.
export default function Home() {
  redirect("/dashboard");
}
