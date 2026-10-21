import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const description = "Rough meeting notes in, decisions, action items and open questions out. You review every line before it becomes a record, and whatever stays open carries into the next meeting.";

// On Vercel, Next fills metadataBase from the production URL on its own; the env var is for other hosts.
export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title: { default: "MOMentum", template: "%s | MOMentum" },
  description,
  openGraph: { title: "MOMentum", description, siteName: "MOMentum", type: "website" },
  twitter: { card: "summary_large_image", title: "MOMentum", description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 h-full overflow-y-auto flex flex-col bg-canvas">{children}</main>
      </body>
    </html>
  );
}
