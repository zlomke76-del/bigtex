import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Big Tex Pool Supplies | Houston Pool Supply & Delivery",
  description:
    "Houston pool supplies, commercial delivery, hard-to-find parts, and managed inventory support.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
