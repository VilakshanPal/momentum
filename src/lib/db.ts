import { Pool, types, type QueryResultRow } from "pg";

// Return DATE columns as 'YYYY-MM-DD' strings instead of JS Dates (avoids timezone shifts).
types.setTypeParser(1082, (v) => v);

// One pool per process. globalThis keeps it alive across Next dev hot reloads.
const g = globalThis as unknown as { __pool?: Pool };
export const pool =
  g.__pool ??
  (g.__pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ?? "postgres://momentum:momentum@localhost:5433/momentum",
    max: 5,
  }));

export async function q<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
  const r = await pool.query<T>(text, params);
  return r.rows;
}

export async function one<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}
