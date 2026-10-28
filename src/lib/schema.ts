import { z } from "zod";

// Shape of a Minutes-of-Meeting draft. Produced by the LLM, validated here, edited by the user,
// stored in meetings.mom, and turned into `items` rows on publish.
// Rule: owner/due_on are null unless the notes state them. Nothing is invented.

// Field order matters: the model writes fields in schema order, so evidence comes first and anchors the item to the notes.
const Decision = z.object({
  evidence: z.string().nullable(),
  title: z.string(),
  detail: z.string().nullable(),
  status: z.enum(["proposed", "confirmed"]),
});

const Action = z.object({
  evidence: z.string().nullable(),
  title: z.string(),
  detail: z.string().nullable(),
  owner: z.string().nullable(),
  due_on: z.string().nullable(), // YYYY-MM-DD
  blocker: z.string().nullable(),
});

const Question = z.object({
  evidence: z.string().nullable(),
  title: z.string(),
  owner: z.string().nullable(),
});

// Suggested status change for an item carried forward from an earlier meeting. Applied only if the user ticks it.
const CarriedUpdate = z.object({
  item_id: z.string(),
  evidence: z.string().nullable(),
  suggested_status: z.string(),
});

export const MomSchema = z.object({
  participants: z.array(z.string()), // names the notes identify as attendees; empty if none
  summary: z.string(),
  discussion_points: z.array(z.string()),
  decisions: z.array(Decision),
  actions: z.array(Action),
  questions: z.array(Question),
  carried_updates: z.array(CarriedUpdate),
  follow_up_context: z.string(),
});

// What is stored on meetings.mom after the user edits: adds review-only fields the LLM never sets.
// `skipped` = the reviewer rejected this suggestion. It stays in the draft for traceability but never becomes a record.
const reviewed = { skipped: z.boolean().optional() };
export const DraftSchema = MomSchema.extend({
  decisions: z.array(Decision.extend({ supersedes_id: z.string().nullable().optional(), ...reviewed })),
  actions: z.array(Action.extend(reviewed)),
  questions: z.array(Question.extend(reviewed)),
  carried_updates: z.array(CarriedUpdate.extend({ accepted: z.boolean().optional() })),
});
export type Draft = z.infer<typeof DraftSchema>;

export type Mom = z.infer<typeof MomSchema>;

// The second pass: a reviewer model checks every draft item against the notes and lists what the draft missed.
// It can change an item's kind or a decision's status and add items; it cannot remove one. Removing is the human's job in Review.
const KIND = z.enum(["decision", "action", "question"]);
export const ReviewSchema = z.object({
  verdicts: z.array(
    z.object({
      ref: z.string(), // d1, a2, q1 as labelled in the input
      kind: KIND,
      status: z.enum(["proposed", "confirmed"]).nullable(), // decisions only
      reason: z.string(),
    }),
  ),
  missed: z.array(
    z.object({
      evidence: z.string(), // verbatim, or the item is dropped
      kind: KIND,
      title: z.string(),
      owner: z.string().nullable(),
      due_on: z.string().nullable(),
      status: z.enum(["proposed", "confirmed"]).nullable(),
    }),
  ),
});
export type Review = z.infer<typeof ReviewSchema>;
export type MomDecision = z.infer<typeof Decision>;
export type MomAction = z.infer<typeof Action>;
export type MomQuestion = z.infer<typeof Question>;
export type MomCarriedUpdate = z.infer<typeof CarriedUpdate>;

export const ITEM_STATUSES = {
  decision: ["proposed", "confirmed", "superseded"],
  action: ["todo", "in_progress", "done", "blocked"],
  question: ["open", "resolved"],
} as const;

export type ItemKind = keyof typeof ITEM_STATUSES;
export type ItemStatus = (typeof ITEM_STATUSES)[ItemKind][number];

export const MAX_NOTES_CHARS = 20_000;

// Row types as read from Postgres (dates come back as strings via pg type parsing below).
export type Project = {
  id: string;
  name: string;
  client_id: string | null;
  client: string | null; // the client's brand, joined
  client_email: string | null; // the client contact's email, joined
  client_contact: string | null; // the client contact's name, joined
  description: string | null;
  team: string[]; // names managed in Project settings, offered in the participants picker
  created_at: string;
};

export type Meeting = {
  id: string;
  project_id: string;
  title: string;
  held_on: string;
  held_time: string | null; // HH:MM, optional
  participants: string[];
  raw_notes: string;
  mom: Draft | null;
  status: "draft" | "published";
  published_at: string | null;
  sample_no: number | null; // which call of the sample story, null for a meeting made from scratch
  created_at: string;
  just_published?: boolean | null; // joined by getMeeting
};

export type Item = {
  id: string;
  project_id: string;
  meeting_id: string | null; // null: added on the board by hand
  kind: ItemKind;
  title: string;
  detail: string | null;
  owner: string | null;
  due_on: string | null;
  status: ItemStatus;
  blocker: string | null;
  evidence: string | null;
  supersedes_id: string | null;
  position: number;
  created_at: string;
  // joined
  meeting_title?: string | null;
  meeting_held_on?: string | null;
};

export type Client = {
  id: string;
  brand: string; // what projects group under
  name: string | null; // contact
  email: string | null;
  projects: number;
  meetings: number;
};

export type Person = {
  name: string;
  email: string | null;
  role: string | null;
  projects: number; // how many projects list them as a teammate
};

export type Comment = {
  id: string;
  item_id: string;
  author: string | null;
  body: string;
  created_at: string;
};
