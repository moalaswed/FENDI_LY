/** Export catalog and admin account records from the legacy PostgreSQL database.
 * The generated JSON contains password hashes, so it is git-ignored and should be
 * deleted after import. Sessions and rate-limit records are intentionally omitted.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = ["PGHOST", "PGDATABASE", "PGUSER", "PGPASSWORD"];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) throw new Error(`Missing legacy PostgreSQL setting(s): ${missing.join(", ")}`);
const sslMode = (process.env.PGSSLMODE ?? "disable").toLowerCase();
if (!["disable", "require", "verify-ca", "verify-full"].includes(sslMode)) throw new Error("Unsupported PGSSLMODE for legacy export.");
let ssl = false;
if (sslMode === "require") ssl = { rejectUnauthorized: false };
if (sslMode === "verify-ca" || sslMode === "verify-full") {
  const caPath = process.env.PGSSLROOTCERT?.trim();
  const ca = caPath ? fs.readFileSync(caPath, "utf8") : undefined;
  ssl = {
    rejectUnauthorized: true,
    ...(sslMode === "verify-ca" ? { checkServerIdentity: () => undefined } : {}),
    ...(ca ? { ca } : {}),
  };
}
const pool = new pg.Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  connectionTimeoutMillis: 10000,
  ssl,
});

try {
  const [categories, products, admins] = await Promise.all([
    pool.query("SELECT key, label, sort_order, source_hash FROM categories ORDER BY sort_order, key"),
    pool.query("SELECT id, code, name, category_key, image, video, short_desc, features, tag, sort_order, is_active, source_hash, created_at, updated_at FROM products ORDER BY id"),
    pool.query("SELECT id, username, password_hash, role, must_change_password, created_at, updated_at, last_login_at FROM admin_users ORDER BY id"),
  ]);
  const output = path.join(root, "migration-export.json");
  fs.writeFileSync(output, JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), categories: categories.rows, products: products.rows, adminUsers: admins.rows }, null, 2), { mode: 0o600 });
  console.log(`Exported ${categories.rowCount} categories, ${products.rowCount} products, and ${admins.rowCount} admin accounts.`);
  console.log("The export includes password hashes. Keep it private and delete it after importing.");
  console.log(`Export file created: ${output}`);
} finally {
  await pool.end();
}
