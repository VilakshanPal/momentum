"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, exact = false, plain = false, children, className = "" }: { href: string; exact?: boolean; plain?: boolean; children: React.ReactNode; className?: string }) {
  const path = usePathname();
  const active = !plain && (exact ? path === href : path === href || path.startsWith(href + "/"));
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-2 h-7 rounded-md text-ink-2 hover:bg-paper-3 hover:text-ink ${active ? "bg-paper-4 text-ink" : ""} ${className}`}
    >
      {children}
    </Link>
  );
}
