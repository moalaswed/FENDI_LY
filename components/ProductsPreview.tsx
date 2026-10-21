import React from "react";
import Image from "next/image";
import Link from "next/link";
import { buildWhatsAppUrl } from "@/data/company";

/**
 * ProductsPreview Component
 *
 * Architectural Decision:
 * This component serves as an intentional, curated editorial showcase on the homepage.
 * It highlights FENDI's 4 core manufacturing sectors (Electrical, Industrial, Agriculture, Household)
 * with tailored marketing copy, category value propositions, and representative imagery.
 *
 * It is intentionally designed as an editorial high-level showcase that directs visitors
 * to the full, dynamic MariaDB-backed catalog at `/products`.
 */

interface CategoryHighlight {
  id: string;
  name: string;
  tagline: string;
  desc: string;
  image: string;
  badge: string;
  specs: string[];
}

const CATEGORY_HIGHLIGHTS: CategoryHighlight[] = [
  {
    id: "electrical",
    name: "التأسيسات والكهرباء",
    tagline: "مجمعات كهربائية متعددة الأقسام",
    desc: "مجمعات كهربائية من مادة ABS، مصممة لتوفير العزل والمساعدة على مقاومة الكسر، ومتوفرة بعدة مقاسات وألوان.",
    image: "/electrical-junction-boxes.png",
    badge: "مجموعة F0003–F0008",
    specs: ["الموديلات F0003 إلى F0008", "مادة ABS مقاومة للكسر", "الأزرق والبرتقالي"],
  },
  {
    id: "industrial",
    name: "البراميل والحاويات",
    tagline: "براميل HDPE عالية الكثافة",
    desc: "براميل تخزين متينة بسعات 30 و60 و120 لتراً مزودة بأقفال معدنية محكمة لتخزين السوائل والمواد.",
    image: "/photo_30_2026-10-20_20-13-23.jpg",
    badge: "متانة وأمان عالي",
    specs: ["سعات 30L / 60L / 120L", "أطواق حديد محكمة", "مقاوم للتآكل والصدمات"],
  },
  {
    id: "agriculture",
    name: "المستلزمات الزراعية",
    tagline: "حلول البيوت المحمية والري",
    desc: "مشابك بيوت زراعية وخراطيم ري معالجة لمقاومة أشعة الشمس فوق البنفسجية وتقلبات المناخ.",
    image: "/photo_18_2026-10-20_20-13-23.jpg",
    badge: "مقاوم للأشعة UV",
    specs: ["مشابك بولي بروبيلين", "تثبيت محكم للبلاستيك", "عمر تشغيلي طويل"],
  },
  {
    id: "household",
    name: "الأدوات والتنظيم",
    tagline: "صناديق وسلال متعددة الأغراض",
    desc: "سلال تنظيمية وصناديق تداول متينة مخصصة للمحاصيل الزراعية والتخزين الصناعي والمنزلي.",
    image: "/photo_20_2026-10-20_20-13-23.jpg",
    badge: "تصميم عملي ومرن",
    specs: ["مقاومة للأوزان العالية", "تصميم مهوى ومحكم", "سهلة الحمل والتكديس"],
  },
];

