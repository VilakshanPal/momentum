import { seed } from "@/lib/seed";

// Vercel Cron hits this daily (see vercel.json) with "Authorization: Bearer $CRON_SECRET".
// Restores the demo workspace so judges always land on clean seeded data.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const id = await seed();
  return Response.json({ ok: true, project: id });
}
