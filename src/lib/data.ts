import { q, one } from "./db";
import type { Item, Meeting, Project } from "./schema";

export const listProjects = () => q<Project>(`select * from projects order by created_at`);

export type ProjectStats = { meetings: number; open_actions: number; open_questions: number; decisions: number; actions: number; questions: number };

export const projectStats = async (projectId: string): Promise<ProjectStats> =>
  (await one<ProjectStats>(
    `select
       (select count(*)::int from meetings where project_id = $1) as meetings,
       (select count(*)::int from items where project_id = $1 and kind = 'action' and status <> 'done') as open_actions,
       (select count(*)::int from items where project_id = $1 and kind = 'question' and status = 'open') as open_questions,
       (select count(*)::int from items where project_id = $1 and kind = 'decision') as decisions,
       (select count(*)::int from items where project_id = $1 and kind = 'action') as actions,
       (select count(*)::int from items where project_id = $1 and kind = 'question') as questions`,
    [projectId],
  ))!;

export const getProject = (id: string) => one<Project>(`select * from projects where id = $1`, [id]);

export const listMeetings = (projectId: string) =>
  q<Meeting & { decisions: number; actions: number; questions: number }>(
    `select m.*,
       (select count(*)::int from items i where i.meeting_id = m.id and i.kind = 'decision') as decisions,
       (select count(*)::int from items i where i.meeting_id = m.id and i.kind = 'action') as actions,
       (select count(*)::int from items i where i.meeting_id = m.id and i.kind = 'question') as questions
     from meetings m where m.project_id = $1 order by m.held_on desc, m.created_at desc`,
    [projectId],
  );

// just_published drives the "what happens next" banner right after a publish. Clock lives in the DB, not the render.
export const getMeeting = (id: string) => one<Meeting>(`select *, (published_at > now() - interval '3 minutes') as just_published from meetings where id = $1`, [id]);

const ITEM_SELECT = `select i.*, m.title as meeting_title, m.held_on as meeting_held_on
  from items i join meetings m on m.id = i.meeting_id`;

export const listItems = (projectId: string, kind?: Item["kind"]) =>
  q<Item>(
    `${ITEM_SELECT} where i.project_id = $1 ${kind ? "and i.kind = $2" : ""}
     order by m.held_on desc, i.kind, i.position, i.created_at`,
    kind ? [projectId, kind] : [projectId],
  );

export const listMeetingItems = (meetingId: string) =>
  q<Item>(`${ITEM_SELECT} where i.meeting_id = $1 order by i.kind, i.position, i.created_at`, [meetingId]);

// Unresolved work from earlier published meetings in the same project. Same rows, never copies.
export const carriedItems = (projectId: string, meeting: { id: string; held_on: string }) =>
  q<Item>(
    `${ITEM_SELECT}
     where i.project_id = $1 and i.meeting_id <> $2 and m.status = 'published' and m.held_on <= $3
       and ((i.kind = 'action' and i.status <> 'done') or (i.kind = 'question' and i.status = 'open'))
     order by i.kind, m.held_on, i.position`,
    [projectId, meeting.id, meeting.held_on],
  );

// All unresolved work in a project, for the overview rail.
export const openItems = (projectId: string) =>
  q<Item>(
    `${ITEM_SELECT}
     where i.project_id = $1
       and ((i.kind = 'action' and i.status <> 'done') or (i.kind = 'question' and i.status = 'open'))
     order by i.kind, m.held_on, i.position`,
    [projectId],
  );

// Decisions a new decision may supersede: confirmed ones in this project.
export const supersedableDecisions = (projectId: string) =>
  q<Item>(
    `${ITEM_SELECT} where i.project_id = $1 and i.kind = 'decision' and i.status = 'confirmed' order by m.held_on desc, i.position`,
    [projectId],
  );

// Distinct people seen in this project, for owner suggestions. "Priya Nair (HAIRO)" and "Priya" collapse to one entry.
export const projectPeople = async (projectId: string) => {
  const rows = await q<{ name: string }>(
      `select distinct name from (
         select jsonb_array_elements_text(participants) as name from meetings where project_id = $1
         union select owner from items where project_id = $1 and owner is not null
       ) p where name <> '' order by name`,
      [projectId],
    );
  const byFirst = new Map<string, string>();
  for (const { name } of rows) {
    const clean = name.replace(/\s*\(.*?\)\s*/g, "").trim();
    const key = clean.split(/\s+/)[0].toLowerCase();
    const cur = byFirst.get(key);
    if (!cur || clean.length > cur.length) byFirst.set(key, clean);
  }
  return [...byFirst.values()].sort();
};
