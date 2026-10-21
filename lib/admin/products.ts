import "server-only";

if (typeof window !== "undefined") {
  throw new Error("lib/admin/products.ts is a server-only module.");
}

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { query } from "@/lib/db";
import { checkHasVideoColumn, parseFeatures } from "@/lib/products";
import type { ProductItem, CategoryOption } from "@/types/products";

export interface AdminProductFilterParams {
  search?: string;
  category?: string;
  status?: "all" | "active" | "inactive";
  sortBy?: "sort_order" | "name" | "code" | "updated_at";
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface AdminProductListResult {
  products: ProductItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductInputData {
  id: string;
  code: string;
  name: string;
  categoryKey: string;
  image: string;
  video?: string | null;
  shortDesc: string;
  features: string[];
  tag?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface MutationResult {
  success: boolean;
  error?: string;
  productId?: string;
}

/**
 * Computes deterministic SHA-256 hash for product state consistency (v2 format).
 */
export function computeAdminProductHash(data: {
  code: string;
  name: string;
  categoryKey: string;
  image: string;
  video?: string | null;
  shortDesc: string;
  features: string[];
  tag?: string | null;
  sortOrder: number;
}): string {
  const normalized = {
    code: data.code.trim(),
    name: data.name.trim(),
    category: data.categoryKey.trim(),
    image: data.image.trim(),
    video: (data.video || "").trim(),
    shortDesc: data.shortDesc.trim(),
    features: (Array.isArray(data.features) ? data.features : []).map((f) => String(f).trim()),
    tag: (data.tag || "").trim(),
    sortOrder: Number(data.sortOrder ?? 0),
  };
  const sha = crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
  return `v2:${sha}`;
}

/**
 * Server-side validation of a video URL or upload path.
 */
export function validateVideoSource(videoUrl: string): { valid: boolean; error?: string } {
  const trimmed = videoUrl.trim();
  if (!trimmed) {
    return { valid: true };
  }

  // Reject forbidden protocols, executables, scripts, or path traversal
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.includes("<script") ||
    lower.includes("<iframe") ||
    lower.includes("..")
  ) {
    return { valid: false, error: "رابط الفيديو غير صالح أو يحتوي على رموز غير مسموح بها." };
  }

  // Local safe upload paths
  if (trimmed.startsWith("/uploads/videos/")) {
    const validExts = [".mp4", ".webm", ".ogg"];
    if (validExts.some((ext) => lower.endsWith(ext))) {
      return { valid: true };
    }
    return { valid: false, error: "مسار الفيديو المحلي يجب أن يكون بصيغة MP4 أو WebM أو OGG." };
  }

  // Remote HTTPS URLs
  if (trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      const hostname = parsed.hostname.toLowerCase();

      // Check if trusted platform or direct video file
      const isYouTube = hostname.includes("youtube.com") || hostname.includes("youtu.be");
      const isVimeo = hostname.includes("vimeo.com");
      const isDirectVideo = [".mp4", ".webm", ".ogg"].some((ext) =>
        parsed.pathname.toLowerCase().endsWith(ext)
      );

      if (isYouTube || isVimeo || isDirectVideo) {
        return { valid: true };
      }

      // Any valid HTTPS URL with a domain name
      if (parsed.protocol === "https:" && parsed.hostname.includes(".")) {
        return { valid: true };
      }
    } catch {
      return { valid: false, error: "رابط الفيديو الخارجي غير صحيح (يجب أن يبدأ بـ https://)." };
    }
  }

  return {
    valid: false,
    error: "رابط الفيديو يجب أن يكون رابطاً آمناً (https://) من منصة فيديو معتمدة (مثل YouTube أو Vimeo) أو مسار فيديو محلي معتمد.",
  };
}

/**
 * Server-side validation of an image path or URL.
 */
export function validateImageSource(imageUrl: string): { valid: boolean; error?: string } {
  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return { valid: false, error: "صورة المنتج مطلوبة." };
  }

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.includes("..") ||
    lower.includes("<script")
  ) {
    return { valid: false, error: "مسار الصورة يحتوي على رموز غير آمنة." };
  }

  // Relative public image path (e.g. /photo_38_... or /uploads/images/...)
  if (trimmed.startsWith("/")) {
    return { valid: true };
  }

  // Secure HTTPS URL
  if (trimmed.startsWith("https://")) {
    try {
      new URL(trimmed);
      return { valid: true };
    } catch {
      return { valid: false, error: "رابط الصورة الخارجي غير صالح." };
    }
  }

  return { valid: false, error: "مسار الصورة يجب أن يبدأ بـ / أو https://" };
}

