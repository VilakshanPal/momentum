import { q, one } from "./db";
import type { Client, Item, Meeting, Person, Project } from "./schema";
import { SAMPLES, type Sample } from "./samples";

const PROJECT_SELECT = `select p.*, c.brand as client, c.email as client_email, c.name as client_contact from projects p left join clients c on c.id = p.client_id`;
export const listProjects = () => q<Project>(`${PROJECT_SELECT} order by p.created_at`);

// The company team, for the teammates pickers.
export const listPeople = async () => (await q<{ name: string }>(`select name from people order by name`)).map((r) => r.name);

// The managed client list, for the client dropdowns and the sidebar grouping.
export const listClients = () => q<{ id: string; brand: string }>(`select id, brand from clients order by brand`);

// The Clients page: contact details and what hangs off each client.
export const listClientsDetailed = () =>
  q<Client>(
    `select c.id, c.brand, c.name, c.email,
       (select count(*)::int from projects p where p.client_id = c.id) as projects,
       (select count(*)::int from meetings m join projects p on p.id = m.project_id where p.client_id = c.id) as meetings
     from clients c order by c.brand`,
  );

// The Team page: email, role and how many projects list the person.
export const listPeopleDetailed = () =>
  q<Person>(`select name, email, role, (select count(*)::int from projects where team ? people.name) as projects from people order by name`);

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

export const getProject = (id: string) => one<Project>(`${PROJECT_SELECT} where p.id = $1`, [id]);

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
  from items i left join meetings m on m.id = i.meeting_id`;

export const listItems = (projectId: string, kind?: Item["kind"]) =>
  q<Item>(
    `${ITEM_SELECT} where i.project_id = $1 ${kind ? "and i.kind = $2" : ""}
     order by m.held_on desc nulls first, i.kind, i.position, i.created_at`,
    kind ? [projectId, kind] : [projectId],
  );

export const listMeetingItems = (meetingId: string) =>
  q<Item>(`${ITEM_SELECT} where i.meeting_id = $1 order by i.kind, i.position, i.created_at`, [meetingId]);

// Unresolved work from earlier published meetings in the same project. Same rows, never copies.
export const carriedItems = (projectId: string, meeting: { id: string; held_on: string }) =>
  q<Item>(
    `${ITEM_SELECT}
     where i.project_id = $1 and (i.meeting_id is null or (i.meeting_id <> $2 and m.status = 'published' and m.held_on <= $3))
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

// Home: every project with its client, open counts and last published meeting.
export const homeProjects = () =>
  q<Project & { open_actions: number; open_questions: number; decisions: number; last_id: string | null; last_title: string | null; last_held_on: string | null }>(
    `select p.*, c.brand as client,
       (select count(*)::int from items i where i.project_id = p.id and i.kind = 'action' and i.status <> 'done') as open_actions,
       (select count(*)::int from items i where i.project_id = p.id and i.kind = 'question' and i.status = 'open') as open_questions,
       (select count(*)::int from items i where i.project_id = p.id and i.kind = 'decision') as decisions,
       lm.id as last_id, lm.title as last_title, lm.held_on as last_held_on
     from projects p
     left join clients c on c.id = p.client_id
     left join lateral (select id, title, held_on from meetings m where m.project_id = p.id and m.status = 'published' order by held_on desc, created_at desc limit 1) lm on true
     order by c.brand nulls last, p.created_at`,
  );

// Home: open actions due within a week, across projects, overdue first.
export const dueSoon = () =>
  q<Item & { project_name: string }>(
    `select i.*, p.name as project_name from items i join projects p on p.id = i.project_id
     where i.kind = 'action' and i.status <> 'done' and i.due_on is not null and i.due_on <= current_date + 7
     order by i.due_on, i.position limit 8`,
  );

export const recentMeetings = () =>
  q<Pick<Meeting, "id" | "project_id" | "title" | "held_on" | "status"> & { project_name: string }>(
    `select m.id, m.project_id, m.title, m.held_on, m.status, p.name as project_name from meetings m join projects p on p.id = m.project_id
     order by m.held_on desc, m.created_at desc limit 6`,
  );

// Home tiles: the book's open work in one row. Overdue counts every late action, not only the eight shown.
export const homeStats = () =>
  one<{ todo: number; in_progress: number; blocked: number; done: number; overdue: number; open_questions: number }>(
    `select count(*) filter (where kind = 'action' and status = 'todo')::int as todo,
       count(*) filter (where kind = 'action' and status = 'in_progress')::int as in_progress,
       count(*) filter (where kind = 'action' and status = 'blocked')::int as blocked,
       count(*) filter (where kind = 'action' and status = 'done')::int as done,
       count(*) filter (where kind = 'action' and status <> 'done' and due_on < current_date)::int as overdue,
       count(*) filter (where kind = 'question' and status = 'open')::int as open_questions
     from items`,
  ).then((r) => r!);

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

// The next call of the sample story for this project: the one after the highest published sample. Null once all ten are in.
export const nextSample = async (projectId: string): Promise<Sample | null> => {
  const r = await one<{ n: number }>(`select coalesce(max(sample_no), 0)::int as n from meetings where project_id = $1 and status = 'published'`, [projectId]);
  return SAMPLES[r!.n] ?? null;
};
