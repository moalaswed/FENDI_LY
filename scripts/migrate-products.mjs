/** Seed catalog products and categories from data/products.ts into MariaDB.
 * Schema creation is handled separately by `npm run db:init`.
 * Defaults to preview; pass --apply to insert missing records.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mariadb from "mariadb";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apply = process.argv.includes("--apply");
const ts = (await import("typescript")).default;
const source = fs.readFileSync(path.join(root, "data/products.ts"), "utf8");
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { PRODUCTS, CATEGORIES } = await import(
  "data:text/javascript;base64," + Buffer.from(js).toString("base64")
);

const required = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) throw new Error(`Missing MariaDB settings: ${missing.join(", ")}`);
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionLimit: 2,
  connectTimeout: 10000,
  charset: "utf8mb4",
});

try {
  const cats = CATEGORIES.filter((category) => category.key !== "all");
  console.log(`Mode: ${apply ? "APPLY" : "PREVIEW"}`);
  console.log(`Will add ${cats.length} categories and ${PRODUCTS.length} products if missing.`);
  if (!apply) {
    console.log("No database changes made. Rerun with --apply after reviewing.");
    process.exitCode = 0;
  } else {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const [index, category] of cats.entries()) {
        await conn.query(
          "INSERT IGNORE INTO categories (`key`, label, sort_order) VALUES (?, ?, ?)",
          [category.key, category.label, (index + 1) * 10]
        );
      }
      for (const [index, product] of PRODUCTS.entries()) {
        await conn.query(
          `INSERT IGNORE INTO products
           (id, code, name, category_key, image, video, short_desc, features, tag, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [product.id, product.code, product.name, product.category, product.image, product.video ?? null,
            product.shortDesc, JSON.stringify(product.features), product.tag ?? null, (index + 1) * 10]
        );
      }
      await conn.commit();
      console.log("Catalog seed completed. Existing rows were preserved.");
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
} finally {
  await pool.end();
}
