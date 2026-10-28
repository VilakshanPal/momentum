import { Briefcase } from "lucide-react";
import { listClientsDetailed } from "@/lib/data";
import { deleteClient } from "@/lib/actions";
import { Page, TitleRow, TopBar } from "@/components/TopBar";
import { ClientDialog } from "@/components/ClientDialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { Empty, plural } from "@/components/ui";

// Company-level clients. Projects group under the brand; deleting a client deletes its projects and everything in them.
export default async function Clients() {
  const clients = await listClientsDetailed();
  return (
    <>
      <TopBar crumbs={[{ label: "Clients", icon: Briefcase }]} />
      <Page>
        <TitleRow title="Clients" subtitle="Every client the company works for. A project belongs to one of them." actions={<ClientDialog />} />
        {clients.length ? (
          <div className="card overflow-hidden">
            <div className="grid grid-cols-[minmax(0,1fr)_72px_80px] sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.2fr)_88px_80px] items-center gap-3 px-4 h-10 border-b border-hairline bg-surface-2 text-[12.5px] font-medium text-ink-3">
              <span>Brand</span>
              <span className="max-sm:hidden">Contact</span>
              <span className="max-sm:hidden">Email</span>
              <span className="text-right">Projects</span>
              <span />
            </div>
            <ul className="divide-y divide-hairline">
              {clients.map((c) => (
                <li key={c.id} className="row group grid grid-cols-[minmax(0,1fr)_72px_80px] sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.2fr)_88px_80px] items-center gap-3 px-4 h-14">
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className="size-7 shrink-0 rounded-[7px] bg-wash-2 text-ink-2 grid place-items-center text-[12px] font-bold">{c.brand.charAt(0).toUpperCase()}</span>
                    <span className="truncate text-[14px] font-medium text-ink">{c.brand}</span>
                  </span>
                  <span className={`truncate text-[13.5px] max-sm:hidden ${c.name ? "text-ink-2" : "text-ink-4 italic"}`}>{c.name ?? "No contact"}</span>
                  <span className={`truncate text-[13.5px] max-sm:hidden ${c.email ? "text-ink-2" : "text-ink-4"}`}>{c.email ?? ""}</span>
                  <span className="text-right text-[13.5px] text-ink-2 tabular-nums">{c.projects}</span>
                  <span className="flex items-center justify-end gap-0.5">
                    <ClientDialog client={c} trigger="icon" />
                    <DeleteDialog
                      label={`Delete ${c.brand}`}
                      title={`Delete ${c.brand}?`}
                      warning={
                        c.projects ? (
                          <>
                            This also deletes {c.brand}&apos;s <strong>{plural(c.projects, "project")}</strong>{c.meetings ? ` and ${plural(c.meetings, "meeting")}, with every decision, action and question in them` : ""}. <strong>This cannot be undone.</strong>
                          </>
                        ) : (
                          <>{c.brand} has no projects. It is removed from the list and from the client dropdowns.</>
                        )
                      }
                      confirmLabel={c.projects ? `Delete client and ${plural(c.projects, "project")}` : "Delete client"}
                      action={deleteClient.bind(null, c.id)}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="card">
            <Empty icon={Briefcase} title="No clients yet" hint="Add the companies you work for. New projects pick from this list." action={<ClientDialog />} />
          </div>
        )}
      </Page>
    </>
  );
}
