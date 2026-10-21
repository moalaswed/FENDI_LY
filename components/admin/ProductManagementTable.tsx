"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ProductItem, CategoryOption } from "@/types/products";
import { toggleProductActiveAction, deleteProductAction } from "@/app/admin/product-actions";
import ProductDetailsModal from "./ProductDetailsModal";

interface ProductManagementTableProps {
  products: ProductItem[];
  categories: CategoryOption[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export default function ProductManagementTable({
  products,
  categories,
  totalCount,
  currentPage,
  totalPages,
}: ProductManagementTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Active filters from URL
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "all";
  const currentStatus = searchParams.get("status") || "all";
  const currentSortBy = searchParams.get("sortBy") || "sort_order";
  const currentSortDir = searchParams.get("sortDir") || "asc";

  // Local state for instant search input
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductItem | null>(null);

  // Deletion modal state
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to update URL search parameters
  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === "" || (key === "category" && val === "all") || (key === "status" && val === "all") || (key === "page" && val === "1")) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    }
    startTransition(() => {
      router.push(`/admin/products?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ search: searchTerm.trim() || null, page: "1" });
  };

  // Toggle active status
  const handleToggleActive = async (product: ProductItem) => {
    const nextState = !product.isActive;
    startTransition(async () => {
      await toggleProductActiveAction(product.id, nextState);
      router.refresh();
    });
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    setDeleteErrorMessage(null);

    const res = await deleteProductAction(productToDelete.id);
    setIsDeleting(false);

    if (!res.success) {
      setDeleteErrorMessage(res.error || "تعذر حذف المنتج.");
      return;
    }

    setProductToDelete(null);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="space-y-6 text-right">
      {/* Filters and Actions Bar */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو رمز الصنف (كود)..."
              className="w-full pr-10 pl-20 py-2.5 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-xs sm:text-sm placeholder-[#777777] focus:border-[#A50000] focus:outline-none transition-colors"
            />
            <svg
              className="w-4 h-4 text-[#777777] absolute right-3.5 top-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button
              type="submit"
              className="absolute left-2 top-2 px-3 py-1 rounded-lg bg-[#A50000] hover:bg-[#C20000] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              بحث
            </button>
          </form>

          {/* Quick Action: Add New Product */}
          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 rounded-xl bg-[#A50000] hover:bg-[#C20000] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-[#A50000]/30 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>إضافة منتج جديد</span>
          </Link>
        </div>

        {/* Secondary Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#242424]">
          {/* Categories Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-[#888888] ml-2 shrink-0">القسم:</span>
            {categories.map((cat) => {
              const isSelected = currentCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => updateQuery({ category: cat.key, page: "1" })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#A50000] text-white"
                      : "bg-[#202020] text-[#B8B8B8] hover:text-white border border-[#2E2E2E]"
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.count !== undefined && (
                    <span className="mr-1 opacity-70 text-[10px]">({cat.count})</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Status & Sorting Controls */}
          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-[#202020] p-1 rounded-xl border border-[#2E2E2E] text-xs">
              <button
                type="button"
                onClick={() => updateQuery({ status: "all", page: "1" })}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  currentStatus === "all" ? "bg-[#333333] text-white" : "text-[#888888] hover:text-white"
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => updateQuery({ status: "active", page: "1" })}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  currentStatus === "active" ? "bg-emerald-950 text-emerald-400 font-bold" : "text-[#888888] hover:text-white"
                }`}
              >
                نشط
              </button>
              <button
                type="button"
                onClick={() => updateQuery({ status: "inactive", page: "1" })}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  currentStatus === "inactive" ? "bg-amber-950 text-amber-400 font-bold" : "text-[#888888] hover:text-white"
                }`}
              >
                معطل
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={`${currentSortBy}:${currentSortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split(":");
                updateQuery({ sortBy: sb, sortDir: sd, page: "1" });
              }}
              className="px-3 py-1.5 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-xs focus:border-[#A50000] focus:outline-none cursor-pointer"
            >
              <option value="sort_order:asc">ترتيب الظهور (تصاعدي)</option>
              <option value="sort_order:desc">ترتيب الظهور (تنازلي)</option>
              <option value="updated_at:desc">الأحدث تعديلاً</option>
              <option value="name:asc">الاسم (أ - ي)</option>
              <option value="code:asc">الكود (تصاعدي)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isPending && (
        <div className="py-2 text-center text-xs text-[#A50000] animate-pulse">
          جارٍ تحديث قائمة المنتجات...
        </div>
      )}

      {/* Products Table (Desktop) */}
      <div className="hidden lg:block bg-[#181818] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="border-b border-[#242424] bg-[#141414] text-[11px] font-bold text-[#8E8E8E] uppercase tracking-wider">
              <th className="py-3.5 px-4">الصورة / الوسائط</th>
              <th className="py-3.5 px-4">كود الصنف</th>
              <th className="py-3.5 px-4">اسم المنتج</th>
              <th className="py-3.5 px-4">القسم</th>
              <th className="py-3.5 px-4 text-center">الترتيب</th>
              <th className="py-3.5 px-4 text-center">الحالة</th>
              <th className="py-3.5 px-4 text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222] text-xs">
            {products.length > 0 ? (
              products.map((product) => {
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-[#1E1E1E] transition-colors group"
                  >
                    {/* Product Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black border border-[#2E2E2E]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    </td>

                    {/* Product Code */}
                    <td className="py-3 px-4 font-mono font-bold text-white" dir="ltr">
                      {product.code}
                    </td>

                    {/* Name & Tag */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white group-hover:text-red-400 transition-colors">
                        {product.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {product.tag && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#A50000] text-white">
                            {product.tag}
                          </span>
                        )}
                        <span className="text-[10px] text-[#666666] font-mono" dir="ltr">
                          {product.id}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-[#B8B8B8]">
                      {product.categoryLabel}
                    </td>

                    {/* Sort Order */}
                    <td className="py-3 px-4 text-center font-mono text-[#8E8E8E]">
                      {product.sortOrder ?? 0}
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(product)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          product.isActive
                            ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900"
                            : "bg-[#252525] text-[#888888] border border-[#333333] hover:bg-[#303030]"
                        }`}
                        title={product.isActive ? "اضغط لإلغاء التفعيل" : "اضغط لتفعيل المنتج في المتجر"}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            product.isActive ? "bg-emerald-400 animate-pulse" : "bg-[#666666]"
                          }`}
                        />
                        <span>{product.isActive ? "نشط" : "معطل"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-left">
                      <div className="inline-flex items-center gap-1.5">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setSelectedProductForModal(product)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2C2C2C] text-white text-[11px] font-medium border border-[#333333] transition-colors cursor-pointer"
                          title="معاينة كافة التفاصيل"
                        >
                          معاينة
                        </button>

                        {/* Edit Link */}
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="px-2.5 py-1.5 rounded-lg bg-[#A50000]/20 hover:bg-[#A50000] text-red-300 hover:text-white text-[11px] font-bold border border-[#A50000]/40 transition-colors"
                        >
                          تعديل
                        </Link>

                        {/* Safe Delete */}
                        <button
                          type="button"
                          onClick={() => setProductToDelete(product)}
                          className="px-2 py-1.5 rounded-lg bg-[#222222] hover:bg-red-950 text-[#888888] hover:text-red-400 text-[11px] border border-[#333333] transition-colors cursor-pointer"
                          title="حذف الصنف"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#777777]">
                  لا توجد منتجات تطابق خيارات البحث والتصفية المحددة.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Products Cards (Mobile & Tablet) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
        {products.length > 0 ? (
          products.map((product) => {
            return (
              <div
                key={product.id}
                className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black border border-[#2E2E2E] shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-white" dir="ltr">
                          {product.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            product.isActive
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : "bg-[#252525] text-[#888888] border border-[#333333]"
                          }`}
                        >
                          {product.isActive ? "نشط" : "معطل"}
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-white line-clamp-1">{product.name}</h4>
                      <span className="text-[11px] text-[#8E8E8E]">{product.categoryLabel}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#9E9E9E] line-clamp-2 mb-4 leading-relaxed">
                    {product.shortDesc}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#252525]">
                  <button
                    type="button"
                    onClick={() => setSelectedProductForModal(product)}
                    className="flex-1 py-1.5 rounded-lg bg-[#222222] text-white text-xs font-medium text-center"
                  >
                    معاينة
                  </button>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="flex-1 py-1.5 rounded-lg bg-[#A50000] text-white text-xs font-bold text-center"
                  >
                    تعديل
                  </Link>
                  <button
                    type="button"
                    onClick={() => setProductToDelete(product)}
                    className="p-1.5 rounded-lg bg-[#222222] text-[#888888] hover:text-red-400"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="sm:col-span-2 py-12 text-center text-[#777777] bg-[#181818] rounded-2xl border border-[#2A2A2A]">
            لا توجد منتجات مطابقة لخيارات التصفية.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 text-xs text-[#8E8E8E]">
          <div>
            عرض <span className="text-white font-bold">{products.length}</span> من إجمالي{" "}
            <span className="text-white font-bold">{totalCount}</span> منتج
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => updateQuery({ page: String(currentPage - 1) })}
              className="px-3 py-1.5 rounded-lg bg-[#202020] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#282828] border border-[#2E2E2E] cursor-pointer"
            >
              السابق
            </button>

            <span className="px-3 py-1.5 font-bold text-white bg-[#141414] border border-[#2A2A2A] rounded-lg">
              صفحة {currentPage} من {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => updateQuery({ page: String(currentPage + 1) })}
              className="px-3 py-1.5 rounded-lg bg-[#202020] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#282828] border border-[#2E2E2E] cursor-pointer"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <ProductDetailsModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
      />

      {/* Safe Delete Warning Dialog */}
      {productToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in"
          onClick={() => setProductToDelete(null)}
        >
          <div
            className="bg-[#181818] border border-[#333333] rounded-2xl max-w-md w-full p-6 text-right shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-950/70 border border-[#A50000] text-[#A50000] flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">تأكيد حذف المنتج</h3>
            <p className="text-xs text-[#B8B8B8] leading-relaxed mb-4">
              هل أنت متأكد من رغبتك في حذف المنتج{" "}
              <strong className="text-white">&ldquo;{productToDelete.name}&rdquo;</strong> (كود:{" "}
              <span className="font-mono" dir="ltr">{productToDelete.code}</span>) نهائياً من قاعدة البيانات؟
            </p>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs mb-6">
              <strong className="block mb-1">إرشاد أمني ومبيعات:</strong>
              نوصي باستخدام <strong className="text-white">إلغاء التفعيل</strong> بدلاً من الحذف للحفاظ على سجلات الفواتير والمحادثات السابقة وعدم إرباك العملاء الذين يملكون رابط الصنف.
            </div>

            {deleteErrorMessage && (
              <div className="mb-4 text-xs text-red-400 font-bold bg-red-950/60 p-2.5 rounded-lg border border-red-800">
                {deleteErrorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-white text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-[#A50000] hover:bg-[#C20000] disabled:bg-[#520000] text-white text-xs font-bold shadow-lg shadow-[#A50000]/30 cursor-pointer"
              >
                {isDeleting ? "جارٍ الحذف..." : "نعم، حذف نهائي"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
