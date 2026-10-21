import React from "react";

export default function BrandStrip() {
  const capabilities = [
    { title: "التأسيسات والكهرباء", subtitle: "مواسير مرنة قرجوطة ومجمعات كهربائية" },
    { title: "الحاويات والبراميل", subtitle: "سعات 10L و 20L و 55L محكمة الإغلاق" },
    { title: "البيوت المحمية والزراعة", subtitle: "رولات نايلون زراعي وأحواض مشاتل" },
    { title: "الأدوات والتنظيم", subtitle: "حافظات طعام وسلات وصناديق تخزين" },
    { title: "توريد الجملة والقطاعي", subtitle: "مبيعات مباشرة للمحلات والمشاريع" },
  ];

  return (
    <div className="border-y border-[#242424] bg-[#151515] py-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-right">
          {capabilities.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col border-r border-[#262626] pr-4 last:border-r-0 hover:border-[#A50000] transition-colors group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A50000] group-hover:scale-150 transition-transform"></span>
                <span className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                  {item.title}
                </span>
              </div>
              <span className="text-xs text-[#B8B8B8] leading-relaxed">
                {item.subtitle}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
