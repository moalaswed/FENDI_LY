/** One-time MariaDB super-admin provisioning; prompts for secrets without logging them. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import mariadb from "mariadb";
import bcrypt from "bcryptjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log("Set DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD; then run: node scripts/bootstrap-super-admin.mjs");
  process.exit(0);
}
const required = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) throw new Error(`Missing MariaDB setting(s): ${missing.join(", ")}`);

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    if (!hidden || !process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); });
      return;
    }
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    let value = "";
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") {
          process.stdin.setRawMode(false); process.stdin.pause(); process.stdin.removeListener("data", onData);
          process.stdout.write("\n"); resolve(value); return;
        }
        if (char === "\u0003") { process.exit(1); }
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1); else value += char;
      }
    };
    process.stdin.on("data", onData);
  });
}

const username = (process.env.BOOTSTRAP_ADMIN_USER ?? await ask("Super-admin username: ")).trim();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? await ask("Super-admin password (hidden): ", true);
if (username.length < 3 || username.length > 100) throw new Error("Username must be 3–100 characters.");
if (password.length < 12) throw new Error("Use a password with at least 12 characters.");
const passwordHash = await bcrypt.hash(password, 12);
const pool = mariadb.createPool({
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT ?? 3306), database: process.env.DB_NAME,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionLimit: 1, connectTimeout: 10000,
  charset: "utf8mb4",
});

try {
  const conn = await pool.getConnection();
  try {
    const schema = fs.readFileSync(path.join(root, "scripts", "auth-schema.sql"), "utf8");
    for (const statement of schema.split(/;\s*(?:\r?\n|$)/).map((item) => item.trim()).filter(Boolean)) await conn.query(statement);
    await conn.beginTransaction();
    const rows = await conn.query("SELECT id, must_change_password FROM admin_users WHERE username = ? FOR UPDATE", [username]);
    if (rows.length) {
      if (!Boolean(Number(rows[0].must_change_password))) throw new Error("This admin account has already completed activation; refusing to reset it.");
      await conn.query("UPDATE admin_users SET password_hash = ?, updated_at = NOW(3) WHERE id = ?", [passwordHash, rows[0].id]);
    } else {
      await conn.query(
        "INSERT INTO admin_users (id, username, password_hash, role, must_change_password) VALUES (?, ?, ?, 'super_admin', 1)",
        [`adm_${crypto.randomBytes(16).toString("hex")}`, username, passwordHash]
      );
    }
    await conn.commit();
    console.log(`Super-admin account is ready: ${username}. It must change its password on first sign-in.`);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
} finally {
  await pool.end();
}