export default function ProductsPreview() {
  return (
    <section id="products" className="py-20 md:py-28 bg-[#151515] border-t border-[#242424] relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#A50000]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 text-right">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#202020] border border-[#2E2E2E] mb-4">
              <span className="w-2 h-2 rounded-full bg-[#A50000] animate-pulse"></span>
              <span className="text-xs font-semibold text-[#A50000] uppercase tracking-wider">
                منتجات الفاندي للصناعات البلاستيكية
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              تشكيلة متكاملة تلبي كافة القطاعات
            </h2>
            <p className="text-sm sm:text-base text-[#B8B8B8] mt-3 max-w-2xl leading-relaxed">
              من التأسيسات الكهربائية عالية الأمان إلى البراميل الصناعية والمستلزمات الزراعية، نوفر منتجات محلية متينة مصنعة من أجود الخامات النقية 100%.
            </p>
          </div>

          {/* Quick Stats / Reassurance Pill */}
          <div className="bg-[#202020] border border-[#2E2E2E] p-4 rounded-2xl text-xs text-[#B8B8B8] max-w-xs shrink-0">
            <div className="flex items-center gap-2 mb-1.5 text-white font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>مبيعات الجملة والقطاعي</span>
            </div>
            <p className="leading-relaxed">
              تجهيز طلبيات المشاريع والمحال التجارية في كافة أنحاء ليبيا مع إمكانية الشراء المباشر من المصنع.
            </p>
          </div>
        </div>

        {/* 4 Category Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {CATEGORY_HIGHLIGHTS.map((cat) => (
            <div
              key={cat.id}
              className="group bg-[#1A1A1A] rounded-2xl border border-[#2E2E2E] hover:border-[#A50000]/60 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#A50000]/10 hover:-translate-y-1"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-white/5 mb-4">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-white">
                    {cat.badge}
                  </div>
                </div>

                {/* Title & Tagline */}
                <span className="text-xs font-semibold text-[#A50000] block mb-1">
                  {cat.tagline}
                </span>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#9E9E9E] leading-relaxed mb-4">
                  {cat.desc}
                </p>

                {/* Specs */}
                <div className="space-y-1.5 pt-3 border-t border-[#292929] mb-4">
                  {cat.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-[#C2C2C2]">
                      <svg className="w-3 h-3 text-[#A50000] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Link */}
              <Link
                href="/products"
                className="inline-flex items-center justify-between text-xs font-semibold text-white/80 group-hover:text-white pt-2 border-t border-[#292929]/50 transition-colors"
              >
                <span>عرض منتجات القسم</span>
                <svg className="w-4 h-4 rtl:rotate-180 text-[#A50000] group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>

        {/* High-Impact Main CTA Banner to Dedicated /products Page */}
        <div className="rounded-2xl bg-gradient-to-r from-[#202020] via-[#1B1B1B] to-[#202020] border border-[#2E2E2E] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-right">
            <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5">
              تصفح الكتالوج الكامل والمواصفات الفنية
            </h3>
            <p className="text-xs sm:text-sm text-[#A8A8A8] max-w-xl leading-relaxed">
              اكتشف كافة المقاسات، الأكواد، ومعلومات التوريد لجميع منتجات شركة الفاندي مع إمكانية البحث والتصفية المباشرة.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            {/* Primary Action Button: استكشف منتجاتنا */}
            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-[#A50000] hover:bg-[#C20000] text-white font-bold text-sm sm:text-base transition-all duration-200 shadow-xl shadow-[#A50000]/30 hover:shadow-[#A50000]/50 hover:-translate-y-0.5"
            >
              <span>استكشف منتجاتنا</span>
              <svg className="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Secondary WhatsApp Button */}
            <a
              href={buildWhatsAppUrl("أرغب في الحصول على كتالوج المنتجات وأسعار التوريد")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#2E2E2E] hover:border-[#520000] font-semibold text-xs sm:text-sm transition-all duration-200"
            >
              <svg className="w-4 h-4 text-emerald-400 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.056-1.11-.082-.264-.087-.599-.214-1.04-.407-1.85-.811-3.056-2.69-3.149-2.812-.093-.122-.756-1.006-.756-1.92 0-.913.479-1.362.65-1.547.171-.184.373-.23.498-.23.125 0 .25.002.359.006.115.006.269-.044.421.323.158.38.541 1.32.589 1.417.048.098.081.213.016.34-.065.127-.098.207-.193.318-.095.111-.2.248-.286.333-.095.095-.195.198-.084.389.111.19.493.813 1.058 1.317.728.648 1.341.851 1.532.946.191.095.303.079.414-.048.112-.128.479-.558.607-.749.128-.19.256-.159.43-.095.174.064 1.107.522 1.298.617.191.095.318.143.366.223.048.08.048.461-.096.866zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.662 1.442 5.179L2 22l4.966-1.303A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
              <span>طلب تسعيرة عبر WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
