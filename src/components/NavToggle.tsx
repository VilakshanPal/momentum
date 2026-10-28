"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

// Opens the sidebar as an overlay under 900px. State lives on <html data-nav>, so the server-rendered sidebar needs no client code.
const set = (open: boolean) => (open ? document.documentElement.setAttribute("data-nav", "") : document.documentElement.removeAttribute("data-nav"));

export function NavToggle() {
  const path = usePathname();
  useEffect(() => set(false), [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && set(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);
  return (
    <button className="btn btn-ghost btn-icon size-8 min-[900px]:hidden -ml-1" onClick={() => set(true)} aria-label="Open navigation">
      <Menu className="size-4" />
    </button>
  );
}

export function NavBackdrop() {
  return <div className="sidebar-backdrop" onClick={() => set(false)} aria-hidden />;
}
