/** Convert the private PostgreSQL JSON export to SQL importable by phpMyAdmin. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = path.resolve(process.argv[2] ?? path.join(root, "migration-export.json"));
const outputPath = path.resolve(process.argv[3] ?? path.join(root, "migration-mariadb.sql"));

if (!fs.existsSync(inputPath)) {
  throw new Error(`Migration export not found: ${inputPath}`);
}

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
if (
  data.version !== 1 ||
  !Array.isArray(data.categories) ||
  !Array.isArray(data.products) ||
  !Array.isArray(data.adminUsers)
) {
  throw new Error("Migration export format is invalid.");
}

const statements = [
  "-- Private migration file. Contains admin password hashes; keep it secret and delete it after import.",
  "SET NAMES utf8mb4;",
  "START TRANSACTION;",
];

appendInsert(statements, "categories", ["key", "label", "sort_order", "source_hash"], data.categories, (row) => [
  row.key,
  row.label,
  row.sort_order,
  row.source_hash ?? null,
]);

appendInsert(
  statements,
  "products",
  [
    "id", "code", "name", "category_key", "image", "video", "short_desc", "features", "tag",
    "sort_order", "is_active", "source_hash", "created_at", "updated_at",
  ],
  data.products,
  (row) => [
    row.id,
    row.code,
    row.name,
    row.category_key,
    row.image,
    row.video ?? null,
    row.short_desc,
    JSON.stringify(Array.isArray(row.features) ? row.features : []),
    row.tag ?? null,
    row.sort_order,
    row.is_active ? 1 : 0,
    row.source_hash ?? null,
    sqlDate(row.created_at),
    sqlDate(row.updated_at),
  ],
);

appendInsert(
  statements,
  "admin_users",
  ["id", "username", "password_hash", "role", "must_change_password", "created_at", "updated_at", "last_login_at"],
  data.adminUsers,
  (row) => [
    row.id,
    row.username,
    row.password_hash,
    row.role,
    row.must_change_password ? 1 : 0,
    sqlDate(row.created_at),
    sqlDate(row.updated_at),
    sqlDate(row.last_login_at),
  ],
);

statements.push("COMMIT;", "");
fs.writeFileSync(outputPath, statements.join("\n\n"), { encoding: "utf8", mode: 0o600 });
console.log(`Created private MariaDB import SQL: ${outputPath}`);
console.log(
  `Included ${data.categories.length} categories, ${data.products.length} products, and ${data.adminUsers.length} admin accounts.`,
);
console.log("The SQL contains admin password hashes. Import it only into the intended database, then delete it securely.");

function appendInsert(output, table, columns, rows, getValues) {
  if (!rows.length) return;
  const columnList = columns.map((column) => `\`${column}\``).join(", ");
  const tuples = rows.map((row) => `(${getValues(row).map(sqlValue).join(", ")})`);
  output.push(`INSERT INTO \`${table}\` (${columnList}) VALUES\n${tuples.join(",\n")};`);
}

function sqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Migration export contains a non-finite number.");
    return String(value);
  }
  if (typeof value === "boolean") return value ? "1" : "0";
  const stringValue = String(value);
  if (stringValue.length === 0) return "''";
  const hex = Buffer.from(stringValue, "utf8").toString("hex");
  return `CONVERT(0x${hex} USING utf8mb4)`;
}

function sqlDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Migration export contains an invalid date.");
  return date.toISOString().replace("T", " ").replace("Z", "").slice(0, 23);
}
