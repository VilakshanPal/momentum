import { NextResponse, type NextRequest } from "next/server";

// ?dev=yes on any page puts this browser on the mock model (no OpenAI calls) until ?dev=no or the browser closes.
// Redirects to the same URL without the parameter so the first render already sees the cookie.
export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const on = url.searchParams.get("dev") === "yes";
  url.searchParams.delete("dev");
  const res = NextResponse.redirect(url);
  if (on) res.cookies.set("dev", "1", { path: "/", sameSite: "lax", httpOnly: true });
  else res.cookies.delete("dev");
  return res;
}

export const config = {
  matcher: [{ source: "/((?!_next|.*\\..*).*)", has: [{ type: "query", key: "dev" }] }],
};
