import type { Metadata } from "next";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/admin/dal";
import { query } from "@/lib/db";
import AdminHeader from "@/components/admin/AdminHeader";
import { COMPANY } from "@/data/company";

export const instant = false;

export const metadata: Metadata = {
  title: `لوحة المؤشرات الإدارية | ${COMPANY.brandName.fullAr}`,
  description: "لوحة التحكم المركزية لشركة الفاندي للصناعات البلاستيكية",
  robots: {
    index: false,
    follow: false,
  },
};

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  categoriesCount: number;
}

interface RecentProductRow {
  id: string;
  code: string;
  name: string;
  category_label: string;
  is_active: boolean;
  updated_at: Date;
}

async function getDashboardData(): Promise<{
  stats: DashboardStats;
  recentProducts: RecentProductRow[];
}> {
  // 1. Fetch counts
  const statsRes = await query<{
    total_products: string;
    active_products: string;
    inactive_products: string;
    categories_count: string;
  }>(
    `SELECT
       (SELECT COUNT(*) FROM products) AS total_products,
       (SELECT COUNT(*) FROM products WHERE is_active = true) AS active_products,
       (SELECT COUNT(*) FROM products WHERE is_active = false) AS inactive_products,
       (SELECT COUNT(*) FROM categories) AS categories_count;`
  );

  const statsRow = statsRes.rows[0];
  const stats: DashboardStats = {
    totalProducts: Number(statsRow?.total_products ?? 0),
    activeProducts: Number(statsRow?.active_products ?? 0),
    inactiveProducts: Number(statsRow?.inactive_products ?? 0),
    categoriesCount: Number(statsRow?.categories_count ?? 0),
  };

  // 2. Fetch 5 most recently updated products
  const recentRes = await query<RecentProductRow>(
    `SELECT 
       p.id,
       p.code,
       p.name,
       c.label AS category_label,
       p.is_active,
       p.updated_at
     FROM products p
     JOIN categories c ON p.category_key = c.\`key\`
     ORDER BY p.updated_at DESC
     LIMIT 5;`
  );

  return { stats, recentProducts: recentRes.rows };
}

