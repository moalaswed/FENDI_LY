"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { ProductItem, CategoryOption } from "@/types/products";
import ProductCard from "./ProductCard";
import { buildWhatsAppUrl } from "@/data/company";

interface ProductCatalogProps {
  isPage?: boolean;
  initialProducts?: ProductItem[];
  initialCategories?: CategoryOption[];
  error?: string | null;
}

export default function ProductCatalog({
  isPage = false,
  initialProducts = [],
  initialCategories = [],
  error = null,
}: ProductCatalogProps = {}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    if (initialCategories && initialCategories.length > 0) {
      return initialCategories;
    }
    return [{ key: "all", label: "كافة المنتجات", count: initialProducts.length }];
  }, [initialCategories, initialProducts.length]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      const matchesSearch =
        searchQuery.trim() === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.code && product.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [initialProducts, selectedCategory, searchQuery]);

  return (
    <section
      id="products"
      className={
        isPage
          ? "pt-28 sm:pt-36 lg:pt-40 pb-20 md:pb-32 bg-[#151515] relative"
          : "py-20 md:py-32 bg-[#151515] border-t border-[#242424] relative"
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isPage && (
          <nav aria-label="مسار التنقل" className="mb-6 flex items-center gap-2 text-xs sm:text-sm text-[#8E8E8E]">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-[#A50000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>الرئيسية</span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-white font-medium">كتالوج المنتجات</span>
          </nav>
        )}

        {/* Database Unavailable Error Banner */}
        {error && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-red-950/40 border border-[#A50000]/60 text-right flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#A50000] animate-pulse shrink-0" />
              <div>
                <p className="text-sm font-bold text-white mb-0.5">
                  تنبيه مؤقت في الاتصال بقاعدة البيانات
                </p>
                <p className="text-xs text-[#C8C8C8] leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
            <a
              href={buildWhatsAppUrl("أرغب في الاستفسار عن منتجاتكم وأسعار التوريد")}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-[#A50000] hover:bg-[#C20000] text-white text-xs font-bold transition-colors shrink-0 shadow-md shadow-[#A50000]/30"
            >
              استفسار عبر WhatsApp
            </a>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-right">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#202020] border border-[#2E2E2E] mb-4">
              <span className="w-2 h-2 rounded-full bg-[#A50000]"></span>
              <span className="text-xs font-semibold text-[#A50000] uppercase tracking-wider">
                كتالوج المنتجات الفعلي
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              تشكيلة واسعة تلبي كافة الاستخدامات
            </h2>
            <p className="text-sm sm:text-base text-[#B8B8B8] mt-3 max-w-2xl leading-relaxed">
              تصفح منتجاتنا المصنعة محلياً بأعلى مواصفات البولي إيثيلين والبولي بروبيلين. انقر على أي
              منتج لبدء محادثة واتساب فورية ومعرفة تفاصيل التوريد والكميات.
            </p>
          </div>

          {/* Quick Notice */}
          <div className="bg-[#202020] border border-[#2E2E2E] p-4 rounded-xl text-xs text-[#B8B8B8] max-w-sm">
            <span className="text-white font-bold block mb-1">البيع بالجملة والقطاعي:</span>
            متاح الشراء المباشر من مقر الشركة ومصنعها أو التنسيق للكميات وتوريد المشاريع عبر WhatsApp.
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-10 pb-6 border-b border-[#242424]">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#A50000] text-white shadow-lg shadow-[#A50000]/30"
                      : "bg-[#202020] text-[#B8B8B8] hover:text-white hover:bg-[#282828] border border-[#2E2E2E]"
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.count !== undefined && cat.count > 0 && (
                    <span className="mr-1.5 text-[11px] opacity-75">
                      ({cat.count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو الرمز (مثال: F0022)..."
              className="w-full py-2.5 pr-10 pl-4 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-xs sm:text-sm placeholder-[#888888] focus:outline-none focus:border-[#A50000] transition-colors"
            />
            <svg
              className="w-4 h-4 text-[#888888] absolute right-3.5 top-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#202020] rounded-2xl border border-[#2E2E2E]">
            <p className="text-lg font-bold text-white mb-2">
              {error ? "تعذر عرض المنتجات بسبب انقطاع الاتصال" : "لا توجد منتجات مطابقة لخيارات البحث"}
            </p>
            <p className="text-xs text-[#B8B8B8] mb-4">
              {error ? "يمكنكم التواصل المباشر مع مبيعات الفاندي للاستفسار عن أي صنف" : "جرّب البحث باسم آخر أو اختيار تصنيف مختلف"}
            </p>
            {!error && (
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-lg bg-[#A50000] text-white text-xs font-bold cursor-pointer"
              >
                عرض كافة المنتجات
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