/**
 * Validates complete product input data on the server.
 */
export async function validateProductInput(
  data: ProductInputData,
  isUpdate: boolean = false
): Promise<{ valid: boolean; error?: string }> {
  // 1. ID validation
  const cleanId = data.id.trim();
  if (!cleanId || cleanId.length < 2 || cleanId.length > 100) {
    return { valid: false, error: "معرف المنتج (ID) يجب أن يكون بين 2 و 100 حرف." };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(cleanId)) {
    return {
      valid: false,
      error: "معرف المنتج (ID) يجب أن يتكون من أحرف إنجليزية وأرقام وشُرط (-) فقط بدون مسافات.",
    };
  }

  // 2. Code validation
  const cleanCode = data.code.trim();
  if (!cleanCode || cleanCode.length < 1 || cleanCode.length > 50) {
    return { valid: false, error: "رمز المنتج (الكود) مطلوب ويجب ألا يتجاوز 50 خانة." };
  }

  // 3. Name validation
  const cleanName = data.name.trim();
  if (!cleanName || cleanName.length < 2 || cleanName.length > 255) {
    return { valid: false, error: "اسم المنتج مطلوب ويجب أن يكون بين 2 و 255 حرفاً." };
  }

  // 4. Category Key existence
  const cleanCategory = data.categoryKey.trim();
  if (!cleanCategory) {
    return { valid: false, error: "يجب اختيار تصنيف المنتج." };
  }
  const catCheck = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM categories WHERE \`key\` = $1;`,
    [cleanCategory]
  );
  if (Number(catCheck.rows[0]?.count ?? 0) === 0) {
    return { valid: false, error: "التصنيف المحدد غير موجود في قاعدة البيانات." };
  }

  // 5. Image validation
  const imageCheck = validateImageSource(data.image);
  if (!imageCheck.valid) {
    return imageCheck;
  }

  // 6. Optional Video validation
  if (data.video && data.video.trim().length > 0) {
    const videoCheck = validateVideoSource(data.video);
    if (!videoCheck.valid) {
      return videoCheck;
    }
  }

  // 7. Short description
  const cleanDesc = data.shortDesc.trim();
  if (!cleanDesc || cleanDesc.length < 2 || cleanDesc.length > 2000) {
    return { valid: false, error: "الوصف المختصر مطلوب (بين 2 و 2000 حرف)." };
  }

  // 8. Features validation
  if (!Array.isArray(data.features) || data.features.length === 0) {
    return { valid: false, error: "يجب إضافة ميزة أو مواصفة فنية واحدة على الأقل للمنتج." };
  }
  for (const f of data.features) {
    if (typeof f !== "string" || f.trim().length === 0 || f.trim().length > 255) {
      return { valid: false, error: "كل ميزة للمنتج يجب أن تكون نصاً بين 1 و 255 حرفاً." };
    }
  }

  // 9. Tag length
  if (data.tag && data.tag.trim().length > 100) {
    return { valid: false, error: "الوسم (Tag) يجب ألا يتجاوز 100 حرف." };
  }

  // 10. Sort order
  if (typeof data.sortOrder !== "number" || isNaN(data.sortOrder) || data.sortOrder < 0) {
    return { valid: false, error: "ترتيب الظهور يجب أن يكون رقماً صحيحاً (0 أو أكبر)." };
  }

  // 11. Uniqueness check for ID and Code
  if (!isUpdate) {
    const existingId = await query<{ id: string }>(`SELECT id FROM products WHERE id = $1;`, [
      cleanId,
    ]);
    if (existingId.rows.length > 0) {
      return { valid: false, error: `المعرف "${cleanId}" مستخدم مسبقاً لمنتج آخر. يرجى اختيار معرف فريد.` };
    }
  }

  const existingCode = await query<{ id: string }>(
    `SELECT id FROM products WHERE code = $1 AND id != $2;`,
    [cleanCode, cleanId]
  );
  if (existingCode.rows.length > 0) {
    return {
      valid: false,
      error: `رمز المنتج (الكود) "${cleanCode}" مسجل مسبقاً للمنتج "${existingCode.rows[0].id}". الأكواد يجب أن تكون فريدة.`,
    };
  }

  return { valid: true };
}

