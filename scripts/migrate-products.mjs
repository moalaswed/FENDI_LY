/**
 * FENDI Plastic Industry - Product Catalog PostgreSQL Migration Script (Phase 2)
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-products.mjs [--dry-run]
 *
 * Features:
 *   1. Robust in-memory TypeScript loading using the project's TypeScript compiler.
 *   2. Comprehensive pre-flight validation (duplicate IDs, codes, category references, image assets, feature element types).
 *   3. 3-Way Hash Merge Conflict Detection:
 *      - Computes a deterministic SHA-256 hash of source product fields.
 *      - Accurately distinguishes between untouched records, manual database edits, and clean source updates.
 *      - Preserves manual database edits without overwriting.
 *   4. Code collision detection (prevents assigning an existing code to a different product ID).
 *   5. Explicit behavior for removed products (preserves existing DB rows, no implicit deletions).
 *   6. Preserves `is_active` status set in the database.
 *   7. Transaction-wrapped idempotent execution with full dry-run preview capability.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// CLI Argument Parsing
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run") || args.includes("-n") || args.includes("--preview");
const isHelp = args.includes("--help") || args.includes("-h");

if (isHelp) {
  console.log(`
FENDI Catalog PostgreSQL Migration Script (Phase 2)

Usage:
  node --env-file=.env.local scripts/migrate-products.mjs [options]

Options:
  --dry-run, --preview, -n   Preview migration actions without writing any changes to PostgreSQL.
  --help, -h                 Show this help message.
`);
  process.exit(0);
}

/**
 * Computes a deterministic SHA-256 hash of product attributes (v2 format).
 *
 * Source-managed fields (included in hash):
 *   - code
 *   - name
 *   - category / category_key
 *   - image
 *   - shortDesc / short_desc
 *   - features (sorted array of trimmed strings)
 *   - tag
 *   - sortOrder / sort_order
 *
 * Database-managed fields (EXCLUDED from hash):
 *   - is_active (administrators can toggle visibility without triggering source conflicts)
 *   - created_at, updated_at (managed by PostgreSQL timestamps/triggers)
 *   - id (immutable primary key identifier)
 */
function computeProductHash(data) {
  const normalized = {
    code: (data.code || "").trim(),
    name: (data.name || "").trim(),
    category: (data.category || data.category_key || "").trim(),
    image: (data.image || "").trim(),
    shortDesc: (data.shortDesc || data.short_desc || "").trim(),
    features: (Array.isArray(data.features) ? data.features : []).map((f) => String(f).trim()),
    tag: (data.tag || "").trim(),
    sortOrder: Number(data.sortOrder ?? data.sort_order ?? 0),
  };
  const sha = crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
  return `v2:${sha}`;
}

/**
 * Computes a deterministic SHA-256 hash of category attributes (v2 format).
 *
 * Source-managed fields (included in hash):
 *   - key
 *   - label
 *   - sortOrder / sort_order
 */
function computeCategoryHash(data) {
  const normalized = {
    key: (data.key || "").trim(),
    label: (data.label || "").trim(),
    sortOrder: Number(data.sortOrder ?? data.sort_order ?? 0),
  };
  const sha = crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
  return `v2:${sha}`;
}

/**
 * 1. Robust TypeScript Source Loader
 */
