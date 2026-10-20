// Local dev only: starts a real Postgres on :5433 with data in .pgdata/.
// Production uses Supabase via DATABASE_URL. Same SQL everywhere.
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";

const pg = new EmbeddedPostgres({
  databaseDir: ".pgdata",
  user: "momentum",
  password: "momentum",
  port: 5433,
  persistent: true,
  // Windows initdb defaults to the system codepage (WIN1252), which rejects names like "Nguyễn" or "李".
  // Supabase is UTF8; match it locally. Applies on first init only: delete .pgdata to re-init.
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

async function main() {
  if (!existsSync(".pgdata/PG_VERSION")) {
    await pg.initialise();
  }
  await pg.start();
  try {
    await pg.createDatabase("momentum");
  } catch {
    /* already exists */
  }
  console.log("postgres ready: postgres://momentum:momentum@localhost:5433/momentum");
  const stop = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
