import Link from "next/link";
import { listItems } from "@/lib/data";
import { Pill, fmtDate, Empty } from "@/components/ui";

export default async function Decisions({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decisions = await listItems(id, "decision");
  const byId = new Map(decisions.map((d) => [d.id, d]));
  const supersededBy = new Map(decisions.filter((d) => d.supersedes_id).map((d) => [d.supersedes_id!, d]));

  return (
    <div className="px-10 py-6 max-w-[880px]">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-medium">Decision log</h2>
        <p className="text-xs text-ink-3">Superseded decisions stay here. Nothing is overwritten.</p>
      </div>
      <div className="card divide-y divide-line">
        {decisions.length ? (
          decisions.map((d) => {
            const newer = supersededBy.get(d.id);
            const older = d.supersedes_id ? byId.get(d.supersedes_id) : null;
            return (
              <article key={d.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <Pill value={d.status} className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${d.status === "superseded" ? "text-ink-3 line-through" : ""}`}>{d.title}</p>
                    {d.detail && <p className="text-ink-2 mt-0.5">{d.detail}</p>}
                    {d.evidence && <p className="evidence mt-1.5">“{d.evidence}”</p>}
                    <div className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-ink-3">
                      <Link href={`/p/${id}/m/${d.meeting_id}`} className="hover:text-ink hover:underline">
                        {d.meeting_title} · {fmtDate(d.meeting_held_on, { day: "numeric", month: "short", year: "numeric" })}
                      </Link>
                      {older && <span>Supersedes: “{older.title}”</span>}
                      {newer && <span className="text-t-amber-fg">Superseded by: “{newer.title}”</span>}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <Empty title="No decisions yet" />
        )}
      </div>
    </div>
  );
}