/**
 * Fetches filtered, paginated products for the admin panel.
 */
export async function getAdminProducts(
  params: AdminProductFilterParams = {}
): Promise<AdminProductListResult> {
  const {
    search = "",
    category = "all",
    status = "all",
    sortBy = "sort_order",
    sortDir = "asc",
    page = 1,
    limit = 15,
  } = params;

  const conditions: string[] = [];
  const queryParams: unknown[] = [];
  let paramIndex = 1;

  // Search filter (name, code, or short_desc)
  if (search.trim()) {
    conditions.push(
      `(p.name LIKE $${paramIndex} OR p.code LIKE $${paramIndex} OR p.short_desc LIKE $${paramIndex})`
    );
    queryParams.push(`%${search.trim()}%`);
    paramIndex++;
  }

  // Category filter
  if (category && category !== "all") {
    conditions.push(`p.category_key = $${paramIndex}`);
    queryParams.push(category.trim());
    paramIndex++;
  }

  // Status filter
  if (status === "active") {
    conditions.push(`p.is_active = true`);
  } else if (status === "inactive") {
    conditions.push(`p.is_active = false`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Count total matching
  const countRes = await query<{ count: string }>(
    `SELECT COUNT(*) AS count
     FROM products p
     ${whereClause};`,
    queryParams
  );
  const totalCount = Number(countRes.rows[0]?.count ?? 0);

  // Sorting
  const allowedSortCols: Record<string, string> = {
    sort_order: "p.sort_order",
    name: "p.name",
    code: "p.code",
    updated_at: "p.updated_at",
  };
  const orderCol = allowedSortCols[sortBy] || "p.sort_order";
  const orderDirection = sortDir.toLowerCase() === "desc" ? "DESC" : "ASC";

  // Pagination
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const offset = (safePage - 1) * safeLimit;

  // Video column check
  const hasVideo = await checkHasVideoColumn();
  const videoSelect = hasVideo ? "p.video," : "CAST(NULL AS CHAR) AS video,";

  const dataParams = [...queryParams, safeLimit, offset];
  const limitParamIndex = paramIndex;
  const offsetParamIndex = paramIndex + 1;

  const dataRes = await query<{
    id: string;
    code: string;
    name: string;
    category_key: string;
    category_label: string;
    image: string;
    video: string | null;
    short_desc: string;
    features: string[];
    tag: string | null;
    sort_order: number;
    is_active: boolean;
    updated_at: string;
  }>(
    `SELECT 
       p.id,
       p.code,
       p.name,
       p.category_key,
       c.label AS category_label,
       p.image,
       ${videoSelect}
       p.short_desc,
       p.features,
       p.tag,
       p.sort_order,
       p.is_active,
       p.updated_at AS updated_at
     FROM products p
     JOIN categories c ON p.category_key = c.\`key\`
     ${whereClause}
     ORDER BY ${orderCol} ${orderDirection}, p.id ASC
     LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex};`,
    dataParams
  );

  const products: ProductItem[] = dataRes.rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category_key,
    categoryLabel: row.category_label || row.category_key,
    image: row.image,
    video: row.video ?? undefined,
    shortDesc: row.short_desc,
    features: parseFeatures(row.features),
    tag: row.tag ?? undefined,
    sortOrder: row.sort_order ?? 0,
    isActive: Boolean(Number(row.is_active ?? 1)),
    updatedAt: row.updated_at || undefined,
  }));

  const totalPages = Math.ceil(totalCount / safeLimit);

  return {
    products,
    totalCount,
    page: safePage,
    limit: safeLimit,
    totalPages,
  };
}

