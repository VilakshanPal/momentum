import { z } from "zod";

// Shape of a Minutes-of-Meeting draft. Produced by the LLM, validated here, edited by the user,
// stored in meetings.mom, and turned into `items` rows on publish.
// Rule: owner/due_on are null unless the notes state them. Nothing is invented.

const Decision = z.object({
  title: z.string(),
  detail: z.string().nullable(),
  status: z.enum(["proposed", "confirmed"]),
  evidence: z.string().nullable(),
});

const Action = z.object({
  title: z.string(),
  detail: z.string().nullable(),
  owner: z.string().nullable(),
  due_on: z.string().nullable(), // YYYY-MM-DD
  blocker: z.string().nullable(),
  evidence: z.string().nullable(),
});

const Question = z.object({
  title: z.string(),
  owner: z.string().nullable(),
  evidence: z.string().nullable(),
});

// Suggested status change for an item carried forward from an earlier meeting. Applied only if the user ticks it.
const CarriedUpdate = z.object({
  item_id: z.string(),
  suggested_status: z.string(),
  evidence: z.string().nullable(),
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
  client: string | null;
  description: string | null;
  created_at: string;
};

export type Meeting = {
  id: string;
  project_id: string;
  title: string;
  held_on: string;
  participants: string[];
  raw_notes: string;
  mom: Draft | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  just_published?: boolean | null; // joined by getMeeting
};

export type Item = {
  id: string;
  project_id: string;
  meeting_id: string;
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
  meeting_title?: string;
  meeting_held_on?: string;
};
