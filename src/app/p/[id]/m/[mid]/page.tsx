import Link from "next/link";
import { notFound } from "next/navigation";
import { carriedItems, getMeeting, getProject, listMeetingItems, supersedableDecisions } from "@/lib/data";
import { momToMarkdown } from "@/lib/markdown";
import { SAMPLE_NOTES } from "@/lib/seed";
import { MeetingEditor } from "@/components/MeetingEditor";
import { MeetingView } from "@/components/MeetingView";

export default async function MeetingPage({ params }: { params: Promise<{ id: string; mid: string }> }) {
  const { id, mid } = await params;
  const meeting = await getMeeting(mid);
  if (!meeting || meeting.project_id !== id) notFound();
  const project = (await getProject(id))!;
  const carried = await carriedItems(id, meeting);

  const crumb = (
    <Link href={`/p/${id}`} className="text-xs text-ink-3 hover:text-ink">
      ← {project.name}
    </Link>
  );

  if (meeting.status === "published") {
    const items = await listMeetingItems(mid);
    return <MeetingView meeting={meeting} items={items} carried={carried} projectId={id} crumb={crumb} markdown={momToMarkdown(meeting, items, project.name)} />;
  }

  const supersedable = await supersedableDecisions(id);
  return <MeetingEditor meeting={meeting} carried={carried} supersedable={supersedable} projectId={id} crumb={crumb} sampleNotes={SAMPLE_NOTES} />;
}
