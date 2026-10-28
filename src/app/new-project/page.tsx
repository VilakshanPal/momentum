import { Briefcase } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { NewProjectForm } from "@/components/NewProjectForm";
import { listClients, listPeople } from "@/lib/data";

// Fallback when no project exists yet; otherwise the sidebar plus opens the same form as a modal.
export default async function NewProject() {
  const [clients, people] = await Promise.all([listClients(), listPeople()]);
  return (
    <>
      <TopBar crumbs={[{ label: "New project", icon: Briefcase }]} />
      <div className="w-full max-w-[584px] mx-auto px-4 sm:px-8 py-12 sm:py-16 enter">
        <h1 className="h-page">New project</h1>
        <p className="text-[15px] text-ink-3 mt-1.5 leading-relaxed">Meetings in a project share decisions and open work, so nothing has to be re-asked.</p>
        <div className="card mt-8 pt-6 shadow-[var(--shadow-soft)]">
          <NewProjectForm clients={clients} people={people} />
        </div>
      </div>
    </>
  );
}
