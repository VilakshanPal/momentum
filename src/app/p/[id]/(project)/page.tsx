import Link from "next/link";
import { listMeetings, openItems } from "@/lib/data";
import { Pill, fmtDate, Empty } from "@/components/ui";
import { NewMeeting } from "@/components/NewMeeting";
import { ItemRow } from "@/components/ItemRow";

export default async function ProjectMeetings({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [meetings, open] = await Promise.all([listMeetings(id), openItems(id)]);
  const actions = open.filter((i) => i.kind === "action");
  const questions = open.filter((i) => i.kind === "question");

  return (
    <div className="px-10 py-6 grid grid-cols-[1fr_320px] gap-10">
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">All meetings</h2>
          <NewMeeting projectId={id} />
        </div>
        {meetings.length ? (
          <ul className="card divide-y divide-line">
            {meetings.map((m) => (
              <li key={m.id}>
                <Link href={`/p/${id}/m/${m.id}`} className="row-hover grid grid-cols-[88px_1fr_auto_auto] items-center gap-4 px-4 h-12">
                  <span className="text-ink-2 text-[13px] tabular-nums">{fmtDate(m.held_on)}</span>
                  <span className="truncate font-medium">{m.title}</span>
                  <span className="text-xs text-ink-3 tabular-nums">
                    {m.status === "published" ? `${m.decisions} decisions · ${m.actions} actions · ${m.questions} questions` : m.raw_notes ? `${m.raw_notes.length.toLocaleString()} chars of notes` : "No notes yet"}
                  </span>
                  <Pill value={m.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="card">
            <Empty title="No meetings yet" hint="Create one and paste your rough notes." />
          </div>
        )}
      </section>

      <aside className="pt-1">
        <h2 className="font-medium mb-3">Open work</h2>
        <p className="text-xs text-ink-3 -mt-2 mb-3">Unresolved across all meetings. These carry into every new meeting.</p>
        <div className="flex flex-col gap-4">
          <div>
            <p className="label mb-1.5">Actions · {actions.length}</p>
            <div className="card divide-y divide-line">
              {actions.length ? actions.map((i) => <ItemRow key={i.id} item={i} compact projectId={id} />) : <Empty title="Nothing open" />}
            </div>
          </div>
          <div>
            <p className="label mb-1.5">Questions · {questions.length}</p>
            <div className="card divide-y divide-line">
              {questions.length ? questions.map((i) => <ItemRow key={i.id} item={i} compact projectId={id} />) : <Empty title="Nothing open" />}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
