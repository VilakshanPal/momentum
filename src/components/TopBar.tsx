import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavToggle } from "./NavToggle";

export type Crumb = { label: string; href?: string; icon?: LucideIcon };

// 56px header: breadcrumb left, at most one secondary action right. Primary actions live in the page title row, not here.
export function TopBar({ crumbs, children }: { crumbs: Crumb[]; children?: React.ReactNode }) {
  return (
    <div className="h-14 shrink-0 px-4 sm:px-6 flex items-center gap-1 border-b border-hairline bg-surface/90 backdrop-blur sticky top-0 z-20 text-[13px] print:hidden">
      <NavToggle />
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        const inner = (
          <span className={`inline-flex items-center gap-1.5 px-1.5 h-7 rounded-sm max-w-56 sm:max-w-72 transition-colors duration-100 ${last ? "text-ink font-medium" : "text-ink-3 hover:bg-wash hover:text-ink"}`}>
            {c.icon && <c.icon className="size-3.5 text-ink-4 shrink-0" />}
            <span className="truncate">{c.label}</span>
          </span>
        );
        return (
          <span key={i} className={`inline-flex items-center gap-1 min-w-0 ${last ? "" : "max-sm:hidden"}`}>
            {c.href && !last ? <Link href={c.href}>{inner}</Link> : inner}
            {!last && <ChevronRight className="size-3.5 text-ink-4 shrink-0" />}
          </span>
        );
      })}
      <div className="ml-auto flex items-center gap-2 shrink-0">{children}</div>
    </div>
  );
}

// Page title row: 32px title, optional subtitle, and the one primary action on the right.
export function TitleRow({ title, subtitle, children, actions }: { title: React.ReactNode; subtitle?: React.ReactNode; children?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 mb-8">
      <div className="min-w-0 flex-1 basis-[280px]">
        <h1 className="h-page">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-ink-3 leading-relaxed">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0 pt-1">{actions}</div>}
    </div>
  );
}

// Content column, the same on every screen: centred, 1280px cap (1216px of content), 32px gutters on desktop, 16px on phones.
export const PAGE_W = "max-w-[1280px]";
export function Page({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`w-full ${PAGE_W} mx-auto px-4 sm:px-8 py-6 sm:py-8 min-w-0 ${className}`}>{children}</div>;
}
