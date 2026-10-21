import "server-only";
import mariadb, { type Pool, type PoolConfig } from "mariadb";

if (typeof window !== "undefined") {
  throw new Error("lib/db.ts is a server-only module and cannot be executed in the browser.");
}

declare global {
  // Reuse the connection pool during Next.js development hot reloads.
  var _fendiMariaDbPool: Pool | undefined;
}

export interface QueryResult<R> {
  rows: R[];
  rowCount: number;
}

function createPool(): Pool {
  const config: PoolConfig = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: Number(process.env.DB_POOL_MAX ?? 5),
    connectTimeout: Number(process.env.DB_CONN_TIMEOUT ?? 10000),
    acquireTimeout: Number(process.env.DB_ACQUIRE_TIMEOUT ?? 10000),
    bigIntAsNumber: true,
    dateStrings: true,
    timezone: "local",
    charset: "utf8mb4",
  };

  if (process.env.DB_SSL?.trim().toLowerCase() === "true") {
    config.ssl = { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" };
  }
  return mariadb.createPool(config);
}

export const pool = globalThis._fendiMariaDbPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalThis._fendiMariaDbPool = pool;

/**
 * Run parameterized SQL using the shared MariaDB pool. PostgreSQL-style numbered
 * placeholders are translated for compatibility with existing call sites.
 */
export async function query<R = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<QueryResult<R>> {
  const required = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"];
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    throw new Error(`[DATABASE CONFIG ERROR] Missing MariaDB setting(s): ${missing.join(", ")}.`);
  }
  const numbered = /\$(\d+)/g;
  const matches = [...sql.matchAll(numbered)];
  let usesNumberedPlaceholders = false;
  const statement = sql.replace(numbered, (_match, position: string) => {
    usesNumberedPlaceholders = true;
    const index = Number(position) - 1;
    if (index < 0 || index >= params.length) {
      throw new Error("Invalid SQL parameter position.");
    }
    return "?";
  });
  const orderedParams = usesNumberedPlaceholders
    ? matches.map((match) => params[Number(match[1]) - 1])
    : params;

  const result = await pool.query(statement, orderedParams);
  if (Array.isArray(result)) {
    return { rows: result as R[], rowCount: result.length };
  }
  const header = result as { affectedRows?: number; insertId?: number };
  return { rows: [], rowCount: header.affectedRows ?? 0 };
}

export default pool;