async function loadSourceData() {
  const tsFilePath = path.join(projectRoot, "data", "products.ts");
  if (!fs.existsSync(tsFilePath)) {
    throw new Error(`Source file not found at: ${tsFilePath}`);
  }

  const tsCode = fs.readFileSync(tsFilePath, "utf8");

  try {
    const ts = (await import("typescript")).default;
    const jsCode = ts.transpileModule(tsCode, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;

    const dataUri = "data:text/javascript;base64," + Buffer.from(jsCode).toString("base64");
    const mod = await import(dataUri);
    return {
      products: mod.PRODUCTS,
      categories: mod.CATEGORIES,
    };
  } catch (err) {
    try {
      const mod = await import("../data/products.ts");
      return {
        products: mod.PRODUCTS,
        categories: mod.CATEGORIES,
      };
    } catch {
      throw new Error(`Failed to load data/products.ts: ${err.message}`);
    }
  }
}

/**
 * 2. Pre-Flight Validation
 */
function validateSourceData(products, categories) {
  const errors = [];
  const warnings = [];

  console.log("--------------------------------------------------");
  console.log("▶ Step 1: Pre-Flight Source Data Validation");
  console.log("--------------------------------------------------");

  if (!products || !Array.isArray(products) || products.length === 0) {
    errors.push("No products array found in data/products.ts");
  }

  const physicalCategories = categories.filter((c) => c.key !== "all");
  const validCategoryKeys = new Set(physicalCategories.map((c) => c.key));

  console.log(`✓ Detected ${physicalCategories.length} physical categories:`, Array.from(validCategoryKeys).join(", "));
  console.log(`✓ Detected ${products.length} products to validate.`);

  const idSet = new Set();
  const codeSet = new Set();

  for (const [index, p] of products.entries()) {
    const itemPrefix = `Product #${index + 1} (${p.id || "MISSING ID"}):`;

    // ID validation
    if (!p.id || typeof p.id !== "string" || p.id.trim() === "") {
      errors.push(`${itemPrefix} missing or invalid id`);
    } else if (idSet.has(p.id)) {
      errors.push(`${itemPrefix} duplicate id "${p.id}"`);
    } else {
      idSet.add(p.id);
    }

    // Code validation (required for NOT NULL column in schema)
    if (!p.code || typeof p.code !== "string" || p.code.trim() === "") {
      errors.push(`${itemPrefix} missing required product code`);
    } else if (codeSet.has(p.code)) {
      errors.push(`${itemPrefix} duplicate product code "${p.code}"`);
    } else {
      codeSet.add(p.code);
    }

    // Name validation
    if (!p.name || typeof p.name !== "string" || p.name.trim() === "") {
      errors.push(`${itemPrefix} missing product name`);
    }

    // Category reference validation
    if (!p.category || !validCategoryKeys.has(p.category)) {
      errors.push(
        `${itemPrefix} invalid category reference "${p.category}". Must be one of: ${Array.from(validCategoryKeys).join(", ")}`
      );
    }

    // Features validation (must be non-empty array of strings)
    if (!p.features || !Array.isArray(p.features) || p.features.length === 0) {
      errors.push(`${itemPrefix} features must be a non-empty array of strings`);
    } else {
      for (const [fIdx, feature] of p.features.entries()) {
        if (typeof feature !== "string" || feature.trim() === "") {
          errors.push(`${itemPrefix} feature element at index ${fIdx} is not a valid non-empty string`);
        }
      }
    }

    // Tag validation (optional, but if present must be string)
    if (p.tag !== undefined && p.tag !== null && typeof p.tag !== "string") {
      errors.push(`${itemPrefix} optional tag must be a string if provided`);
    }

    // Image asset verification in public directory
    if (!p.image || typeof p.image !== "string") {
      errors.push(`${itemPrefix} missing image path`);
    } else {
      const cleanImgPath = p.image.replace(/^\//, "");
      const physicalPath = path.join(projectRoot, "public", cleanImgPath);
      if (!fs.existsSync(physicalPath)) {
        errors.push(`${itemPrefix} image file does not exist on disk: "public/${cleanImgPath}"`);
      }
    }
  }

  if (warnings.length > 0) {
    console.log("\nWarnings:");
    warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  }

  if (errors.length > 0) {
    console.error("\n❌ Pre-Flight Validation FAILED with errors:");
    errors.forEach((e) => console.error(`  ✖ ${e}`));
    throw new Error(`Validation failed with ${errors.length} error(s). Aborting migration.`);
  }

  console.log("✓ All source data checks passed: 0 duplicate IDs, 0 duplicate codes, 0 missing assets.");
  return { physicalCategories, products };
}

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
      checkServerIdentity: () => undefined,
      ...(ca ? { ca } : {}),
    };
  }

  if (mode === "verify-full") {
    return {
      rejectUnauthorized: true,
      ...(ca ? { ca } : {}),
    };
  }

  return false;
}

/**
 * 3. Database Connection Pool Setup
 */
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

/**
 * 4. Main Migration Procedure
 */
