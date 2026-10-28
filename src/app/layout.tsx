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
      <body className="h-full overflow-hidden print:h-auto print:overflow-visible">
        {/* The flex row lives in a wrapper, not on body: portals (menus, the task drawer) append to body and must not become flex items. */}
        <div className="h-full flex print:h-auto print:block">
          <Sidebar />
          <main className="flex-1 min-w-0 h-full overflow-y-auto flex flex-col bg-canvas border-l border-hairline max-[899px]:border-l-0 print:h-auto print:overflow-visible print:border-0 print:bg-white">{children}</main>
        </div>
      </body>
    </html>
  );
}
