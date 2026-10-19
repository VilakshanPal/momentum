import { notFound } from "next/navigation";
import { getProject } from "@/lib/data";
import { Tab } from "@/components/NavLink";

export default async function ProjectLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const base = `/p/${id}`;
  return (
    <div className="min-h-full flex flex-col">
      <header className="px-10 pt-8 border-b border-line">
        <p className="text-xs text-ink-3">{project.client ?? "Project"}</p>
        <h1 className="text-[22px] font-semibold tracking-tight mt-0.5">{project.name}</h1>
        {project.description && <p className="text-ink-2 mt-1 max-w-2xl">{project.description}</p>}
        <nav className="flex gap-5 mt-4">
          <Tab href={base} exact>
            Meetings
          </Tab>
          <Tab href={`${base}/board`}>Board</Tab>
          <Tab href={`${base}/decisions`}>Decisions</Tab>
        </nav>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