/**
 * Fetches a single product by ID for admin viewing or editing.
 */
export async function getAdminProductById(id: string): Promise<ProductItem | null> {
  const hasVideo = await checkHasVideoColumn();
  const videoSelect = hasVideo ? "p.video," : "CAST(NULL AS CHAR) AS video,";

  const res = await query<{
    id: string;
    code: string;
    name: string;
    category_key: string;
    category_label: string;
    image: string;
    video: string | null;
    short_desc: string;
    features: string[];
    tag: string | null;
    sort_order: number;
    is_active: boolean;
    updated_at: string;
  }>(
    `SELECT 
       p.id,
       p.code,
       p.name,
       p.category_key,
       c.label AS category_label,
       p.image,
       ${videoSelect}
       p.short_desc,
       p.features,
       p.tag,
       p.sort_order,
       p.is_active,
       p.updated_at AS updated_at
     FROM products p
     JOIN categories c ON p.category_key = c.\`key\`
     WHERE p.id = $1;`,
    [id]
  );

  if (res.rows.length === 0) {
    return null;
  }

  const row = res.rows[0];
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category_key,
    categoryLabel: row.category_label || row.category_key,
    image: row.image,
    video: row.video ?? undefined,
    shortDesc: row.short_desc,
    features: parseFeatures(row.features),
    tag: row.tag ?? undefined,
    sortOrder: row.sort_order ?? 0,
    isActive: Boolean(Number(row.is_active ?? 1)),
    updatedAt: row.updated_at || undefined,
  };
}

/**
 * Fetches all categories for selection and counts.
 */
export async function getAdminCategories(): Promise<CategoryOption[]> {
  const res = await query<{
    key: string;
    label: string;
    product_count: string;
  }>(
    `SELECT 
       c.\`key\`,
       c.label,
       COUNT(p.id) AS product_count
     FROM categories c
     LEFT JOIN products p ON c.\`key\` = p.category_key
     GROUP BY c.\`key\`, c.label, c.sort_order
     ORDER BY c.sort_order ASC, c.\`key\` ASC;`
  );

  return res.rows.map((row) => ({
    key: row.key,
    label: row.label,
    count: Number(row.product_count ?? 0),
  }));
}

/**
 * Creates a new product in MariaDB.
 */
export async function createAdminProduct(data: ProductInputData): Promise<MutationResult> {
  const validation = await validateProductInput(data, false);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const hasVideo = await checkHasVideoColumn();
  const sourceHash = computeAdminProductHash(data);

  try {
    if (hasVideo) {
      await query(
        `INSERT INTO products (
           id, code, name, category_key, image, video, short_desc, features, tag, sort_order, is_active, source_hash, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
         );`,
        [
          data.id.trim(),
          data.code.trim(),
          data.name.trim(),
          data.categoryKey.trim(),
          data.image.trim(),
          data.video ? data.video.trim() : null,
          data.shortDesc.trim(),
          JSON.stringify(data.features.map((f) => f.trim())),
          data.tag && data.tag.trim() ? data.tag.trim() : null,
          data.sortOrder,
          data.isActive,
          sourceHash,
        ]
      );
    } else {
      await query(
        `INSERT INTO products (
           id, code, name, category_key, image, short_desc, features, tag, sort_order, is_active, source_hash, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
         );`,
        [
          data.id.trim(),
          data.code.trim(),
          data.name.trim(),
          data.categoryKey.trim(),
          data.image.trim(),
          data.shortDesc.trim(),
          JSON.stringify(data.features.map((f) => f.trim())),
          data.tag && data.tag.trim() ? data.tag.trim() : null,
          data.sortOrder,
          data.isActive,
          sourceHash,
        ]
      );
    }

    return { success: true, productId: data.id.trim() };
  } catch (err: unknown) {
    const dbErr = err as { code?: string; message?: string };
    if (dbErr.code === "ER_DUP_ENTRY" || dbErr.code === "1062") {
      return {
        success: false,
        error: "رمز المنتج (الكود) أو المعرف مسجل مسبقاً. يجب أن تكون الأكواد والمعرفات فريدة.",
      };
    }
    console.error("[PRODUCT CREATE ERROR]", dbErr.message);
    return {
      success: false,
      error: "حدث خطأ غير متوقع أثناء حفظ المنتج في قاعدة البيانات.",
    };
  }
}

