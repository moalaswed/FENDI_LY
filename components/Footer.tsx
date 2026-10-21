import React from "react";
import Image from "next/image";
import Link from "next/link";
import { COMPANY, buildWhatsAppUrl } from "@/data/company";

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-[#111111] border-t border-[#242424] text-[#B8B8B8] text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-14">
          {/* Brand Info (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#520000] bg-black p-0.5">
                <Image
                  src="/logo.png"
                  alt="شعار الفاندي للصناعات البلاستيكية"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-white group-hover:text-red-400 transition-colors">
                  {COMPANY.brandName.fullAr}
                </span>
                <span className="text-xs text-[#8E8E8E] font-medium tracking-wider uppercase">
                  {COMPANY.brandName.en}
                </span>
              </div>
            </Link>

            <p className="text-sm text-[#B8B8B8] leading-relaxed max-w-sm mb-6">
              شركة ليبية متخصصة في تصنيع المنتجات البلاستيكية عالية الجودة، ومواسير التمديدات الكهربائية
              المرنة، والبراميل والحاويات الصناعية، والمستلزمات الزراعية. بيع مباشر بالجملة والقطاعي.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#202020] border border-[#2E2E2E] text-xs text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <a
                href="https://www.google.com/maps/search/?api=1&query=32.75723204514421%2C13.092708301921975"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="عرض المقر الفعلي على خرائط Google"
                title="عرض الموقع على خرائط Google"
                className="hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A50000] rounded"
              >
                المقر الفعلي: {COMPANY.location.country} - {COMPANY.location.city}
              </a>
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-r-2 border-[#A50000] pr-2.5">
              أقسام الموقع
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-[#B8B8B8] hover:text-white transition-colors">الرئيسية</Link>
              </li>
              <li>
                <Link href="/#about" className="text-[#B8B8B8] hover:text-white transition-colors">نبذة عن المصنع</Link>
              </li>
              <li>
                <Link href="/products" className="text-[#B8B8B8] hover:text-white transition-colors">كتالوج المنتجات</Link>
              </li>
              <li>
                <Link href="/#manufacturing" className="text-[#B8B8B8] hover:text-white transition-colors">خطوط الإنتاج والجودة</Link>
              </li>
              <li>
                <Link href="/#contact" className="text-[#B8B8B8] hover:text-white transition-colors">بيانات التواصل المباشر</Link>
              </li>
            </ul>
          </div>

          {/* Categories (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-r-2 border-[#A50000] pr-2.5">
              قطاعات الإنتاج
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/products" className="text-[#B8B8B8] hover:text-white transition-colors">التأسيسات الكهربائية</Link>
              </li>
              <li>
                <Link href="/products" className="text-[#B8B8B8] hover:text-white transition-colors">البراميل والحاويات</Link>
              </li>
              <li>
                <Link href="/products" className="text-[#B8B8B8] hover:text-white transition-colors">المستلزمات الزراعية</Link>
              </li>
              <li>
                <Link href="/products" className="text-[#B8B8B8] hover:text-white transition-colors">الأدوات والتنظيم</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-r-2 border-[#A50000] pr-2.5">
              التواصل السريع
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.056-1.11-.082-.264-.087-.599-.214-1.04-.407-1.85-.811-3.056-2.69-3.149-2.812-.093-.122-.756-1.006-.756-1.92 0-.913.479-1.362.65-1.547.171-.184.373-.23.498-.23.125 0 .25.002.359.006.115.006.269-.044.421.323.158.38.541 1.32.589 1.417.048.098.081.213.016.34-.065.127-.098.207-.193.318-.095.111-.2.248-.286.333-.095.095-.195.198-.084.389.111.19.493.813 1.058 1.317.728.648 1.341.851 1.532.946.191.095.303.079.414-.048.112-.128.479-.558.607-.749.128-.19.256-.159.43-.095.174.064 1.107.522 1.298.617.191.095.318.143.366.223.048.08.048.461-.096.866zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.662 1.442 5.179L2 22l4.966-1.303A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                  <span>محادثة واتساب</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${COMPANY.phones[0].dial}`}
                  className="text-[#B8B8B8] hover:text-white transition-colors"
                  dir="ltr"
                >
                  {COMPANY.phones[0].display}
                </a>
              </li>
              <li>
                <a
                  href={COMPANY.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>صفحة Facebook</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 border-t border-[#202020] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E8E8E]">
          <div className="flex flex-col items-center sm:items-start gap-1.5 text-center sm:text-right">
            <p>
              جميع الحقوق محفوظة © {currentYear} {COMPANY.brandName.fullAr} ({COMPANY.brandName.subAr}).
            </p>
            <p className="text-[11px] sm:text-xs text-[#888888] tracking-wide" dir="ltr">
              <span>Made with care by </span>
              <a
                href="https://moalaswad.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#A50000] hover:text-[#C20000] hover:underline cursor-pointer transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A50000] rounded px-0.5"
                title="Mohammed Alaswed"
              >
                Mohammed Alaswed
              </a>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="flex items-center gap-2">
              <span>صناعة وطنية ليبية عالية الجودة</span>
              <span>•</span>
              <span>طرابلس، ليبيا</span>
            </p>
            {/* Subtle Admin Portal Entrance Icon */}
            <Link
              href="/admin/login"
              aria-label="دخول لوحة التحكم"
              title="دخول لوحة التحكم"
              className="p-1.5 text-[#555555] hover:text-[#A50000] hover:bg-[#1C1C1C] transition-colors rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A50000] cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
