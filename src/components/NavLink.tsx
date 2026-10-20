"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Sidebar row. Active state: wash background plus the single blue indicator (DESIGN.md app-shell-row).
export function NavLink({ href, exact = false, plain = false, children, className = "" }: { href: string; exact?: boolean; plain?: boolean; children: React.ReactNode; className?: string }) {
  const path = usePathname();
  const active = !plain && (exact ? path === href : path === href || path.startsWith(href + "/"));
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative flex items-center gap-2 px-2 h-7 rounded-sm text-ink-2 transition-colors duration-100 hover:bg-wash hover:text-ink ${active ? "bg-wash text-ink font-medium" : ""} ${className}`}
    >
      {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-primary" />}
      {children}
    </Link>
  );
}
