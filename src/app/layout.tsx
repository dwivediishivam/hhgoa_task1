import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Builder House — HH Goa 2026",
  description: "Issue your HH Goa 2026 Builder ID, PFP frame, or crew manifest.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://hhgoa-builder-house.vercel.app"),
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
