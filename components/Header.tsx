"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMPANY, buildWhatsAppUrl } from "@/data/company";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isProductsPage = pathname === "/products";
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (!isProductsPage) {
        const sections = ["hero", "about", "products", "manufacturing", "contact"];
        const scrollPosition = window.scrollY + 160;
        for (let i = sections.length - 1; i >= 0; i--) {
          const el = document.getElementById(sections[i]);
          if (el && el.offsetTop <= scrollPosition) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isProductsPage]);

  const navLinks = [
    { label: "الرئيسية", href: isProductsPage ? "/#hero" : "#hero", id: "hero" },
    { label: "من نحن", href: isProductsPage ? "/#about" : "#about", id: "about" },
    { label: "منتجاتنا", href: "/products", id: "products" },
    { label: "خطوط الإنتاج والجودة", href: isProductsPage ? "/#manufacturing" : "#manufacturing", id: "manufacturing" },
    { label: "تواصل معنا", href: isProductsPage ? "/#contact" : "#contact", id: "contact" },
  ];

  return (
    <header className="fixed top-2 sm:top-3.5 inset-x-0 z-50 pointer-events-none px-3 sm:px-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-2">
        {/* Top Information Strip (Company status, phone, facebook) */}
        <div
          className={`pointer-events-auto px-4 sm:px-6 py-1 sm:py-1.5 rounded-full border border-white/[0.06] text-xs text-[#B8B8B8] flex items-center justify-between gap-3 transition-all duration-300 ${
            isScrolled
              ? "bg-[#141414]/92 backdrop-blur-xl shadow-md"
              : "bg-[#151515]/85 backdrop-blur-md shadow-sm"
          }`}
        >
          {/* Status & Availability */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 text-white font-medium text-[11px] sm:text-xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>مصنع ومقر الشركة مفتوح لخدمتكم</span>
            </span>
            <span className="hidden md:inline text-white/20">|</span>
            <span className="hidden md:inline text-[#B8B8B8] text-xs truncate">
              مبيعات الجملة والقطاعي في ليبيا
            </span>
          </div>

          {/* Quick Contact & Facebook */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs shrink-0">
            <a
              href={`tel:${COMPANY.phones[0].dial}`}
              className="text-[#B8B8B8] hover:text-white transition-colors duration-200 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A50000] rounded px-1"
              dir="ltr"
              title={`اتصال: ${COMPANY.phones[0].display}`}
            >
              <svg className="w-3.5 h-3.5 text-[#A50000] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-medium tracking-wide text-[11px] sm:text-xs">{COMPANY.phones[0].display}</span>
            </a>
            <span className="text-white/20">/</span>
            <a
              href={COMPANY.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B8B8B8] hover:text-white transition-colors duration-200 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A50000] rounded px-1"
              title="صفحة فيسبوك الرسمية"
            >
              <svg className="w-3.5 h-3.5 text-[#1877F2] fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="hidden sm:inline text-[11px] sm:text-xs">صفحة فيسبوك الرسمية</span>
            </a>
          </div>
        </div>

        {/* Three Independent Floating Header Pills (Brand, Navigation, WhatsApp) */}
        <div className="flex items-center justify-between gap-2.5 sm:gap-3.5 w-full relative">
          {/* 1. Independent Brand Pill (Logo + Bilingual Company Name) */}
          <div
            className={`pointer-events-auto px-3.5 sm:px-5 py-2 rounded-full border border-white/10 transition-all duration-300 flex items-center gap-2.5 sm:gap-3 shrink-0 ${
              isScrolled
                ? "bg-[#141414]/96 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.08)_inset]"
                : "bg-[#151515]/90 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.06)_inset]"
            }`}
          >
            <Link
              href={isProductsPage ? "/" : "#hero"}
              className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A50000] rounded-xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-[#520000]/60 bg-black/60 p-0.5 shadow-md transition-transform duration-200 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="شعار شركة الفاندي للصناعات البلاستيكية"
                  fill
                  sizes="40px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base lg:text-lg text-white tracking-wide leading-tight group-hover:text-red-400 transition-colors duration-200 truncate">
                  شركة النجيلة للصناعات البلاستيكية
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#A3A3A3] font-medium tracking-wider uppercase">
                  {COMPANY.brandName.en}
                </span>
              </div>
            </Link>

            {/* Mobile/Tablet Menu Button inside Brand Pill */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-[#D1D1D1] hover:text-white hover:bg-white/10 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A50000] mr-1"
              aria-label="قائمة التصفح"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* 2. Independent Navigation Pill (Desktop Dock with 5 Navigation Links) */}
          <nav
            className={`pointer-events-auto hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/10 transition-all duration-300 ${
              isScrolled
                ? "bg-[#141414]/96 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.08)_inset]"
                : "bg-[#151515]/90 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.06)_inset]"
            }`}
          >
            {navLinks.map((link) => {
              const isActive = isProductsPage
                ? link.id === "products"
                : activeSection === link.id && link.id !== "products";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 xl:px-3.5 xl:py-1.5 rounded-full text-xs xl:text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A50000] flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white/[0.12] text-white shadow-sm font-semibold border border-white/10"
                      : "text-[#B8B8B8] hover:text-white hover:bg-white/[0.06] border border-transparent"
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A50000] inline-block animate-pulse" />
                  )}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. Independent WhatsApp Pill (Detached on Left in RTL) */}
          <aside
            className={`pointer-events-auto shrink-0 p-1.5 sm:p-2 rounded-full border border-white/10 transition-all duration-300 flex items-center justify-center ${
              isScrolled
                ? "bg-[#141414]/96 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.08)_inset]"
                : "bg-[#151515]/90 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.06)_inset]"
            }`}
          >
            {/* Desktop & Tablet WhatsApp CTA Button */}
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 sm:px-4.5 sm:py-2 rounded-full bg-[#A50000] hover:bg-[#C20000] text-white text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md shadow-[#A50000]/30 hover:shadow-[#A50000]/50 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.056-1.11-.082-.264-.087-.599-.214-1.04-.407-1.85-.811-3.056-2.69-3.149-2.812-.093-.122-.756-1.006-.756-1.92 0-.913.479-1.362.65-1.547.171-.184.373-.23.498-.23.125 0 .25.002.359.006.115.006.269-.044.421.323.158.38.541 1.32.589 1.417.048.098.081.213.016.34-.065.127-.098.207-.193.318-.095.111-.2.248-.286.333-.095.095-.195.198-.084.389.111.19.493.813 1.058 1.317.728.648 1.341.851 1.532.946.191.095.303.079.414-.048.112-.128.479-.558.607-.749.128-.19.256-.159.43-.095.174.064 1.107.522 1.298.617.191.095.318.143.366.223.048.08.048.461-.096.866zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.662 1.442 5.179L2 22l4.966-1.303A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
              <span>استفسار عبر WhatsApp</span>
            </a>

            {/* Mobile Compact WhatsApp Button */}
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden p-2.5 rounded-full bg-[#A50000] hover:bg-[#C20000] text-white shadow-md shadow-[#A50000]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="استفسار عبر WhatsApp"
              title="استفسار عبر WhatsApp"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.056-1.11-.082-.264-.087-.599-.214-1.04-.407-1.85-.811-3.056-2.69-3.149-2.812-.093-.122-.756-1.006-.756-1.92 0-.913.479-1.362.65-1.547.171-.184.373-.23.498-.23.125 0 .25.002.359.006.115.006.269-.044.421.323.158.38.541 1.32.589 1.417.048.098.081.213.016.34-.065.127-.098.207-.193.318-.095.111-.2.248-.286.333-.095.095-.195.198-.084.389.111.19.493.813 1.058 1.317.728.648 1.341.851 1.532.946.191.095.303.079.414-.048.112-.128.479-.558.607-.749.128-.19.256-.159.43-.095.174.064 1.107.522 1.298.617.191.095.318.143.366.223.048.08.048.461-.096.866zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.662 1.442 5.179L2 22l4.966-1.303A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
            </a>
          </aside>
        </div>

        {/* Mobile Dropdown Menu (Floating cleanly below, unclipped) */}
        {mobileMenuOpen && (
          <div className="lg:hidden pointer-events-auto px-4 sm:px-6 py-4 bg-[#1B1B1B]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = isProductsPage
                  ? link.id === "products"
                  : activeSection === link.id && link.id !== "products";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                      isActive
                        ? "bg-white/[0.12] text-white font-semibold border border-white/10"
                        : "text-[#B8B8B8] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A50000]" />
                      )}
                      <span>{link.label}</span>
                    </span>
                    <svg className="w-4 h-4 text-[#8E8E8E] rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}

              <div className="pt-3 mt-1 border-t border-white/[0.08] flex flex-col gap-2">
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#A50000] hover:bg-[#C20000] text-white text-sm font-semibold shadow-md shadow-[#A50000]/25 transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.056-1.11-.082-.264-.087-.599-.214-1.04-.407-1.85-.811-3.056-2.69-3.149-2.812-.093-.122-.756-1.006-.756-1.92 0-.913.479-1.362.65-1.547.171-.184.373-.23.498-.23.125 0 .25.002.359.006.115.006.269-.044.421.323.158.38.541 1.32.589 1.417.048.098.081.213.016.34-.065.127-.098.207-.193.318-.095.111-.2.248-.286.333-.095.095-.195.198-.084.389.111.19.493.813 1.058 1.317.728.648 1.341.851 1.532.946.191.095.303.079.414-.048.112-.128.479-.558.607-.749.128-.19.256-.159.43-.095.174.064 1.107.522 1.298.617.191.095.318.143.366.223.048.08.048.461-.096.866zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.662 1.442 5.179L2 22l4.966-1.303A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                  <span>استفسار واتساب فوري</span>
                </a>
                <a
                  href={`tel:${COMPANY.phones[0].dial}`}
                  className="w-full text-center py-2.5 rounded-full border border-white/10 text-[#CCC] text-sm hover:text-white hover:bg-white/5 transition-colors"
                  dir="ltr"
                >
                  اتصال مباشر: {COMPANY.phones[0].display}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
