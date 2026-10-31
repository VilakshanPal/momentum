// Adds the whole sample workspace (the Aarohi story plus src/lib/seed-data.ts) to an existing database without wiping anything.
// Fixed ids, inserts only: safe to run twice. Usage: npm run db:seed:extra (DATABASE_URL picks the database).
import { pool } from "../src/lib/db";
import { seedDemo, seedExtra } from "../src/lib/seed";

async function main() {
  const c = await pool.connect();
  try {
    await c.query("begin");
    await seedDemo(c);
    await seedExtra(c);
    await c.query("commit");
    console.log("sample workspace is in; existing data untouched");
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
    await pool.end();
  }
}
main();
