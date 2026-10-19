// Applies db/migrations/*.sql in filename order, once each. Works on local and Supabase.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const url = process.env.DATABASE_URL ?? "postgres://momentum:momentum@localhost:5433/momentum";

async function main() {
  const c = new Client({ connectionString: url });
  await c.connect();
  await c.query(`create table if not exists _migrations (name text primary key, applied_at timestamptz default now())`);
  const done = new Set((await c.query<{ name: string }>(`select name from _migrations`)).rows.map((r) => r.name));
  const dir = join(process.cwd(), "db/migrations");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    if (done.has(f)) continue;
    const sql = readFileSync(join(dir, f), "utf8");
    await c.query("begin");
    try {
      await c.query(sql);
      await c.query(`insert into _migrations(name) values ($1)`, [f]);
      await c.query("commit");
      console.log("applied", f);
    } catch (e) {
      await c.query("rollback");
      throw e;
    }
  }
  await c.end();
  console.log("migrations up to date");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