async function runMigration() {
  console.log("==================================================");
  console.log(` FENDI Plastic Industry - Catalog Migration (Phase 2)`);
  console.log(` Mode: ${isDryRun ? "DRY RUN (Preview Only - No Writes)" : "LIVE EXECUTION (Safe & Idempotent)"}`);
  console.log("==================================================");

  // Load and validate source data
  const { products: rawProducts, categories: rawCategories } = await loadSourceData();
  const { physicalCategories, products } = validateSourceData(rawProducts, rawCategories);

  // Connect to database
  const pool = createDbPool();
  const client = await pool.connect();

  try {
    console.log("\n--------------------------------------------------");
    console.log("▶ Step 2: Database Connection & Schema Verification");
    console.log("--------------------------------------------------");

    const dbInfo = await client.query("SELECT current_database() AS db, current_user AS user;");
    console.log(`✓ Connected to PostgreSQL [DB: ${dbInfo.rows[0].db}, User: ${dbInfo.rows[0].user}]`);

    // Ensure schema exists by applying scripts/schema.sql
    const schemaPath = path.join(projectRoot, "scripts", "schema.sql");
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    // Begin Transaction
    await client.query("BEGIN;");

    // Apply schema definition
    await client.query(schemaSql);
    console.log("✓ Verified database tables (categories, products) and indexes.");

    // Query existing state
    const existingCategoriesRes = await client.query("SELECT key, label, sort_order, source_hash FROM categories;");
    const existingProductsRes = await client.query(
      `SELECT id, code, name, category_key, image, short_desc, features, tag, sort_order, is_active, source_hash, created_at, updated_at
       FROM products;`
    );

    const existingCatMap = new Map(existingCategoriesRes.rows.map((r) => [r.key, r]));
    const existingProdMap = new Map(existingProductsRes.rows.map((r) => [r.id, r]));

    // Build map of existing codes to detect collisions
    const existingCodeMap = new Map(existingProductsRes.rows.map((r) => [r.code, r]));

    console.log(`✓ Current database status: ${existingCatMap.size} categories, ${existingProdMap.size} products.`);

    console.log("\n--------------------------------------------------");
    console.log("▶ Step 3: Migrating Categories with 3-Way Hash Conflict Detection");
    console.log("--------------------------------------------------");

    let catInserted = 0;
    let catUnchanged = 0;
    let catUpdated = 0;
    let catConflicts = 0;

    const categoryOrderMap = {
      electrical: 10,
      industrial: 20,
      agriculture: 30,
      household: 40,
    };

    for (const cat of physicalCategories) {
      const sortOrder = categoryOrderMap[cat.key] ?? 50;
      const existing = existingCatMap.get(cat.key);
      const incomingHash = computeCategoryHash({ key: cat.key, label: cat.label, sort_order: sortOrder });

      if (!existing) {
        if (!isDryRun) {
          await client.query(
            `INSERT INTO categories (key, label, sort_order, source_hash)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order, source_hash = EXCLUDED.source_hash;`,
            [cat.key, cat.label, sortOrder, incomingHash]
          );
        }
        console.log(`  + [INSERT] Category "${cat.key}" (${cat.label})`);
        catInserted++;
      } else {
        const dbHash = computeCategoryHash(existing);
        const storedSourceHash = existing.source_hash;

        // 3-Way Merge Logic for Categories
        if (incomingHash === dbHash) {
          // Case 1: DB content and Source content are identical
          if (storedSourceHash !== incomingHash && !isDryRun) {
            await client.query(`UPDATE categories SET source_hash = $2 WHERE key = $1;`, [cat.key, incomingHash]);
          }
          console.log(`  = [IN SYNC] Category "${cat.key}" (${cat.label})`);
          catUnchanged++;
        } else if (
          storedSourceHash &&
          storedSourceHash.startsWith("v2:") &&
          incomingHash === storedSourceHash &&
          dbHash !== storedSourceHash
        ) {
          // Case 2: Unequivocal manual database edit
          console.warn(
            `  ⚠ [MANUAL DB EDIT PRESERVED] Category "${cat.key}" was modified directly in PostgreSQL (DB: "${existing.label}", Order: ${existing.sort_order}). Preserving database version without overwriting.`
          );
          catConflicts++;
        } else if (
          storedSourceHash &&
          storedSourceHash.startsWith("v2:") &&
          incomingHash !== storedSourceHash &&
          dbHash === storedSourceHash
        ) {
          // Case 3: Clean source update
          if (!isDryRun) {
            await client.query(
              `UPDATE categories SET label = $2, sort_order = $3, source_hash = $4 WHERE key = $1;`,
              [cat.key, cat.label, sortOrder, incomingHash]
            );
          }
          console.log(`  ~ [SOURCE UPDATE APPLIED] Category "${cat.key}" -> Label: "${cat.label}", Order: ${sortOrder}`);
          catUpdated++;
        } else {
          // Case 4: Ambiguous conflict (both changed independently or missing v2 baseline)
          console.warn(
            `  ⚠ [CONFLICT DETECTED - SKIPPED] Category "${cat.key}" differs between source and DB and lacks a verifiable baseline hash. Skipping to protect database integrity.`
          );
          catConflicts++;
        }
      }
    }

    console.log("\n--------------------------------------------------");
    console.log("▶ Step 4: Migrating Products with 3-Way Hash Conflict Detection");
    console.log("--------------------------------------------------");

    let prodInserted = 0;
    let prodUnchanged = 0;
    let prodUpdated = 0;
    let prodConflicts = 0;
    let prodCodeCollisions = 0;

    const sourceIdSet = new Set(products.map((p) => p.id));

    for (const [index, p] of products.entries()) {
      const sortOrder = (index + 1) * 10;
      const existing = existingProdMap.get(p.id);
      const incomingHash = computeProductHash({ ...p, sortOrder });

      if (!existing) {
        // Check if incoming code collides with another product already in DB
        const codeCollidingProduct = existingCodeMap.get(p.code);
        if (codeCollidingProduct && codeCollidingProduct.id !== p.id) {
          console.error(
            `  ✖ [CODE COLLISION] Cannot insert product "${p.id}" because code "${p.code}" is already used by existing product "${codeCollidingProduct.id}". Skipping.`
          );
          prodCodeCollisions++;
          continue;
        }

        // Product does not exist -> Insert it
        if (!isDryRun) {
          await client.query(
            `INSERT INTO products (
               id, code, name, category_key, image, short_desc, features, tag, sort_order, is_active, source_hash
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
            [
              p.id,
              p.code,
              p.name,
              p.category,
              p.image,
              p.shortDesc,
              p.features,
              p.tag || null,
              sortOrder,
              true,
              incomingHash,
            ]
          );
        }
        console.log(`  + [INSERT] ${p.code.padEnd(10)} | ${p.id.padEnd(25)} | ${p.name}`);
        prodInserted++;
      } else {
        // Product exists in database
        // Check code collision with a different product
        const codeCollidingProduct = existingCodeMap.get(p.code);
        if (codeCollidingProduct && codeCollidingProduct.id !== p.id) {
          console.error(
            `  ✖ [CODE COLLISION] Cannot update product "${p.id}" to code "${p.code}" because it is already used by "${codeCollidingProduct.id}". Skipping.`
          );
          prodCodeCollisions++;
          continue;
        }

        const dbHash = computeProductHash(existing);
        const storedSourceHash = existing.source_hash;

        // 3-Way Merge Logic with versioned v2: hashes and ambiguous conflict protection
        if (incomingHash === dbHash) {
          // Case 1: DB content and Source content are identical
          if (storedSourceHash !== incomingHash && !isDryRun) {
            // Update source_hash tracking if missing or out of date
            await client.query(`UPDATE products SET source_hash = $2 WHERE id = $1;`, [p.id, incomingHash]);
          }
          prodUnchanged++;
        } else if (
          storedSourceHash &&
          storedSourceHash.startsWith("v2:") &&
          incomingHash === storedSourceHash &&
          dbHash !== storedSourceHash
        ) {
          // Case 2: Source has NOT changed since baseline migration, but DB content was modified
          // This is an unequivocal manual database edit! Preserve it!
          console.warn(
            `  ⚠ [MANUAL DB EDIT PRESERVED] Product "${p.id}" (${existing.code}) was modified directly in PostgreSQL. Preserving database version without overwriting.`
          );
          prodConflicts++;
        } else if (
          storedSourceHash &&
          storedSourceHash.startsWith("v2:") &&
          incomingHash !== storedSourceHash &&
          dbHash === storedSourceHash
        ) {
          // Case 3: Source changed, and DB was NOT edited since baseline migration
          // Clean source update -> Safe to apply!
          if (!isDryRun) {
            await client.query(
              `UPDATE products
               SET code = $2,
                   name = $3,
                   category_key = $4,
                   image = $5,
                   short_desc = $6,
                   features = $7,
                   tag = $8,
                   sort_order = $9,
                   source_hash = $10
               WHERE id = $1;`,
              [
                p.id,
                p.code,
                p.name,
                p.category,
                p.image,
                p.shortDesc,
                p.features,
                p.tag || null,
                sortOrder,
                incomingHash,
              ]
            );
          }
          console.log(`  ~ [SOURCE UPDATE APPLIED] ${p.code.padEnd(10)} | ${p.id.padEnd(25)} | Updated from source.`);
          prodUpdated++;
        } else {
          // Case 4: Ambiguous conflict (both changed independently or missing v2 baseline)
          console.warn(
            `  ⚠ [CONFLICT DETECTED - SKIPPED] Product "${p.id}" (${existing.code}) differs between source and DB and lacks a verifiable baseline hash. Skipping to protect database integrity.`
          );
          prodConflicts++;
        }
      }
    }

    if (prodUnchanged > 0) {
      console.log(`  = [IN SYNC] ${prodUnchanged} products are already identical and up-to-date.`);
    }

    // Check for products in DB that were removed from the source file
    let orphanCount = 0;
    for (const [existingId, existingRow] of existingProdMap.entries()) {
      if (!sourceIdSet.has(existingId)) {
        orphanCount++;
        console.warn(
          `  ℹ [REMOVED FROM SOURCE] Product "${existingId}" (${existingRow.code}) exists in PostgreSQL but is absent from data/products.ts. Preserved in database (is_active: ${existingRow.is_active}). No implicit deletion.`
        );
      }
    }

    // If dry run, rollback transaction
    if (isDryRun) {
      await client.query("ROLLBACK;");
      console.log("\n--------------------------------------------------");
      console.log("ℹ DRY RUN COMPLETE: Transaction rolled back.");
      console.log("  No modifications were written to PostgreSQL.");
      console.log("--------------------------------------------------");
    } else {
      await client.query("COMMIT;");
      console.log("\n--------------------------------------------------");
      console.log("✓ MIGRATION COMMITTED SUCCESSFULLY.");
      console.log("--------------------------------------------------");
    }

    // Summary Report
    console.log("\n==================================================");
    console.log(" Migration Summary");
    console.log("==================================================");
    console.log(`Categories:`);
    console.log(`  - New Inserted : ${catInserted}`);
    console.log(`  - Updated      : ${catUpdated}`);
    console.log(`  - Up to Date   : ${catUnchanged}`);
    console.log(`  - Conflicts    : ${catConflicts}`);
    console.log(`Products:`);
    console.log(`  - New Inserted : ${prodInserted}`);
    console.log(`  - Updated      : ${prodUpdated}`);
    console.log(`  - Up to Date   : ${prodUnchanged}`);
    console.log(`  - Conflicts    : ${prodConflicts}`);
    console.log(`  - Collisions   : ${prodCodeCollisions}`);
    console.log(`  - Absent in Src: ${orphanCount}`);
    console.log(`  - Total Source : ${products.length}`);
    console.log("==================================================\n");

    return {
      isDryRun,
      catInserted,
      catUpdated,
      catUnchanged,
      catConflicts,
      prodInserted,
      prodUpdated,
      prodUnchanged,
      prodConflicts,
      prodCodeCollisions,
      orphanCount,
      totalSource: products.length,
    };
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("\n❌ Migration transaction rolled back due to error:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch((err) => {
  console.error("Migration script failed:", err);
  process.exit(1);
});
