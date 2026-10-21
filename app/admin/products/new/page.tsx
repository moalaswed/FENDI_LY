import type { Metadata } from "next";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/admin/dal";
import { getAdminCategories, getExistingPublicImages } from "@/lib/admin/products";
import AdminHeader from "@/components/admin/AdminHeader";
import ProductForm from "@/components/admin/ProductForm";
import { COMPANY } from "@/data/company";

export const instant = false;

export const metadata: Metadata = {
  title: `إضافة منتج جديد | ${COMPANY.brandName.fullAr}`,
  description: "إضافة صنف جديد إلى كتالوج منتجات شركة الفاندي للصناعات البلاستيكية",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewProductPage() {
  // Authorization check inside page
  const admin = await requireSuperAdmin();

  const [categories, galleryImages] = await Promise.all([
    getAdminCategories(),
    getExistingPublicImages(),
  ]);

  return (
    <div className="min-h-screen bg-[#111111] text-[#B8B8B8] selection:bg-[#A50000] selection:text-white flex flex-col">
      {/* Top Navigation */}
      <AdminHeader admin={admin} activePath="/admin/products/new" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full text-right">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-[#8E8E8E] mb-2">
            <Link href="/admin" className="hover:text-white transition-colors">
              لوحة التحكم
            </Link>
            <span className="text-[#444444]">/</span>
            <Link href="/admin/products" className="hover:text-white transition-colors">
              إدارة المنتجات
            </Link>
            <span className="text-[#444444]">/</span>
            <span className="text-white font-medium">إضافة منتج جديد</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            إضافة صنف جديد إلى الكتالوج
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8E8E] mt-1">
            أدخل مواصفات المنتج والرمز الفريد والصورة والفيديو التوضيحي (اختياري) للحفظ المباشر في MariaDB.
          </p>
        </div>

        {/* Product Creation Form */}
        <ProductForm
          categories={categories}
          galleryImages={galleryImages}
          isEdit={false}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1C1C1C] py-4 text-center text-xs text-[#555555]">
        جميع الحقوق محفوظة © 2026 {COMPANY.brandName.fullAr} - إدارة الكتالوج الحي
      </footer>
    </div>
  );
}
