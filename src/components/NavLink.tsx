"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, exact = false, children, className = "" }: { href: string; exact?: boolean; children: React.ReactNode; className?: string }) {
  const path = usePathname();
  const active = exact ? path === href : path === href || path.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-2 h-7 rounded-md text-ink-2 hover:bg-paper-3 hover:text-ink ${active ? "bg-paper-4 text-ink font-medium" : ""} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Tab({ href, exact = false, children }: { href: string; exact?: boolean; children: React.ReactNode }) {
  const path = usePathname();
  const active = exact ? path === href : path === href || path.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`relative h-9 inline-flex items-center px-1 text-[13px] ${active ? "text-ink font-medium" : "text-ink-2 hover:text-ink"}`}
    >
      {children}
      {active && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-ink rounded-full" />}
    </Link>
  );
}
