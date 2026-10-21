/**
 * FENDI Plastic Industry - Super Admin Provisioning Script (One-Time CLI Bootstrap)
 *
 * Supported Usage Methods:
 *   1. Interactive TTY (suppresses terminal echo on supported TTY platforms):
 *      node --env-file=.env.local scripts/bootstrap-super-admin.mjs
 *
 *   2. Non-interactive / Environment Variables (recommended for headless or automated setups):
 *      BOOTSTRAP_ADMIN_USER="saleh_alnjila" BOOTSTRAP_ADMIN_PASSWORD="..." node --env-file=.env.local scripts/bootstrap-super-admin.mjs
 *
 * Security:
 *   - Never hard-codes credentials in source code or files.
 *   - Uses TTY raw mode to suppress terminal echo when supported.
 *   - Only a salted bcrypt hash (rounds: 12) is stored in the database.
 *   - Enforces `must_change_password = true` for mandatory first-login password rotation.
 *   - Does NOT log passwords or hashes.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import readline from "readline";
import { fileURLToPath } from "url";
import pg from "pg";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Parse CLI flags
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
FENDI Plastic Industry - Super Administrator Provisioning CLI

Usage:
  node --env-file=.env.local scripts/bootstrap-super-admin.mjs

Options:
  --help, -h    Show this help message.

Environment Variables:
  BOOTSTRAP_ADMIN_USER      (Optional) Initial username. If omitted, prompts interactively.
  BOOTSTRAP_ADMIN_PASSWORD  (Optional) Initial password. If omitted, prompts with terminal echo suppression.
  PGHOST, PGPORT, etc.      PostgreSQL connection configuration.
`);
  process.exit(0);
}

/**
 * Prompts user for a password with genuine terminal echo suppression on supported TTYs.
 * If running in a non-TTY or unsupported environment, warns the user and falls back to
 * standard line input or environment variable configuration.
 */
function promptPassword(question) {
  return new Promise((resolve) => {
    // If not a TTY or raw mode not available, terminal echo cannot be suppressed
    if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
      console.warn(
        "\n[NOTICE] Terminal does not support TTY raw mode; password cannot be hidden during interactive entry."
      );
      console.warn(
        "To avoid displaying the password on screen, provide it via the BOOTSTRAP_ADMIN_PASSWORD environment variable instead.\n"
      );
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      });
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
      return;
    }

    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    let password = "";
    const onData = (char) => {
      char = char.toString();
      switch (char) {
        case "\n":
        case "\r":
        case "\u0004": // Enter / EOF
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(password.trim());
          break;
        case "\u0003": // Ctrl+C
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.exit(1);
          break;
        case "\u0008":
        case "\x7f": // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
          }
          break;
        default:
          password += char;
          break;
      }
    };

    process.stdin.on("data", onData);
  });
}

function promptVisible(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Resolves PostgreSQL SSL configuration adhering to standard libpq SSL semantics.
 */
function resolvePostgresSslConfig(env = process.env) {
  const rawMode = env.PGSSLMODE?.trim();
  const rawSsl = env.PGSSL?.trim().toLowerCase();

  let mode;
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

  let ca;
  if (env.PGSSLROOTCERT) {
    const certPath = env.PGSSLROOTCERT.trim();
    if (!fs.existsSync(certPath)) {
      throw new Error(`[DATABASE CONFIG ERROR] Configured PGSSLROOTCERT file was not found on disk.`);
    }
    ca = fs.readFileSync(certPath, "utf8");
  }

  if (mode === "require") {
    return { rejectUnauthorized: false, ...(ca ? { ca } : {}) };
  }
  if (mode === "verify-ca") {
    return { rejectUnauthorized: true, checkServerIdentity: () => undefined, ...(ca ? { ca } : {}) };
  }
  if (mode === "verify-full") {
    return { rejectUnauthorized: true, ...(ca ? { ca } : {}) };
  }
  return false;
}

function createDbPool() {
  const sslConfig = resolvePostgresSslConfig(process.env);
  return new pg.Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT ?? 5432),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    connectionTimeoutMillis: 5000,
    ssl: sslConfig,
  });
}

async function main() {
  console.log("==================================================");
  console.log(" FENDI Plastic Industry - Super Admin Provisioning");
  console.log("==================================================");

  // 1. Gather Username
  let username = process.env.BOOTSTRAP_ADMIN_USER?.trim();
  if (!username) {
    username = await promptVisible("Enter Initial Super-Admin Username: ");
  }

  if (!username || username.length < 3) {
    console.error("❌ Error: Username must be at least 3 characters.");
    process.exit(1);
  }

  // 2. Gather Password
  let password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!password) {
    password = await promptPassword("Enter Initial Super-Admin Password (hidden on supported TTYs): ");
  }

  if (!password || password.length < 8) {
    console.error("❌ Error: Password must be at least 8 characters.");
    process.exit(1);
  }

  console.log(`\n⏳ Hashing password securely with bcrypt (cost factor: 12)...`);
  const passwordHash = await bcrypt.hash(password, 12);

  // 3. Connect to PostgreSQL
  const pool = createDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    // Apply schema definition if tables do not exist
    const schemaFile = path.join(projectRoot, "scripts", "auth-schema.sql");
    if (fs.existsSync(schemaFile)) {
      const sql = fs.readFileSync(schemaFile, "utf8");
      await client.query(sql);
      console.log("✓ Verified auth tables and indexes in database.");
    }

    // Check if user already exists
    const existingRes = await client.query(
      `SELECT id, username, role, must_change_password FROM admin_users WHERE username = $1;`,
      [username]
    );

    if (existingRes.rows.length > 0) {
      const existingUser = existingRes.rows[0];
      if (!existingUser.must_change_password) {
        throw new Error(
          `Administrator "${username}" already exists and has completed initial password activation. Re-provisioning aborted for security.`
        );
      }

      // Update initial hash if still pending activation
      await client.query(
        `UPDATE admin_users SET password_hash = $2, updated_at = NOW() WHERE id = $1;`,
        [existingUser.id, passwordHash]
      );
      console.log(`✓ Updated initial credentials for pending administrator "${username}".`);
    } else {
      const userId = "adm_" + crypto.randomBytes(16).toString("hex");
      await client.query(
        `INSERT INTO admin_users (id, username, password_hash, role, must_change_password)
         VALUES ($1, $2, $3, 'super_admin', TRUE);`,
        [userId, username, passwordHash]
      );
      console.log(`✓ Successfully created super-admin user "${username}" (ID: ${userId}).`);
    }

    await client.query("COMMIT;");

    console.log("\n==================================================");
    console.log(" Super Admin Provisioning Complete");
    console.log("==================================================");
    console.log(`Username             : ${username}`);
    console.log(`Role                 : super_admin`);
    console.log(`Must Change Password : TRUE (Mandatory on first login)`);
    console.log("Status               : Account is ready for initial login at /admin/login.");
    console.log("==================================================\n");
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("\n❌ Provisioning failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
