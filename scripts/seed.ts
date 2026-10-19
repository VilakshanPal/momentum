import { seed } from "../src/lib/seed";
import { pool } from "../src/lib/db";

seed()
  .then((id) => console.log("seeded project", id))
  .finally(() => pool.end());
