import type { Metadata } from "next";
import "./globals.css";
import { configuredSiteOrigin } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Builder House — HH Goa 2026",
  description: "Issue your HH Goa 2026 Builder ID, PFP frame, or crew manifest.",
  metadataBase: new URL(configuredSiteOrigin()),
  openGraph: {
    title: "Builder House — HH Goa 2026",
    description: "Frame your signal. Build your HH Goa identity.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
