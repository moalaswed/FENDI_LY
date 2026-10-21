/**
 * Shared Product Catalog Types for FENDI Plastic Industry
 * Safe for use in both Server Components and Client Components.
 */

export type ProductCategory = "all" | "electrical" | "industrial" | "agriculture" | "household" | string;

export interface ProductItem {
  id: string;
  code: string; // Required (aligned with schema NOT NULL column)
  name: string;
  category: string;
  categoryLabel: string;
  image: string;
  video?: string | null; // Optional demonstration video (URL or safe upload path)
  shortDesc: string;
  features: string[];
  tag?: string;
  sortOrder?: number;
  isActive?: boolean;
  updatedAt?: string;
}

export interface CategoryOption {
  key: string;
  label: string;
  count?: number;
}

export interface CatalogDataResult {
  products: ProductItem[];
  categories: CategoryOption[];
  error: string | null;
}
