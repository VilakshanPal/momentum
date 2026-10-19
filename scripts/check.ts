import { pool } from "../src/lib/db";

pool
  .query("select kind, status, count(*)::int from items group by 1,2 order by 1,2")
  .then((r) => console.table(r.rows))
  .finally(() => pool.end());