/**
 * Updates an existing product in MariaDB.
 * Supports optimistic concurrency control via expectedUpdatedAt timestamp.
 */
export async function updateAdminProduct(
  id: string,
  data: ProductInputData,
  expectedUpdatedAt?: string
): Promise<MutationResult> {
  const cleanId = id.trim();
  data.id = cleanId;

  const validation = await validateProductInput(data, true);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // MariaDB stores millisecond precision; the timestamp comparison remains in the UPDATE.
  // The comparison is part of the UPDATE itself to prevent a check-then-write race.
  if (expectedUpdatedAt && Number.isNaN(Date.parse(expectedUpdatedAt))) {
    return { success: false, error: "تعذر التحقق من نسخة المنتج. يرجى إعادة تحميل الصفحة." };
  }

  const hasVideo = await checkHasVideoColumn();
  const sourceHash = computeAdminProductHash(data);
  const expectedUpdatedAtParam = expectedUpdatedAt ? expectedUpdatedAt.trim() : null;

  try {
    if (hasVideo) {
      const res = await query(
        `UPDATE products
         SET code = $2,
             name = $3,
             category_key = $4,
             image = $5,
             video = $6,
             short_desc = $7,
             features = $8,
             tag = $9,
             sort_order = $10,
             is_active = $11,
             source_hash = $12,
             updated_at = NOW()
         WHERE id = $1${expectedUpdatedAtParam ? " AND updated_at = STR_TO_DATE(REPLACE(REPLACE($13, 'T', ' '), 'Z', ''), '%Y-%m-%d %H:%i:%s.%f')" : ""};`,
        [
          cleanId,
          data.code.trim(),
          data.name.trim(),
          data.categoryKey.trim(),
          data.image.trim(),
          data.video && data.video.trim() ? data.video.trim() : null,
          data.shortDesc.trim(),
          JSON.stringify(data.features.map((f) => f.trim())),
          data.tag && data.tag.trim() ? data.tag.trim() : null,
          data.sortOrder,
          data.isActive,
          sourceHash,
          ...(expectedUpdatedAtParam ? [expectedUpdatedAtParam] : []),
        ]
      );
      if (res.rowCount === 0) {
        if (expectedUpdatedAtParam) {
          return {
            success: false,
            error: "تعارض التزامن: عُدّل المنتج أو حُذف منذ فتح النموذج. أعد تحميل الصفحة قبل الحفظ.",
          };
        }
        return { success: false, error: "لم يتم العثور على المنتج المطلوب لتعديله." };
      }
    } else {
      const res = await query(
        `UPDATE products
         SET code = $2,
             name = $3,
             category_key = $4,
             image = $5,
             short_desc = $6,
             features = $7,
             tag = $8,
             sort_order = $9,
             is_active = $10,
             source_hash = $11,
             updated_at = NOW()
         WHERE id = $1${expectedUpdatedAtParam ? " AND updated_at = STR_TO_DATE(REPLACE(REPLACE($12, 'T', ' '), 'Z', ''), '%Y-%m-%d %H:%i:%s.%f')" : ""};`,
        [
          cleanId,
          data.code.trim(),
          data.name.trim(),
          data.categoryKey.trim(),
          data.image.trim(),
          data.shortDesc.trim(),
          JSON.stringify(data.features.map((f) => f.trim())),
          data.tag && data.tag.trim() ? data.tag.trim() : null,
          data.sortOrder,
          data.isActive,
          sourceHash,
          ...(expectedUpdatedAtParam ? [expectedUpdatedAtParam] : []),
        ]
      );
      if (res.rowCount === 0) {
        if (expectedUpdatedAtParam) {
          return {
            success: false,
            error: "تعارض التزامن: عُدّل المنتج أو حُذف منذ فتح النموذج. أعد تحميل الصفحة قبل الحفظ.",
          };
        }
        return { success: false, error: "لم يتم العثور على المنتج المطلوب لتعديله." };
      }
    }

    return { success: true, productId: cleanId };
  } catch (err: unknown) {
    const dbErr = err as { code?: string; message?: string };
    if (dbErr.code === "ER_DUP_ENTRY" || dbErr.code === "1062") {
      return {
        success: false,
        error: "رمز المنتج (الكود) مسجل مسبقاً لمنتج آخر. يرجى اختيار رمز فريد.",
      };
    }
    console.error("[PRODUCT UPDATE ERROR]", dbErr.message);
    return {
      success: false,
      error: "حدث خطأ أثناء تحديث بيانات المنتج في قاعدة البيانات.",
    };
  }
}

