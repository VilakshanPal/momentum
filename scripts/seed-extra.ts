// Adds the extra clients, projects and meetings from src/lib/seed-data.ts to an existing workspace without wiping anything.
// Fixed ids, inserts only: safe to run twice. Usage: npm run db:seed:extra (DATABASE_URL picks the database).
import { pool } from "../src/lib/db";
import { seedExtra } from "../src/lib/seed";

async function main() {
  const c = await pool.connect();
  try {
    await c.query("begin");
    await seedExtra(c);
    await c.query("commit");
    console.log("extra clients, projects and meetings are in");
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
    await pool.end();
  }
}
main();