export default async function AdminDashboardPage() {
  // Authorization check: requires verified active super_admin session with password change completed
  const admin = await requireSuperAdmin();
  const { stats, recentProducts } = await getDashboardData();

  return (
    <div className="min-h-screen bg-[#111111] text-[#B8B8B8] selection:bg-[#A50000] selection:text-white flex flex-col">
      {/* Top Navigation */}
      <AdminHeader admin={admin} activePath="/admin" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        {/* Welcome Banner */}
        <div className="mb-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-l from-[#1C1C1C] to-[#161616] border border-[#2A2A2A] relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-2 h-full bg-[#A50000]" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#252525] border border-[#333333] mb-3 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-white font-medium">جلسة إدارية موثقة (Super Admin)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                أهلاً بك، {admin.username}
              </h1>
              <p className="text-xs sm:text-sm text-[#8E8E8E] mt-1.5 leading-relaxed max-w-2xl">
                لوحة الإدارة المركزية لإدارة منتجات شركة الفاندي للصناعات البلاستيكية والتحكم المباشر بقاعدة البيانات ومحتوى الكتالوج الحي.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/admin/products/new"
                className="px-4 py-2.5 rounded-xl bg-[#A50000] hover:bg-[#C20000] text-white text-xs font-bold transition-all shadow-lg shadow-[#A50000]/30 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>إضافة منتج جديد</span>
              </Link>
              <Link
                href="/admin/products"
                className="px-4 py-2.5 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-white text-xs font-semibold border border-[#333333] transition-colors"
              >
                إدارة المنتجات ({stats.totalProducts})
              </Link>
            </div>
          </div>
        </div>

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {/* Metric 1: Total Products */}
          <div className="p-5 rounded-2xl bg-[#181818] border border-[#2A2A2A] relative overflow-hidden">
            <span className="text-xs text-[#8E8E8E] block mb-1">إجمالي المنتجات</span>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats.totalProducts}
            </span>
            <div className="text-[10px] text-[#777777] mt-2">في قاعدة البيانات</div>
          </div>

          {/* Metric 2: Active Products */}
          <div className="p-5 rounded-2xl bg-[#181818] border border-[#2A2A2A] relative overflow-hidden">
            <span className="text-xs text-[#8E8E8E] block mb-1">المنتجات النشطة</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {stats.activeProducts}
            </span>
            <div className="text-[10px] text-emerald-500/70 mt-2">تظهر للجمهور في المتجر</div>
          </div>

          {/* Metric 3: Inactive Products */}
          <div className="p-5 rounded-2xl bg-[#181818] border border-[#2A2A2A] relative overflow-hidden">
            <span className="text-xs text-[#8E8E8E] block mb-1">منتجات معطلة</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {stats.inactiveProducts}
            </span>
            <div className="text-[10px] text-amber-500/70 mt-2">مسودة ومخفية عن الزوار</div>
          </div>

          {/* Metric 4: Categories */}
          <div className="p-5 rounded-2xl bg-[#181818] border border-[#2A2A2A] relative overflow-hidden">
            <span className="text-xs text-[#8E8E8E] block mb-1">الأقسام الصناعية</span>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats.categoriesCount}
            </span>
            <div className="text-[10px] text-[#777777] mt-2">قطاعات التصنيع الرئيسية</div>
          </div>

        </div>

        {/* Quick Actions & Recent Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Recent Products Activity (2 cols) */}
          <div className="lg:col-span-2 bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#242424]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#A50000]" />
                <span>أحدث المنتجات المعدلة في الكتالوج</span>
              </h3>
              <Link
                href="/admin/products"
                className="text-xs text-[#A50000] hover:text-red-400 font-bold transition-colors"
              >
                عرض كافة الأصناف ←
              </Link>
            </div>

            <div className="divide-y divide-[#242424]">
              {recentProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-[#1C1C1C] px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded bg-[#222222] border border-[#333333]" dir="ltr">
                      {prod.code}
                    </span>
                    <div>
                      <span className="text-sm font-bold text-white block line-clamp-1">
                        {prod.name}
                      </span>
                      <span className="text-[11px] text-[#777777]">
                        {prod.category_label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        prod.is_active
                          ? "bg-emerald-950 text-emerald-400"
                          : "bg-[#252525] text-[#888888]"
                      }`}
                    >
                      {prod.is_active ? "نشط" : "معطل"}
                    </span>

                    <Link
                      href={`/admin/products/${prod.id}/edit`}
                      className="px-2.5 py-1 rounded-lg bg-[#222222] hover:bg-[#A50000] text-white text-xs font-semibold border border-[#333333] transition-colors"
                    >
                      تعديل
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Management Shortcuts (1 col) */}
          <div className="space-y-4">
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-3">روابط وإجراءات سريعة</h3>
              <div className="space-y-2.5">
                <Link
                  href="/admin/products/new"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#202020] hover:bg-[#282828] text-white text-xs font-semibold border border-[#2E2E2E] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[#A50000]">+</span>
                    <span>إضافة منتج جديد للكتالوج</span>
                  </span>
                  <span className="text-[#888888]">←</span>
                </Link>

                <Link
                  href="/admin/products?status=inactive"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#202020] hover:bg-[#282828] text-white text-xs font-semibold border border-[#2E2E2E] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-amber-400">●</span>
                    <span>مراجعة الأصناف المعطلة ({stats.inactiveProducts})</span>
                  </span>
                  <span className="text-[#888888]">←</span>
                </Link>

                <Link
                  href="/products"
                  target="_blank"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#202020] hover:bg-[#282828] text-white text-xs font-semibold border border-[#2E2E2E] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-emerald-400">↗</span>
                    <span>معاينة متجر الفاندي الحي</span>
                  </span>
                  <span className="text-[#888888]">فتح</span>
                </Link>
              </div>
            </div>

            {/* System Security Card */}
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 text-xs text-[#888888]">
              <h3 className="text-sm font-bold text-white mb-2">منظومة الحماية والخادم</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-[#242424]">
                  <span>قاعدة البيانات:</span>
                  <span className="text-emerald-400 font-mono">MariaDB (متصل)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#242424]">
                  <span>التحقق من الصلاحيات:</span>
                  <span className="text-emerald-400">super_admin Server-Side</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>تحديث الكاش:</span>
                  <span className="text-white">revalidateTag(&apos;products&apos;)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1C1C1C] py-4 text-center text-xs text-[#555555]">
        جميع الحقوق محفوظة © 2026 {COMPANY.brandName.fullAr} - نظام الإدارة المحمي
      </footer>
    </div>
  );
}
