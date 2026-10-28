import { Users } from "lucide-react";
import { listPeopleDetailed } from "@/lib/data";
import { removePerson } from "@/lib/actions";
import { Page, TitleRow, TopBar } from "@/components/TopBar";
import { PersonDialog } from "@/components/PersonDialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { Avatar, Empty, plural } from "@/components/ui";

// Company-level team. Each project picks its teammates from here; owners and participants are offered from a project's teammates.
export default async function Team() {
  const people = await listPeopleDetailed();
  return (
    <>
      <TopBar crumbs={[{ label: "Team", icon: Users }]} />
      <Page>
        <TitleRow title="Team" subtitle="Everyone at the company. Each project picks its teammates from here." actions={<PersonDialog />} />
        {people.length ? (
          <div className="card overflow-hidden">
            <div className="grid grid-cols-[minmax(0,1fr)_72px_80px] sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,1fr)_88px_80px] items-center gap-3 px-4 h-10 border-b border-hairline bg-surface-2 text-[12.5px] font-medium text-ink-3">
              <span>Name</span>
              <span className="max-sm:hidden">Email</span>
              <span className="max-sm:hidden">Role</span>
              <span className="text-right">Projects</span>
              <span />
            </div>
            <ul className="divide-y divide-hairline">
              {people.map((p) => (
                <li key={p.name} className="row grid grid-cols-[minmax(0,1fr)_72px_80px] sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,1fr)_88px_80px] items-center gap-3 px-4 h-14">
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={p.name} size={28} />
                    <span className="truncate text-[14px] font-medium text-ink">{p.name}</span>
                  </span>
                  <span className={`truncate text-[13.5px] max-sm:hidden ${p.email ? "text-ink-2" : "text-ink-4"}`}>{p.email ?? ""}</span>
                  <span className={`truncate text-[13.5px] max-sm:hidden ${p.role ? "text-ink-2" : "text-ink-4"}`}>{p.role ?? ""}</span>
                  <span className="text-right text-[13.5px] text-ink-2 tabular-nums">{p.projects}</span>
                  <span className="flex items-center justify-end gap-0.5">
                    <PersonDialog person={p} />
                    <DeleteDialog
                      label={`Remove ${p.name}`}
                      title={`Remove ${p.name} from the team?`}
                      warning={
                        <>
                          {p.projects ? `They come off the teammates of ${plural(p.projects, "project")}. ` : ""}Meetings and tasks that already carry their name keep it. Projects, meetings and records are not deleted.
                        </>
                      }
                      confirmLabel="Remove teammate"
                      action={removePerson.bind(null, p.name)}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="card">
            <Empty icon={Users} title="No one on the team yet" hint="Add the people you work with. Projects pick their teammates from this list." action={<PersonDialog />} />
          </div>
        )}
      </Page>
    </>
  );
}
