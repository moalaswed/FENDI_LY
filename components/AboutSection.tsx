import React from "react";
import Image from "next/image";
import Link from "next/link";
import { COMPANY } from "@/data/company";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-32 bg-[#1B1B1B] bg-gradient-to-b from-[#181818] via-[#1B1B1B] to-[#181818] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-20 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#202020] border border-[#2E2E2E] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#A50000]"></span>
            <span className="text-xs font-semibold text-[#A50000] uppercase tracking-wider">
              عن الشركة والمصنع
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
            صناعة وطنية ليبية رصينة تواكب احتياجات البناء والإنتاج
          </h2>
          <p className="text-base sm:text-lg text-[#B8B8B8] leading-relaxed">
            تأسست شركة <strong className="text-white">{COMPANY.brandName.fullAr}</strong> لتكون ركيزة
            أساسية في رفد السوق الليبي بأجود المنتجات البلاستيكية الهندسية والمنزلية والزراعية.
            نعمل من خلال مصنعنا الفعلي لخدمة التجار والمقاولين والمواطنين مباشرة.
          </p>
        </div>

        {/* Feature Block 1: Alternating Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-20 md:mb-28">
          {/* Text Area */}
          <div className="lg:col-span-6 flex flex-col justify-center text-right">
            <div className="text-xs font-bold text-red-500 mb-2">تأسيسات كهربائية آمنة</div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-snug">
              حلول التمديدات الكهربائية المقاومة للضغط والظروف البيئية
            </h3>
            <p className="text-sm sm:text-base text-[#B8B8B8] leading-relaxed mb-6">
              نُعد من أوائل المصانع في ليبيا التي تقدم مواسير كهربائية مرنة (قرجوطة) بأطوال تصل إلى 50 متر
              متواصلة، مصنعة من مواد بولي إيثيلين خام درجة أولى ممتاز لضمان سلاسة سحب الأسلاك ومقاومة
              الكسر أثناء الصب الخرساني أو التمديد تحت الأرضيات.
            </p>

            {/* Checklist */}
            <div className="space-y-3 mb-8">
              {[
                "بولي إيثيلين نقي 100% بدون شوائب لضمان العزل الكهربائي التام.",
                "أقطار متعددة متوافقة مع كافة المعايير الهندسية (19 مم إلى 50 مم).",
                "مجمعات كهربائية جدارية وعلب سقف دائرية متينة مع أغطية الحماية.",
              ].map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#520000]/30 border border-[#A50000]/60 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-[#A50000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#B8B8B8]">{point}</span>
                </div>
              ))}
            </div>

            <div>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-red-400 group transition-colors"
              >
                <span>استعراض منتجات التأسيسات الكهربائية</span>
                <svg className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Image Area */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#2E2E2E] bg-[#202020] group shadow-2xl">
              <div className="aspect-[4/3] relative w-full overflow-hidden">
                <Image
                  src="/photo_28_2026-10-20_20-13-23.jpg"
                  alt="تمديدات كهربائية احترافية بمواسير فاندي"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4 bg-[#151515] border-t border-[#262626] flex items-center justify-between">
                <span className="text-xs font-semibold text-white">وصل الكهرباء بدون أي مشاكل</span>
                <span className="text-xs text-[#B8B8B8]">قرجوطة الفاندي المعتمدة للمباني</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Block 2: Alternating Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Image Area */}
          <div className="lg:col-span-6 order-2 lg:order-1 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#2E2E2E] bg-[#202020] group shadow-2xl">
              <div className="aspect-[4/3] relative w-full overflow-hidden">
                <Image
                  src="/electrical-junction-boxes-product.png"
                  alt="مجمعات كهربائية متعددة الأقسام من موديلات F0003 إلى F0008"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4 bg-[#151515] border-t border-[#262626] flex items-center justify-between">
                <span className="text-xs font-semibold text-white">مجمعات كهربائية متعددة الأقسام</span>
                <span className="text-xs text-[#B8B8B8]">موديلات F0003–F0008</span>
              </div>
            </div>
          </div>

          {/* Text Area */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col justify-center text-right">
            <div className="text-xs font-bold text-red-500 mb-2">تأسيسات كهربائية عملية</div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-snug">
              مجمعات كهربائية متعددة الأقسام بمقاسات متنوعة
            </h3>
            <p className="text-sm sm:text-base text-[#B8B8B8] leading-relaxed mb-6">
              توفر مجموعة المجمعات الكهربائية موديلات متعددة من F0003 إلى F0008 لتناسب احتياجات التمديدات
              المختلفة. تُصنع من مادة ABS للمساعدة على مقاومة الكسر، وتتوفر باللونين الأزرق والبرتقالي.
            </p>

            {/* Feature Points */}
            <div className="space-y-3 mb-8">
              {[
                "خمسة موديلات متدرجة: F0003 وF0005 وF0006 وF0007 وF0008.",
                "مصنوعة من مادة ABS للمساعدة على مقاومة الكسر.",
                "مصممة لتوفير العزل الكهربائي، ومتوفرة بالأزرق والبرتقالي.",
              ].map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#520000]/30 border border-[#A50000]/60 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-[#A50000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#B8B8B8]">{point}</span>
                </div>
              ))}
            </div>

            <div>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-red-400 group transition-colors"
              >
                <span>استعراض المجمعات الكهربائية</span>
                <svg className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
