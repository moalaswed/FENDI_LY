import "server-only";

// Double-layered guard against accidental bundling in client components
if (typeof window !== "undefined") {
  throw new Error("lib/products.ts is a server-only module and cannot be imported into client components.");
}

import { cacheLife, cacheTag } from "next/cache";
import { query } from "@/lib/db";
import type { ProductItem, CategoryOption, CatalogDataResult } from "@/types/products";

export type { ProductItem, CategoryOption, CatalogDataResult };

interface ProductDbRow {
  id: string;
  code: string;
  name: string;
  category_key: string;
  category_label: string;
  image: string;
  video?: string | null;
  short_desc: string;
  features: string[] | string;
  tag: string | null;
  sort_order: number;
  is_active: boolean;
  updated_at?: Date;
}

interface CategoryDbRow {
  key: string;
  label: string;
  sort_order: number;
}

/**
 * Checks whether the optional 'video' column has been migrated into the products table.
 * Caches the check in-memory to prevent redundant queries.
 */
let _hasVideoColumnCache: boolean | null = null;
export async function checkHasVideoColumn(): Promise<boolean> {
  if (_hasVideoColumnCache !== null) {
    return _hasVideoColumnCache;
  }
  try {
    const res = await query<{ has_video: boolean }>(
      `SELECT EXISTS (
         SELECT 1 
         FROM information_schema.columns 
         WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'video'
       ) AS has_video;`
    );
    _hasVideoColumnCache = Boolean(Number(res.rows[0]?.has_video ?? 0));
    return _hasVideoColumnCache;
  } catch {
    return false;
  }
}

/**
 * Maps a MariaDB database row to the UI ProductItem model.
 */
export function mapProductRow(row: ProductDbRow): ProductItem {
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
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

export function parseFeatures(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Internal fetcher that queries MariaDB directly.
 * If the database query fails, this throws so that Next.js does NOT cache a failed result.
 */
async function fetchProductsFromDb(): Promise<{ products: ProductItem[]; categories: CategoryOption[] }> {
  // 1. Fetch categories
  const categoriesRes = await query<CategoryDbRow>(
    `SELECT \`key\`, label, sort_order
     FROM categories
     ORDER BY sort_order ASC, \`key\` ASC;`
  );

  // 2. Check for optional video column presence
  const hasVideo = await checkHasVideoColumn();
  const videoSelect = hasVideo ? "p.video," : "CAST(NULL AS CHAR) AS video,";

  // 3. Fetch active products with joined category label, ordered by category and product sort order
  const productsRes = await query<ProductDbRow>(
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
       p.updated_at
     FROM products p
     JOIN categories c ON p.category_key = c.\`key\`
     WHERE p.is_active = true
     ORDER BY c.sort_order ASC, p.sort_order ASC, p.id ASC;`
  );

  const products = productsRes.rows.map(mapProductRow);

  // 3. Compute count for each category
  const countMap = new Map<string, number>();
  for (const p of products) {
    countMap.set(p.category, (countMap.get(p.category) ?? 0) + 1);
  }

  const categories: CategoryOption[] = [
    {
      key: "all",
      label: "كافة المنتجات",
      count: products.length,
    },
    ...categoriesRes.rows.map((c) => ({
      key: c.key,
      label: c.label,
      count: countMap.get(c.key) ?? 0,
    })),
  ];

  return { products, categories };
}

/**
 * Cached database query using Next.js 16 'use cache' directive with cacheLife and cacheTag.
 * - Stale: 60s (client-side revalidation window)
 * - Revalidate: 60s (server background refresh interval)
 * - Tag: 'products' (for on-demand revalidation via revalidateTag / updateTag)
 * - Error behavior: Throws on DB failure so unsuccessful reads are never cached by Next.js.
 */
async function getCachedCatalogData(): Promise<{ products: ProductItem[]; categories: CategoryOption[] }> {
  "use cache";
  cacheLife({
    stale: 60,
    revalidate: 60,
    expire: 3600,
  });
  cacheTag("products");

  return fetchProductsFromDb();
}

/**
 * Public Server-Side Data Access Function.
 *
 * Policy:
 * - Queries MariaDB via cached fetcher.
 * - If MariaDB is unavailable, captures the error and returns a clean error state without caching the failure.
 * - Does NOT silently spoof or mask database unavailability with stale static data.
 */
export async function getProducts(): Promise<CatalogDataResult> {
  try {
    const { products, categories } = await getCachedCatalogData();
    return {
      products,
      categories,
      error: null,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    // Missing local environment variables are a setup state, not an uncaught
    // application failure. Keep them out of Next.js's development error overlay.
    const isConfigurationError = errorMessage.includes("[DATABASE CONFIG ERROR]");
    const log = isConfigurationError ? console.warn : console.error;
    log("[DATABASE ERROR] Failed to fetch catalog data from MariaDB:", errorMessage);

    return {
      products: [],
      categories: [
        { key: "all", label: "كافة المنتجات", count: 0 },
        { key: "electrical", label: "التأسيسات والكهرباء", count: 0 },
        { key: "industrial", label: "البراميل والحاويات", count: 0 },
        { key: "agriculture", label: "المستلزمات الزراعية", count: 0 },
        { key: "household", label: "الأدوات والتنظيم", count: 0 },
      ],
      error: "تعذر الاتصال بقاعدة البيانات في الوقت الحالي. يرجى إعادة المحاولة لاحقاً أو التواصل المباشر مع إدارة المبيعات عبر WhatsApp.",
    };
  }
}
