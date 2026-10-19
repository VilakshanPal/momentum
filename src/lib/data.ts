import { q, one } from "./db";
import type { Item, Meeting, Project } from "./schema";

export const listProjects = () => q<Project>(`select * from projects order by created_at`);

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

export const getMeeting = (id: string) => one<Meeting>(`select * from meetings where id = $1`, [id]);

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
