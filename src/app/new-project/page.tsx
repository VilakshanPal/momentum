import { Briefcase } from "lucide-react";
import { createProject } from "@/lib/actions";
import { TopBar } from "@/components/TopBar";

export default function NewProject() {
  const field = "field h-9 px-3";
  return (
    <>
      <TopBar crumbs={[{ label: "New project", icon: Briefcase }]} />
      <div className="max-w-lg px-8 py-10">
        <h1 className="h-section">New project</h1>
        <p className="text-ink-2 mt-1">A project groups meetings so decisions and open work carry across them.</p>
        <form action={createProject} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Name</span>
            <input name="name" required autoFocus placeholder="ACME Brand refresh" className={field} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Client</span>
            <input name="client" placeholder="ACME Ltd" className={field} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Description</span>
            <textarea name="description" rows={2} placeholder="What this engagement is about" className={`${field} py-2 h-auto resize-none`} />
          </label>
          <div>
            <button className="btn btn-primary">Create project</button>
          </div>
        </form>
      </div>
    </>
  );
}
