import { notFound } from "next/navigation";
import { carriedItems, getMeeting, getProject, listMeetingItems, nextSample, projectPeople, supersedableDecisions } from "@/lib/data";
import { momToMarkdown } from "@/lib/markdown";
import { sampleByNo } from "@/lib/samples";
import { MeetingEditor } from "@/components/MeetingEditor";
import { MeetingView } from "@/components/MeetingView";

// LLM generation can take a while on long notes; allow the server action up to 60s (Vercel Hobby ceiling).
// Two model calls per draft (medium reasoning, then the review). 120 needs Fluid compute on Vercel, which new projects have.
export const maxDuration = 120;

export default async function MeetingPage({ params, searchParams }: { params: Promise<{ id: string; mid: string }>; searchParams: Promise<{ demo?: string }> }) {
  const [{ id, mid }, { demo }] = await Promise.all([params, searchParams]);
  const meeting = await getMeeting(mid);
  if (!meeting || meeting.project_id !== id) notFound();
  const project = (await getProject(id))!;
  const [carried, people] = await Promise.all([carriedItems(id, meeting), projectPeople(id)]);

  if (meeting.status === "published") {
    const items = await listMeetingItems(mid);
    return <MeetingView meeting={meeting} projectName={project.name} projectId={id} items={items} carried={carried} people={people} team={project.team} clientEmail={project.client_email} markdown={momToMarkdown(meeting, items, project.name)} justPublished={!!meeting.just_published} />;
  }

  // A draft that is already a call of the story keeps its own notes; any other draft is offered the next unused call.
  const [supersedable, sample] = await Promise.all([supersedableDecisions(id), meeting.sample_no ? sampleByNo(meeting.sample_no) : nextSample(id)]);
  return <MeetingEditor meeting={meeting} projectName={project.name} projectId={id} carried={carried} supersedable={supersedable} people={people} team={project.team} sample={sample} demo={demo === "1" && !meeting.raw_notes && !meeting.mom} />;
}
