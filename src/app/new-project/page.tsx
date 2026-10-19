import { createProject } from "@/lib/actions";

export default function NewProject() {
  return (
    <div className="max-w-xl mx-auto px-8 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">New project</h1>
      <p className="text-ink-2 mt-1">A project groups meetings so decisions and open work carry across them.</p>
      <form action={createProject} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="label">Name</span>
          <input name="name" required autoFocus placeholder="ACME — Brand refresh" className="h-9 px-3 rounded-md border border-line-2 outline-none focus:border-ink-3" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Client</span>
          <input name="client" placeholder="ACME Ltd" className="h-9 px-3 rounded-md border border-line-2 outline-none focus:border-ink-3" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Description</span>
          <textarea name="description" rows={2} placeholder="What this engagement is about" className="px-3 py-2 rounded-md border border-line-2 outline-none focus:border-ink-3 resize-none" />
        </label>
        <div>
          <button className="btn btn-primary">Create project</button>
        </div>
      </form>
    </div>
  );
}
