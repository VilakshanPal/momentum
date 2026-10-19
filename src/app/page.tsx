import { redirect } from "next/navigation";
import { listProjects } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [first] = await listProjects();
  redirect(first ? `/p/${first.id}` : "/new-project");
}
