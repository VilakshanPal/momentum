import { notFound } from "next/navigation";
import { Briefcase, ChevronDown, CircleHelp, ListChecks } from "lucide-react";
import { getProject, listItems, projectPeople } from "@/lib/data";
import type { Item } from "@/lib/schema";
import { Page, TitleRow, TopBar } from "@/components/TopBar";
import { ActionRow, PeopleList, QuestionRow } from "@/components/ItemRow";
import { NewItemDialog } from "@/components/NewItemDialog";
import { ACTION_COLS, QUESTION_COLS, Empty, StatusPill } from "@/components/ui";

const ACTION_ORDER = ["blocked", "in_progress", "todo", "done"];
const QUESTION_ORDER = ["open", "resolved"];
const CLOSED = new Set(["done", "resolved"]);

export default async function Board({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const [items, people] = await Promise.all([listItems(id), projectPeople(id)]);
  const actions = items.filter((i) => i.kind === "action");
  const questions = items.filter((i) => i.kind === "question");
  const openCount = (list: Item[]) => list.filter((i) => !CLOSED.has(i.status)).length;
  const open = openCount(actions) + openCount(questions);

  return (
    <>
      <TopBar crumbs={[{ label: project.name, href: `/p/${id}`, icon: Briefcase }, { label: "Board", icon: ListChecks }]} />
      <PeopleList people={people} />
      <Page className="flex flex-col gap-6">
        <TitleRow title="Board" subtitle={`${open} open. Click a name to open it. Status is set by you, never by the AI.`} actions={<NewItemDialog projectId={id} team={project.team} />} />

        <section className="card min-w-0 px-5 pt-4 pb-3 -mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-semibold">
              Actions <span className="ml-1 font-normal text-ink-4 tabular-nums">{openCount(actions)}</span>
            </h2>
            <NewItemDialog projectId={id} team={project.team} kind="action" compact />
          </div>
          <div className="overflow-x-auto -mx-5 px-5">
            <div className="min-w-[520px] flex flex-col gap-6">
              {actions.length ? (
                ACTION_ORDER.map((s) => (
                  <StatusGroup key={s} status={s} items={actions.filter((i) => i.status === s)} cols={ACTION_COLS} headers={["Name", "Owner", "Due date", "From meeting"]} render={(i) => <ActionRow key={i.id} item={i} projectId={id} team={project.team} />} />
                ))
              ) : (
                <Empty icon={ListChecks} title="No actions yet" hint="Publish a meeting and its action items land here." />
              )}
            </div>
          </div>
        </section>

        <section className="card min-w-0 px-5 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-semibold">
              Questions <span className="ml-1 font-normal text-ink-4 tabular-nums">{openCount(questions)}</span>
            </h2>
            <NewItemDialog projectId={id} team={project.team} kind="question" compact />
          </div>
          <div className="overflow-x-auto -mx-5 px-5">
            <div className="min-w-[400px] flex flex-col gap-6">
              {questions.length ? (
                QUESTION_ORDER.map((s) => <StatusGroup key={s} status={s} items={questions.filter((i) => i.status === s)} cols={QUESTION_COLS} headers={["Name", "Owner", "From meeting"]} render={(i) => <QuestionRow key={i.id} item={i} projectId={id} team={project.team} />} />)
              ) : (
                <Empty icon={CircleHelp} title="No questions yet" />
              )}
            </div>
          </div>
        </section>
      </Page>
    </>
  );
}

// One status group, ClickUp list view style: pill header with a chevron and count, its own column header row, then the rows.
// Open groups start expanded; Done and Resolved start collapsed so the board shows what is left.
function StatusGroup({ status, items, cols, headers, render }: { status: string; items: Item[]; cols: string; headers: string[]; render: (i: Item) => React.ReactNode }) {
  if (!items.length) return null;
  const last = headers.length - 1;
  return (
    <details className="group" open={!CLOSED.has(status)}>
      <summary className="h-9 flex items-center gap-2 cursor-pointer select-none list-none w-fit pr-2 rounded-sm">
        <ChevronDown className="size-4 text-ink-4 transition-transform duration-150 ease-(--ease-out) -rotate-90 group-open:rotate-0" />
        <StatusPill value={status} />
        <span className="text-[13px] text-ink-4 tabular-nums ml-1">{items.length}</span>
      </summary>
      <div className={`grid ${cols} items-center gap-3 px-3 h-8 border-b border-hairline`}>
        {headers.map((h, i) => (
          <span key={h} className={`text-[13px] font-medium text-ink-3 ${i === 0 ? "pl-10" : ""} ${i === last ? "text-right" : ""} ${i === last ? "max-[1200px]:hidden" : ""}`}>
            {h}
          </span>
        ))}
      </div>
      <div className="divide-y divide-hairline">{items.map(render)}</div>
    </details>
  );
}
