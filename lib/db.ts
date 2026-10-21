import "server-only";
import fs from "fs";
import pg from "pg";

// Double-layered guard against accidental client-side bundling of server credentials
if (typeof window !== "undefined") {
  throw new Error("lib/db.ts is a server-only module and cannot be executed in the browser.");
}

declare global {
  var _fendiPgPool: pg.Pool | undefined;
}

export type SupportedSslMode = "disable" | "require" | "verify-ca" | "verify-full";

/**
 * Resolves PostgreSQL SSL configuration adhering to standard libpq SSL semantics.
 * Supported modes:
 *  - 'disable'     : No SSL connection.
 *  - 'require'     : SSL connection without verifying CA certificate or server hostname.
 *  - 'verify-ca'   : SSL connection verifying the CA certificate chain, skipping hostname check.
 *  - 'verify-full' : SSL connection verifying the CA certificate chain AND server hostname.
 *
 * Rejects unsupported or misspelled modes with an explicit error without leaking credentials.
 */
export function resolvePostgresSslConfig(
  env: NodeJS.ProcessEnv = process.env
): boolean | pg.ConnectionConfig["ssl"] {
  const rawMode = env.PGSSLMODE?.trim();
  const rawSsl = env.PGSSL?.trim().toLowerCase();

  let mode: SupportedSslMode;

  if (rawMode) {
    const normalized = rawMode.toLowerCase();
    if (
      normalized === "disable" ||
      normalized === "require" ||
      normalized === "verify-ca" ||
      normalized === "verify-full"
    ) {
      mode = normalized;
    } else {
      throw new Error(
        `[DATABASE CONFIG ERROR] Unsupported or invalid PGSSLMODE: "${rawMode}". Supported modes are: disable, require, verify-ca, verify-full.`
      );
    }
  } else if (rawSsl === "true" || rawSsl === "1") {
    mode = "require";
  } else {
    mode = "disable";
  }

  if (mode === "disable") {
    return false;
  }

  let ca: string | undefined;
  if (env.PGSSLROOTCERT) {
    const certPath = env.PGSSLROOTCERT.trim();
    if (!fs.existsSync(certPath)) {
      throw new Error(
        `[DATABASE CONFIG ERROR] Configured PGSSLROOTCERT file was not found on disk at the specified path.`
      );
    }
    try {
      ca = fs.readFileSync(certPath, "utf8");
    } catch {
      throw new Error(
        `[DATABASE CONFIG ERROR] Failed to read certificate from PGSSLROOTCERT file path.`
      );
    }
  }

  if (mode === "require") {
    return {
      rejectUnauthorized: false,
      ...(ca ? { ca } : {}),
    };
  }

  if (mode === "verify-ca") {
    return {
      rejectUnauthorized: true,
      checkServerIdentity: () => undefined, // Validates CA chain, bypasses hostname matching
      ...(ca ? { ca } : {}),
    };
  }

  if (mode === "verify-full") {
    return {
      rejectUnauthorized: true, // Validates CA chain AND verifies hostname matches PGHOST
      ...(ca ? { ca } : {}),
    };
  }

  return false;
}

/**
 * Validates that essential PostgreSQL environment variables are configured.
 * Does not log or expose secret values.
 */
function validateDbEnv(): void {
  const required = ["PGHOST", "PGUSER", "PGDATABASE", "PGPASSWORD"];
  const missing = required.filter((key) => !process.env[key] || process.env[key]?.trim() === "");

  if (missing.length > 0) {
    console.error(
      `[DATABASE CONFIG ERROR] Missing required PostgreSQL environment variable(s): ${missing.join(", ")}. Please configure them in your environment or .env.local.`
    );
  }
}

/**
 * Creates and configures a resilient PostgreSQL connection pool.
 * Compatible with local development, containerized environments, and cPanel Phusion Passenger.
 */
function createPool(): pg.Pool {
  validateDbEnv();
  const sslConfig = resolvePostgresSslConfig(process.env);

  const pool = new pg.Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT ?? 5432),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    // Pool sizing: conservative for hosting environments (like cPanel passenger workers)
    max: Number(process.env.PGPOOL_MAX ?? 10),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT ?? 30000),
    connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT ?? 5000),
    ssl: sslConfig,
  });

  // Handle unexpected errors on idle clients in the pool to prevent process crashing
  pool.on("error", (err) => {
    console.error("[DATABASE POOL ERROR] Unexpected error on idle PostgreSQL client:", err.message);
  });

  return pool;
}

// In development, preserve the pool across HMR reloads to prevent connection leaks
export const pool: pg.Pool = globalThis._fendiPgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis._fendiPgPool = pool;
}

/**
 * Helper to run a parameterized SQL query safely with the shared pool.
 */
export async function query<R extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<R>> {
  return pool.query<R>(text, params);
}

export default pool;
