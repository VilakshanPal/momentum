"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Pencil, X } from "lucide-react";
import { updateMeetingDetails } from "@/lib/actions";
import type { Meeting } from "@/lib/schema";
import { PeoplePicker } from "./PeoplePicker";
import { Spinner } from "./ui";

// Correct a published meeting's title, date, time or participants. The record itself (decisions, actions, questions) is edited on the board.
export function MeetingDetailsDialog({ meeting, people }: { meeting: Meeting; people: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(meeting.title);
  const [date, setDate] = useState(meeting.held_on);
  const [time, setTime] = useState(meeting.held_time ? meeting.held_time.slice(0, 5) : "");
  const [who, setWho] = useState(meeting.participants);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const field = "field h-10 px-3 text-[14px]";
  const lbl = "text-[13px] font-medium text-ink";
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    const r = await updateMeetingDetails(meeting.id, { title, held_on: date, held_time: time || null, participants: who });
    setBusy(false);
    if (r.ok) {
      setOpen(false);
      router.refresh();
    } else setError(r.error);
  };
  return (
    <Dialog.Root open={open} onOpenChange={(o, d) => (o || d.reason !== "outside-press") && setOpen(o)}>
      <Dialog.Trigger className="btn btn-ghost btn-icon size-8 text-ink-3" title="Edit details" aria-label="Edit details">
        <Pencil className="size-3.5" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="drawer-backdrop" />
        <Dialog.Popup className="modal">
          <div className="px-6 pt-5 pb-4 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-[17px] font-semibold text-ink tracking-[-0.2px]">Meeting details</Dialog.Title>
              <Dialog.Description className="mt-1 text-[14px] text-ink-3 leading-relaxed">Title, date and who was there. Decisions, actions and questions are edited on the board.</Dialog.Description>
            </div>
            <Dialog.Close className="btn btn-ghost btn-icon size-8 -mr-2 -mt-1 text-ink-3" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <form onSubmit={submit} className="flex flex-col">
            <div className="px-6 pb-6 flex flex-col gap-5">
              <label className="flex flex-col gap-1.5">
                <span className={lbl}>
                  Title <span className="text-red">*</span>
                </span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required className={field} maxLength={160} aria-label="Meeting title" />
              </label>
              <div className="flex gap-4">
                <label className="flex flex-col gap-1.5 w-40">
                  <span className={lbl}>Date</span>
                  <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className={field} aria-label="Meeting date" />
                </label>
                <label className="flex flex-col gap-1.5 w-28">
                  <span className={lbl}>
                    Time <span className="font-normal text-ink-4">optional</span>
                  </span>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={field} aria-label="Meeting time" />
                </label>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="details-participants" className={lbl}>
                  Participants
                </label>
                <PeoplePicker id="details-participants" value={who} onChange={setWho} options={people} />
              </div>
              {error && <p className="text-[13px] text-red">{error}</p>}
            </div>
            <div className="px-6 py-4 flex items-center justify-end gap-2 bg-surface-2 border-t border-hairline rounded-b-lg">
              <Dialog.Close className="btn btn-ghost btn-lg">Cancel</Dialog.Close>
              <button className="btn btn-primary btn-lg min-w-20 justify-center" disabled={!title.trim() || busy}>
                {busy && <Spinner />}
                {busy ? "Saving" : "Save"}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
