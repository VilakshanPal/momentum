import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Crumb = { label: string; href?: string; icon?: LucideIcon };

// 48px page top bar: breadcrumbs left, actions right. White surface over the warm canvas.
export function TopBar({ crumbs, children }: { crumbs: Crumb[]; children?: React.ReactNode }) {
  return (
    <div className="h-12 shrink-0 px-5 flex items-center gap-0.5 border-b border-hairline bg-surface/90 backdrop-blur sticky top-0 z-20 text-[13.5px]">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        const inner = (
          <span className={`inline-flex items-center gap-1.5 px-1.5 h-7 rounded-sm max-w-72 transition-colors duration-100 ${last ? "text-ink font-medium" : "text-ink-3 hover:bg-wash hover:text-ink"}`}>
            {c.icon && <c.icon className="size-3.5 text-ink-4" />}
            <span className="truncate">{c.label}</span>
          </span>
        );
        return (
          <span key={i} className="inline-flex items-center gap-0.5 min-w-0">
            {c.href && !last ? <Link href={c.href}>{inner}</Link> : inner}
            {!last && <ChevronRight className="size-3.5 text-ink-4" />}
          </span>
        );
      })}
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </div>
  );
}
