import { notFound } from "next/navigation";
import { carriedItems, getMeeting, getProject, listMeetingItems, projectPeople, supersedableDecisions } from "@/lib/data";
import { momToMarkdown } from "@/lib/markdown";
import { SAMPLE_NOTES } from "@/lib/seed";
import { MeetingEditor } from "@/components/MeetingEditor";
import { MeetingView } from "@/components/MeetingView";

// LLM generation can take a while on long notes; allow the server action up to 60s (Vercel Hobby ceiling).
export const maxDuration = 60;

export default async function MeetingPage({ params, searchParams }: { params: Promise<{ id: string; mid: string }>; searchParams: Promise<{ demo?: string }> }) {
  const [{ id, mid }, { demo }] = await Promise.all([params, searchParams]);
  const meeting = await getMeeting(mid);
  if (!meeting || meeting.project_id !== id) notFound();
  const project = (await getProject(id))!;
  const [carried, people] = await Promise.all([carriedItems(id, meeting), projectPeople(id)]);

  if (meeting.status === "published") {
    const items = await listMeetingItems(mid);
    return <MeetingView meeting={meeting} projectName={project.name} projectId={id} items={items} carried={carried} people={people} markdown={momToMarkdown(meeting, items, project.name)} justPublished={!!meeting.just_published} />;
  }

  const supersedable = await supersedableDecisions(id);
  return <MeetingEditor meeting={meeting} projectName={project.name} projectId={id} carried={carried} supersedable={supersedable} people={people} sampleNotes={SAMPLE_NOTES} demo={demo === "1" && !meeting.raw_notes && !meeting.mom} />;
}