/**
 * Toggles a product's active visibility state.
 */
export async function toggleProductActiveState(
  id: string,
  isActive: boolean
): Promise<MutationResult> {
  const cleanId = id.trim();
  try {
    const res = await query(
      `UPDATE products
       SET is_active = $2,
           updated_at = NOW()
       WHERE id = $1;`,
      [cleanId, isActive]
    );

    if (res.rowCount === 0) {
      return { success: false, error: "لم يتم العثور على المنتج المطلوب." };
    }

    return { success: true, productId: cleanId };
  } catch (err) {
    console.error("[TOGGLE ACTIVE ERROR]", (err as Error).message);
    return { success: false, error: "تعذر تغيير حالة تفعيل المنتج في قاعدة البيانات." };
  }
}

/**
 * Permanently deletes a product record.
 * Used when deletion is explicitly justified. Deactivation is default otherwise.
 */
export async function deleteAdminProduct(id: string): Promise<MutationResult> {
  const cleanId = id.trim();
  try {
    const res = await query(`DELETE FROM products WHERE id = $1;`, [cleanId]);
    if (res.rowCount === 0) {
      return { success: false, error: "المنتج غير موجود أو تم حذفه مسبقاً." };
    }
    return { success: true, productId: cleanId };
  } catch (err) {
    console.error("[DELETE PRODUCT ERROR]", (err as Error).message);
    return {
      success: false,
      error: "تعذر حذف المنتج نظراً لوجود قيود ارتباطية أو خلل في قاعدة البيانات. نوصي بإلغاء التفعيل بدلاً من ذلك.",
    };
  }
}

/**
 * Retrieves list of existing public catalog images from the public directory.
 * Gives administrators a convenient gallery picker so they don't have to manually type paths.
 */
export async function getExistingPublicImages(): Promise<string[]> {
  try {
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      return [];
    }

    const files = fs.readdirSync(publicDir);
    const imageFiles = files
      .filter((file) => /^photo_.*?\.(jpg|jpeg|png|webp)$/i.test(file))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/[^0-9]/g, "") || "0", 10);
        const numB = parseInt(b.replace(/[^0-9]/g, "") || "0", 10);
        return numA - numB;
      })
      .map((file) => `/${file}`);

    return imageFiles;
  } catch (err) {
    console.warn("[PUBLIC IMAGES SCAN WARNING]", (err as Error).message);
    return [];
  }
}

/**
 * Safe local media upload handler (for cPanel persistent disk or local development).
 * Strict size limits, extension validation, safe random filenames, and path traversal protection.
 */
