/** Create the catalog and admin tables in the configured MariaDB database. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mariadb from "mariadb";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) throw new Error(`Missing MariaDB settings: ${missing.join(", ")}`);

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
  try {
    for (const file of ["schema.sql", "auth-schema.sql"]) {
      const contents = fs.readFileSync(path.join(root, "scripts", file), "utf8");
      const statements = contents
        .split(/;\s*(?:\r?\n|$)/)
        .map((statement) => statement.trim())
        .filter(Boolean);
      for (const statement of statements) await conn.query(statement);
      console.log(`Applied ${file}.`);
    }
    console.log("MariaDB schema is ready.");
  } finally {
    conn.release();
  }
} finally {
  await pool.end();
}
