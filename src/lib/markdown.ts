import type { Item, Meeting } from "./schema";

// Plain Markdown export of a published meeting. Pure function, no I/O.
export function momToMarkdown(meeting: Meeting, items: Item[], projectName: string) {
  const mom = meeting.mom!;
  const by = (k: Item["kind"]) => items.filter((i) => i.kind === k);
  const L: string[] = [];
  L.push(`# ${projectName} · ${meeting.title}`, `${meeting.held_on}${meeting.participants.length ? ` · ${meeting.participants.join(", ")}` : ""}`, "");
  L.push("## Summary", mom.summary, "");
  if (mom.discussion_points.length) L.push("## Discussion", ...mom.discussion_points.map((p) => `- ${p}`), "");
  const dec = by("decision");
  if (dec.length) L.push("## Decisions", ...dec.map((d) => `- **${d.title}** _(${d.status})_${d.detail ? ` · ${d.detail}` : ""}`), "");
  const act = by("action");
  if (act.length)
    L.push(
      "## Action items",
      ...act.map((a) => `- [${a.status === "done" ? "x" : " "}] ${a.title} · ${a.owner ?? "unassigned"}${a.due_on ? `, due ${a.due_on}` : ""}${a.blocker ? ` · blocked: ${a.blocker}` : ""}`),
      "",
    );
  const qs = by("question");
  if (qs.length) L.push("## Open questions", ...qs.map((q) => `- ${q.title}${q.owner ? ` (${q.owner})` : ""}`), "");
  if (mom.follow_up_context) L.push("## Follow-up", mom.follow_up_context, "");
  return L.join("\n");
}
