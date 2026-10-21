/** Import the private JSON export created by export-postgres-data.mjs.
 * Defaults to preview. Use --apply only after the MariaDB schema has been initialized.
 * Target tables must be empty; this protects existing destination data from replacement.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mariadb from "mariadb";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.resolve(process.env.MIGRATION_FILE ?? path.join(root, "migration-export.json"));
const apply = process.argv.includes("--apply");
if (!fs.existsSync(sourcePath)) throw new Error(`Migration export not found: ${sourcePath}`);
const data = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
if (data.version !== 1 || !Array.isArray(data.categories) || !Array.isArray(data.products) || !Array.isArray(data.adminUsers)) {
  throw new Error("Migration export format is invalid.");
}

const required = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) throw new Error(`Missing MariaDB setting(s): ${missing.join(", ")}`);
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionLimit: 1,
  connectTimeout: 10000,
  charset: "utf8mb4",
});

try {
  const conn = await pool.getConnection();
  let transactionStarted = false;
  try {
    const [categories] = await conn.query("SELECT COUNT(*) AS count FROM categories");
    const [products] = await conn.query("SELECT COUNT(*) AS count FROM products");
    const [admins] = await conn.query("SELECT COUNT(*) AS count FROM admin_users");
    const targetCount = Number(categories.count) + Number(products.count) + Number(admins.count);
    console.log(`Source: ${data.categories.length} categories, ${data.products.length} products, ${data.adminUsers.length} admin accounts.`);
    console.log(`Target rows currently present: ${targetCount}.`);
    if (targetCount !== 0) throw new Error("Import stopped because the target tables are not empty. Use a fresh database or merge records manually.");
    if (!apply) {
      console.log("Preview only. No database changes made. Rerun with --apply to import the records.");
      process.exitCode = 0;
    } else {
      await conn.beginTransaction();
      transactionStarted = true;
      for (const row of data.categories) {
        await conn.query("INSERT INTO categories (`key`, label, sort_order, source_hash) VALUES (?, ?, ?, ?)",
          [row.key, row.label, row.sort_order, row.source_hash ?? null]);
      }
      for (const row of data.products) {
        await conn.query(
          `INSERT INTO products
           (id, code, name, category_key, image, video, short_desc, features, tag, sort_order, is_active, source_hash, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [row.id, row.code, row.name, row.category_key, row.image, row.video ?? null, row.short_desc,
            JSON.stringify(Array.isArray(row.features) ? row.features : []), row.tag ?? null, row.sort_order,
            row.is_active ? 1 : 0, row.source_hash ?? null, sqlDate(row.created_at), sqlDate(row.updated_at)]
        );
      }
      for (const row of data.adminUsers) {
        await conn.query(
          `INSERT INTO admin_users
           (id, username, password_hash, role, must_change_password, created_at, updated_at, last_login_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [row.id, row.username, row.password_hash, row.role, row.must_change_password ? 1 : 0,
            sqlDate(row.created_at), sqlDate(row.updated_at), sqlDate(row.last_login_at)]
        );
      }
      await conn.commit();
      transactionStarted = false;
      console.log("Legacy catalog and admin accounts imported. Existing sessions were intentionally not transferred.");
    }
  } catch (error) {
    if (transactionStarted) await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
} finally {
  await pool.end();
}

function sqlDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("The export contains an invalid date.");
  return date.toISOString().replace("T", " ").replace("Z", "").slice(0, 23);
}
