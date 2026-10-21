import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/lib/admin/dal";
import {
  getAdminProductById,
  getAdminCategories,
  getExistingPublicImages,
} from "@/lib/admin/products";
import AdminHeader from "@/components/admin/AdminHeader";
import ProductForm from "@/components/admin/ProductForm";
import { COMPANY } from "@/data/company";

export const instant = false;

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getAdminProductById(id);

  return {
    title: product
      ? `تعديل المنتج: ${product.name} | ${COMPANY.brandName.fullAr}`
      : `تعديل المنتج | ${COMPANY.brandName.fullAr}`,
    description: "تعديل مواصفات المنتج وبياناته وصورته والفيديو التوضيحي",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  // Authorization check inside page
  const admin = await requireSuperAdmin();
  const { id } = await params;

  const [product, categories, galleryImages] = await Promise.all([
    getAdminProductById(id),
    getAdminCategories(),
    getExistingPublicImages(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#111111] text-[#B8B8B8] selection:bg-[#A50000] selection:text-white flex flex-col">
      {/* Top Navigation */}
      <AdminHeader admin={admin} activePath="/admin/products" />

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
            <span className="text-white font-medium">تعديل: {product.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                تعديل بيانات المنتج
              </h1>
              <p className="text-xs sm:text-sm text-[#8E8E8E] mt-1">
                تحديث المواصفات، تعديل الصور، إدارة الفيديو التوضيحي، وحفظ التعديلات في MariaDB.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-[#8E8E8E] bg-[#181818] p-2.5 rounded-xl border border-[#2A2A2A]">
              <span>ID:</span>
              <span className="text-white font-bold" dir="ltr">{product.id}</span>
            </div>
          </div>
        </div>

        {/* Product Edit Form */}
        <ProductForm
          initialProduct={product}
          categories={categories}
          galleryImages={galleryImages}
          isEdit={true}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1C1C1C] py-4 text-center text-xs text-[#555555]">
        جميع الحقوق محفوظة © 2026 {COMPANY.brandName.fullAr} - إدارة الكتالوج الحي
      </footer>
    </div>
  );
}
