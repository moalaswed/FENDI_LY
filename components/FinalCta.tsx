import React from "react";
import Image from "next/image";
import { COMPANY, buildWhatsAppUrl } from "@/data/company";

export default function FinalCta() {
  return (
    <section className="py-20 md:py-28 bg-[#111111] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#380000] via-[#220000] to-[#151515] border border-[#A50000]/40 p-8 sm:p-12 lg:p-16 shadow-2xl">
          {/* Subtle Grid Accent */}
          <div className="absolute top-0 right-0 w-full h-full bg-industrial-grid opacity-10 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Text & Action */}
            <div className="lg:col-span-7 text-right">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs font-bold text-white mb-6">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                مستعدون لتلبية كافة طلبياتكم
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
                هل تبحث عن توريد مباشر وموثوق لمنتجات البلاستيك؟
              </h2>

              <p className="text-base sm:text-lg text-[#B8B8B8] leading-relaxed max-w-xl mb-8">
                سواء كنت صاحب مشروع إنشائي، مزرعة، محلاً تجارياً، أو مشترياً قطاعياً؛ إدارة مبيعات
                الفاندي جاهزة لتقديم أفضل عروض الأسعار والتجهيز الفوري.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <a
                  href={buildWhatsAppUrl("أرغب في معرفة أسعار الجملة والكميات المتاحة")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#A50000] hover:bg-[#C20000] text-white font-bold text-base transition-all duration-200 shadow-xl shadow-[#A50000]/30 hover:shadow-[#A50000]/50 hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.056-1.11-.082-.264-.087-.599-.214-1.04-.407-1.85-.811-3.056-2.69-3.149-2.812-.093-.122-.756-1.006-.756-1.92 0-.913.479-1.362.65-1.547.171-.184.373-.23.498-.23.125 0 .25.002.359.006.115.006.269-.044.421.323.158.38.541 1.32.589 1.417.048.098.081.213.016.34-.065.127-.098.207-.193.318-.095.111-.2.248-.286.333-.095.095-.195.198-.084.389.111.19.493.813 1.058 1.317.728.648 1.341.851 1.532.946.191.095.303.079.414-.048.112-.128.479-.558.607-.749.128-.19.256-.159.43-.095.174.064 1.107.522 1.298.617.191.095.318.143.366.223.048.08.048.461-.096.866zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.662 1.442 5.179L2 22l4.966-1.303A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                  <span>تواصل عبر WhatsApp الآن</span>
                </a>

                <a
                  href={`tel:${COMPANY.phones[0].dial}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#202020] hover:bg-[#282828] text-white font-bold text-base border border-white/15 transition-all duration-200"
                  dir="ltr"
                >
                  <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{COMPANY.phones[0].display}</span>
                </a>
              </div>
            </div>

            {/* Visual Feature: Real Campaign Photo */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 bg-black/40 shadow-2xl">
                <Image
                  src="/photo_31_2026-10-20_20-13-23.jpg"
                  alt="مستلزمات الفاندي البلاستيكية للمشاريع"
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
