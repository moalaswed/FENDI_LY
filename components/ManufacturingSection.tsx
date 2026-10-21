import React from "react";
import Image from "next/image";
import { COMPANY, buildWhatsAppUrl } from "@/data/company";

export default function ManufacturingSection() {
  const pillars = [
    {
      num: "01",
      title: "خامات بولي إيثيلين نقية 100%",
      desc: "نستخدم حبيبات البلاستيك الخام البكر غير المعاد تدويره لتصنيع مواسير القرجوطة والبراميل، مما يمنحها قوة تحمل استثنائية ضد الصدمات، التشققات، وأشعة الشمس.",
    },
    {
      num: "02",
      title: "أطوال ومقاييس قياسية في ليبيا",
      desc: "أول مصنع ليبي يطرح لفات مواسير القرجوطة بطول 50 متراً كاملاً، بالإضافة إلى توفير تشكيلة أقطار شاملة (19، 23، 26، 32، 40، 50 ملم) لتغطية كافة المخططات الهندسية.",
    },
    {
      num: "03",
      title: "مرونة المبيعات (جملة وقطاعي)",
      desc: "نلبي احتياجات الموردين وأصحاب محلات مواد البناء والكهرباء والشركات الإنشائية، كما نرحب بالزبائن الأفراد للشراء المباشر بأسعار المصنع المنافسة.",
    },
    {
      num: "04",
      title: "تواصل مباشر وشحن لكافة المدن",
      desc: "قنوات تواصل سريعة ومباشرة عبر WhatsApp والهاتف مع إدارة المبيعات لترتيب الكميات، عروض الأسعار، وتجهيز الطلبيات بدقة وسرعة.",
    },
  ];

  return (
    <section id="manufacturing" className="py-20 md:py-32 bg-[#1B1B1B] bg-gradient-to-b from-[#181818] via-[#1B1B1B] to-[#181818] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-right max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#202020] border border-[#2E2E2E] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#A50000]"></span>
            <span className="text-xs font-semibold text-[#A50000] uppercase tracking-wider">
              الصناعة والجودة
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
            مقومات الجودة في مصنع الفاندي للبلاستيك
          </h2>
          <p className="text-base sm:text-lg text-[#B8B8B8] leading-relaxed">
            نكرس إمكانياتنا التصنيعية لتقديم منتج وطني ينافس المنتجات المستوردة من حيث القوة والأمان والاعتمادية.
          </p>
        </div>

        {/* Big Highlight Showcase */}
        <div className="rounded-3xl bg-[#151515] border border-[#262626] overflow-hidden mb-16 p-6 sm:p-10 lg:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 flex flex-col justify-center text-right">
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">
                ابتكار وطني وتطوير مستمر
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-5 leading-snug">
                {COMPANY.brandName.subAr}
              </h3>
              <p className="text-sm sm:text-base text-[#B8B8B8] leading-relaxed mb-6">
                انطلاقاً من موقع مصنعنا بمنطقة النجيلة، نسعى لتطوير المنتجات البلاستيكية التي تحل مشكلات عملية
                للمهندسين والفنيين، مثل علب التكييف المدفونة التي تحمي التوصيلات الكهربائية وأنابيب التبريد
                على الأسطح من حرارة الشمس والعوامل الجوية.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href={buildWhatsAppUrl("أرغب في طلب عرض سعر لتوريد مشروع أو طلبية مصنع")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#A50000] hover:bg-[#C20000] text-white font-bold text-sm transition-all shadow-lg shadow-[#A50000]/25"
                >
                  <span>طلب تسعيرة وتوريد مشاريع</span>
                  <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#2E2E2E] bg-[#181818]">
                <Image
                  src="/photo_40_2026-10-20_20-13-24.jpg"
                  alt="شركة النجيلة للصناعات البلاستيكية مصنع الفاندي"
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#202020] border border-[#2A2A2A] hover:border-[#520000] transition-colors card-hover-effect flex flex-col justify-between text-right"
            >
              <div>
                <span className="text-3xl font-black text-[#A50000] block mb-3 font-mono">
                  {pillar.num}
                </span>
                <h4 className="text-base font-bold text-white mb-2 leading-snug">
                  {pillar.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#B8B8B8] leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
