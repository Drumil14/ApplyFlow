import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: {
    default: "ApplyFlow",
    template: "%s | ApplyFlow"
  },
  description:
    "An AI-powered job application tracker for students and software engineers who want a calmer, smarter hiring workflow.",
  metadataBase: new URL("https://applyflow.app")
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
