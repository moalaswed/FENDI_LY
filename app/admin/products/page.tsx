import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/admin/dal";
import { getAdminProducts, getAdminCategories } from "@/lib/admin/products";
import AdminHeader from "@/components/admin/AdminHeader";
import ProductManagementTable from "@/components/admin/ProductManagementTable";
import { COMPANY } from "@/data/company";

export const instant = false;

export const metadata: Metadata = {
  title: `إدارة المنتجات والكتالوج | ${COMPANY.brandName.fullAr}`,
  description: "لوحة إدارة وتعديل منتجات شركة الفاندي للصناعات البلاستيكية في PostgreSQL",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: "all" | "active" | "inactive";
    sortBy?: "sort_order" | "name" | "code" | "updated_at";
    sortDir?: "asc" | "desc";
    page?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  // Authorization check inside page
  const admin = await requireSuperAdmin();
  const resolvedParams = await searchParams;

  const page = parseInt(resolvedParams.page || "1", 10) || 1;
  const limit = 15;

  const [{ products, totalCount, totalPages }, categories] = await Promise.all([
    getAdminProducts({
      search: resolvedParams.search,
      category: resolvedParams.category,
      status: resolvedParams.status,
      sortBy: resolvedParams.sortBy,
      sortDir: resolvedParams.sortDir,
      page,
      limit,
    }),
    getAdminCategories(),
  ]);

  return (
    <div className="min-h-screen bg-[#111111] text-[#B8B8B8] selection:bg-[#A50000] selection:text-white flex flex-col">
      {/* Top Header */}
      <AdminHeader admin={admin} activePath="/admin/products" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full text-right">
        {/* Page Title & Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-[#8E8E8E] mb-2">
            <span>لوحة التحكم</span>
            <span className="text-[#444444]">/</span>
            <span className="text-white font-medium">إدارة المنتجات والكتالوج</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                إدارة كتالوج المنتجات ({totalCount})
              </h1>
              <p className="text-xs sm:text-sm text-[#8E8E8E] mt-1">
                تعديل وإضافة وتفعيل وإيقاف منتجات مصنع الفاندي المسجلة في PostgreSQL مع دعم الفيديو التوضيحي.
              </p>
            </div>
          </div>
        </div>

        {/* Product Management Interactive Table */}
        <ProductManagementTable
          products={products}
          categories={categories}
          totalCount={totalCount}
          currentPage={page}
          totalPages={totalPages}
          limit={limit}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1C1C1C] py-4 text-center text-xs text-[#555555]">
        جميع الحقوق محفوظة © 2026 {COMPANY.brandName.fullAr} - إدارة الكتالوج الحي
      </footer>
    </div>
  );
}