export async function handleSafeMediaUpload(
  file: File,
  type: "image" | "video"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (type === "image") {
      const maxBytes = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxBytes) {
        return { success: false, error: "حجم الصورة يتجاوز الحد المسموح به (5 ميجابايت كحد أقصى)." };
      }

      const allowedMimes: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
      };

      const ext = allowedMimes[file.type.toLowerCase()];
      if (!ext) {
        return {
          success: false,
          error: "صيغة الصورة غير مدعومة. الصيغ المعتمدة: JPG, PNG, WEBP.",
        };
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      if (buffer.length > maxBytes) {
        return { success: false, error: "حجم الصورة يتجاوز الحد المسموح به (5 ميجابايت كحد أقصى)." };
      }

      const safeDir = path.join(process.cwd(), "public", "uploads", "images");
      if (!fs.existsSync(safeDir)) {
        fs.mkdirSync(safeDir, { recursive: true });
      }

      const randomName = `img_${crypto.randomBytes(16).toString("hex")}${ext}`;
      const destination = path.join(safeDir, randomName);

      // Path traversal assertion
      const resolved = path.resolve(destination);
      if (!resolved.startsWith(path.resolve(safeDir))) {
        return { success: false, error: "محاولة غير مصرح بها للوصول إلى مسار نظام الملفات." };
      }

      fs.writeFileSync(destination, buffer);
      return { success: true, url: `/uploads/images/${randomName}` };
    }

    if (type === "video") {
      const maxBytes = 25 * 1024 * 1024; // 25 MB
      if (file.size > maxBytes) {
        return { success: false, error: "حجم ملف الفيديو يتجاوز الحد المسموح به (25 ميجابايت كحد أقصى)." };
      }

      const allowedMimes: Record<string, string> = {
        "video/mp4": ".mp4",
        "video/webm": ".webm",
        "video/ogg": ".ogg",
      };

      const ext = allowedMimes[file.type.toLowerCase()];
      if (!ext) {
        return {
          success: false,
          error: "صيغة الفيديو غير مدعومة. الصيغ المعتمدة: MP4, WebM, OGG.",
        };
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      if (buffer.length > maxBytes) {
        return { success: false, error: "حجم ملف الفيديو يتجاوز الحد المسموح به (25 ميجابايت كحد أقصى)." };
      }

      const safeDir = path.join(process.cwd(), "public", "uploads", "videos");
      if (!fs.existsSync(safeDir)) {
        fs.mkdirSync(safeDir, { recursive: true });
      }

      const randomName = `vid_${crypto.randomBytes(16).toString("hex")}${ext}`;
      const destination = path.join(safeDir, randomName);

      // Path traversal assertion
      const resolved = path.resolve(destination);
      if (!resolved.startsWith(path.resolve(safeDir))) {
        return { success: false, error: "محاولة غير مصرح بها للوصول إلى مسار نظام الملفات." };
      }

      fs.writeFileSync(destination, buffer);
      return { success: true, url: `/uploads/videos/${randomName}` };
    }

    return { success: false, error: "نوع الوسائط غير معروف." };
  } catch (err) {
    console.error("[SAFE UPLOAD ERROR]", (err as Error).message);
    return { success: false, error: "تعذر حفظ الملف على الخادم بشكل آمن." };
  }
}

/** Removes only files created by this uploader, never arbitrary public paths. */
export function removeUploadedMedia(url: string): void {
  const match = /^\/uploads\/(images|videos)\/(img|vid)_[a-f0-9]{32}\.(jpg|png|webp|mp4|webm|ogg)$/i.exec(url);
  if (!match) return;

  const [, directory, prefix, extension] = match;
  const validPair =
    (directory === "images" && prefix === "img" && ["jpg", "png", "webp"].includes(extension)) ||
    (directory === "videos" && prefix === "vid" && ["mp4", "webm", "ogg"].includes(extension));
  if (!validPair) return;

  const safeDirectory = path.resolve(process.cwd(), "public", "uploads", directory);
  const target = path.resolve(process.cwd(), "public", url.slice(1));
  if (!target.startsWith(`${safeDirectory}${path.sep}`)) return;

  try {
    if (fs.existsSync(target)) fs.unlinkSync(target);
  } catch (err) {
    console.warn("[UPLOAD CLEANUP WARNING]", (err as Error).message);
  }
}
