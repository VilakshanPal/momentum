import { listItems } from "@/lib/data";
import { ItemRow } from "@/components/ItemRow";
import { Empty } from "@/components/ui";

export default async function Board({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = await listItems(id);
  const actions = items.filter((i) => i.kind === "action").sort((a, b) => rank(a.status) - rank(b.status));
  const questions = items.filter((i) => i.kind === "question").sort((a, b) => (a.status === b.status ? 0 : a.status === "open" ? -1 : 1));

  return (
    <div className="px-10 py-6 flex flex-col gap-8">
      <section>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-medium">Actions</h2>
          <p className="text-xs text-ink-3">Click any cell to edit. Changes save immediately.</p>
        </div>
        <div className="card">
          <div className="grid grid-cols-[1fr_120px_140px_110px_1fr_170px] gap-3 px-3 h-8 items-center border-b border-line">
            {["Action", "Status", "Owner", "Due", "Blocked by", "From meeting"].map((h, i) => (
              <span key={h} className={`label ${i === 5 ? "text-right" : ""}`}>
                {h}
              </span>
            ))}
          </div>
          <div className="divide-y divide-line">{actions.length ? actions.map((i) => <ItemRow key={i.id} item={i} projectId={id} />) : <Empty title="No actions yet" hint="Publish a meeting to add actions." />}</div>
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-2">Questions</h2>
        <div className="card">
          <div className="grid grid-cols-[1fr_120px_140px_170px] gap-3 px-3 h-8 items-center border-b border-line">
            {["Question", "Status", "Owner", "From meeting"].map((h, i) => (
              <span key={h} className={`label ${i === 3 ? "text-right" : ""}`}>
                {h}
              </span>
            ))}
          </div>
          <div className="divide-y divide-line">{questions.length ? questions.map((i) => <ItemRow key={i.id} item={i} projectId={id} />) : <Empty title="No questions yet" />}</div>
        </div>
      </section>
    </div>
  );
}

const rank = (s: string) => ({ blocked: 0, in_progress: 1, todo: 2, done: 3 })[s] ?? 9;
