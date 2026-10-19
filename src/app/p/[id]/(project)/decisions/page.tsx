import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Briefcase, CalendarDays, Gavel } from "lucide-react";
import { getProject, listItems } from "@/lib/data";
import { TopBar } from "@/components/TopBar";
import { Empty, Status, fmtDate } from "@/components/ui";

export default async function Decisions({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const decisions = await listItems(id, "decision");
  const byId = new Map(decisions.map((d) => [d.id, d]));
  const supersededBy = new Map(decisions.filter((d) => d.supersedes_id).map((d) => [d.supersedes_id!, d]));

  // Group by originating meeting, newest first (listItems already orders by meeting date desc).
  const groups: { meeting_id: string; title: string; held_on: string; items: typeof decisions }[] = [];
  for (const d of decisions) {
    const g = groups.find((x) => x.meeting_id === d.meeting_id);
    if (g) g.items.push(d);
    else groups.push({ meeting_id: d.meeting_id, title: d.meeting_title!, held_on: d.meeting_held_on!, items: [d] });
  }

  return (
    <>
      <TopBar crumbs={[{ label: project.name, href: `/p/${id}`, icon: Briefcase }, { label: "Decisions", icon: Gavel }]} />
      <div className="px-8 py-7 max-w-[860px]">
        <div className="flex items-baseline justify-between mb-5">
          <h1 className="text-[22px] font-semibold tracking-tight">Decision log</h1>
          <p className="text-xs text-ink-3">Superseded decisions stay on the record. Nothing is overwritten.</p>
        </div>

        {groups.length ? (
          <ol className="relative border-l border-line ml-2.5 flex flex-col gap-8">
            {groups.map((g) => (
              <li key={g.meeting_id} className="pl-6">
                <span className="absolute -left-[5px] mt-1.5 size-[9px] rounded-full bg-paper border-2 border-ink-3" />
                <Link href={`/p/${id}/m/${g.meeting_id}`} className="inline-flex items-center gap-2 text-[13px] text-ink-2 hover:text-ink">
                  <CalendarDays className="size-3.5 text-ink-3" />
                  <span className="font-medium text-ink">{g.title}</span>
                  <span className="tabular-nums">{fmtDate(g.held_on, { day: "numeric", month: "long", year: "numeric" })}</span>
                </Link>
                <div className="card mt-2 divide-y divide-line">
                  {g.items.map((d) => {
                    const newer = supersededBy.get(d.id);
                    const older = d.supersedes_id ? byId.get(d.supersedes_id) : null;
                    return (
                      <article key={d.id} className="px-4 py-3 flex items-start gap-3">
                        <Status value={d.status} pill className="mt-0.5 w-28 justify-start" />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${d.status === "superseded" ? "text-ink-3 line-through" : ""}`}>{d.title}</p>
                          {d.detail && <p className="text-ink-2 text-[13px] mt-0.5">{d.detail}</p>}
                          {d.evidence && <p className="evidence mt-2">“{d.evidence}”</p>}
                          {(older || newer) && (
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              {older && (
                                <span className="chip">
                                  <ArrowDownLeft className="size-3" /> Replaces: {older.title}
                                </span>
                              )}
                              {newer && (
                                <span className="chip text-t-amber-fg bg-t-amber-bg">
                                  <ArrowUpRight className="size-3" /> Replaced by: {newer.title}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="card">
            <Empty icon={Gavel} title="No decisions yet" hint="Confirmed and proposed decisions from published meetings appear here." />
          </div>
        )}
      </div>
    </>
  );
}
