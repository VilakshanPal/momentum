import { notFound } from "next/navigation";
import { Briefcase, CircleHelp, ListChecks } from "lucide-react";
import { getProject, listItems, projectPeople } from "@/lib/data";
import type { Item } from "@/lib/schema";
import { TopBar } from "@/components/TopBar";
import { ActionRow, PeopleList, QuestionRow } from "@/components/ItemRow";
import { ACTION_COLS, QUESTION_COLS, STATUS, Empty } from "@/components/ui";

const ACTION_ORDER = ["blocked", "in_progress", "todo", "done"];
const QUESTION_ORDER = ["open", "resolved"];

export default async function Board({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const [items, people] = await Promise.all([listItems(id), projectPeople(id)]);
  const actions = items.filter((i) => i.kind === "action");
  const questions = items.filter((i) => i.kind === "question");

  return (
    <>
      <TopBar crumbs={[{ label: project.name, href: `/p/${id}`, icon: Briefcase }, { label: "Board", icon: ListChecks }]} />
      <PeopleList people={people} />
      <div className="px-8 py-7 flex flex-col gap-8">
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h1 className="text-[22px] font-semibold tracking-tight">Actions</h1>
            <p className="text-xs text-ink-3">Click any cell to edit. Grouped by status; only you change status, never the AI.</p>
          </div>
          <div className="card overflow-hidden">
            <div className={`grid ${ACTION_COLS} gap-3 px-3 h-9 items-center border-b border-line bg-paper-2/60`}>
              {["Action", "Status", "Owner", "Due", "Blocked by", "From meeting"].map((h, i) => (
                <span key={h} className={`label ${i === 5 ? "text-right" : ""}`}>
                  {h}
                </span>
              ))}
            </div>
            {actions.length ? (
              ACTION_ORDER.map((s) => <StatusGroup key={s} status={s} items={actions.filter((i) => i.status === s)} render={(i) => <ActionRow key={i.id} item={i} projectId={id} />} />)
            ) : (
              <Empty icon={ListChecks} title="No actions yet" hint="Publish a meeting and its action items land here." />
            )}
          </div>
        </section>

        <section>
          <h1 className="text-[22px] font-semibold tracking-tight mb-3">Questions</h1>
          <div className="card overflow-hidden">
            <div className={`grid ${QUESTION_COLS} gap-3 px-3 h-9 items-center border-b border-line bg-paper-2/60`}>
              {["Question", "Status", "Owner", "From meeting"].map((h, i) => (
                <span key={h} className={`label ${i === 3 ? "text-right" : ""}`}>
                  {h}
                </span>
              ))}
            </div>
            {questions.length ? (
              QUESTION_ORDER.map((s) => <StatusGroup key={s} status={s} items={questions.filter((i) => i.status === s)} render={(i) => <QuestionRow key={i.id} item={i} projectId={id} />} />)
            ) : (
              <Empty icon={CircleHelp} title="No questions yet" />
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function StatusGroup({ status, items, render }: { status: string; items: Item[]; render: (i: Item) => React.ReactNode }) {
  if (!items.length) return null;
  const s = STATUS[status];
  return (
    <div className="border-b border-line last:border-b-0">
      <div className="h-8 px-3 flex items-center gap-1.5 text-xs font-medium bg-paper-2/40">
        <s.Icon className={`size-3.5 ${s.fg}`} strokeWidth={2.2} />
        <span className={s.fg}>{s.label}</span>
        <span className="text-ink-3 tabular-nums">{items.length}</span>
      </div>
      <div className="divide-y divide-line">{items.map(render)}</div>
    </div>
  );
}
