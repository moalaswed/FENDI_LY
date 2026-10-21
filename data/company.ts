/**
 * بيانات وإعدادات شركة الفاندي للصناعات البلاستيكية
 * FENDI Plastic Industry
 * 
 * جميع بيانات التواصل مستخرجة بدقة من ملصقات وإعلانات الشركة الرسمية داخل مجلد public.
 * يمكن تعديل أي رقم أو رابط من هذا الملف مباشرة دون التأثير على بنية الموقع.
 */

export interface CompanyConfig {
  brandName: {
    ar: string;
    en: string;
    fullAr: string;
    subAr: string;
  };
  phones: {
    display: string;
    dial: string;
  }[];
  // رقم الواتساب الأساسي المستخدم لروابط الاستفسار (بالصيغة الدولية بدون علامة +)
  whatsapp: {
    number: string; // مثال: 218912122417
    display: string;
    isConfigured: boolean;
  };
  emails: string[];
  website: string;
  social: {
    facebook: string;
    instagram?: string;
  };
  location: {
    country: string;
    city: string;
    notes: string;
  };
  businessType: string;
}

export const COMPANY: CompanyConfig = {
  brandName: {
    ar: "الفاندي",
    en: "FENDI Plastic Industry",
    fullAr: "الفاندي للصناعات البلاستيكية",
    subAr: "شركة النجيلة للصناعات البلاستيكية - مصنع الفاندي",
  },
  phones: [
    { display: "092 348 1050", dial: "+218923481050" },
    { display: "091 212 2417", dial: "+218912122417" },
    { display: "091 700 0440", dial: "+218917000440" },
  ],
  whatsapp: {
    number: "218923481050",
    display: "+218 92 348 1050",
    isConfigured: true,
  },
  emails: ["info@fendi.ly"],
  website: "www.fendi.ly",
  social: {
    // الرابط الرسمي المزود من قبل العميل
    facebook: "https://www.facebook.com/share/1MAFy7ijsn/",
  },
  location: {
    country: "ليبيا",
    city: "طرابلس - الكريمية",
    notes: "المقر الرئيسي والمصنع الفعلي متاح لخدمة عملاء الجملة والقطاعي",
  },
  businessType: "تصنيع وتوزيع المنتجات البلاستيكية بالجملة والقطاعي",
};

/**
 * Generates a prefilled WhatsApp inquiry for a product or general sales request.
 */
export function buildWhatsAppUrl(productName?: string, productCode?: string): string {
  if (!COMPANY.whatsapp.isConfigured || !COMPANY.whatsapp.number) {
    return "#contact";
  }

  const baseNumber = COMPANY.whatsapp.number.replace(/[^0-9]/g, "");

  const greeting = "السلام عليكم ورحمة الله وبركاته،";
  const companyName = COMPANY.brandName.subAr;
  const message = productCode
    ? [
        greeting,
        `أرغب في الاستفسار عن المنتج: *${productName}* (رمز الصنف: ${productCode}).`,
        `هل المنتج متوفر؟ أرجو تزويدي بسعره، وأسعار الجملة للكميات، وخيارات الاستلام أو التوصيل.`,
        `الجهة: ${companyName}`,
        "الاسم:",
        "المدينة:",
      ].join("\n")
    : [
        greeting,
        productName || `أرغب في الاستفسار عن منتجات ${companyName} والكتالوج والأسعار.`,
        "أرجو تزويدي بتفاصيل التوفر، وأسعار الجملة للكميات، وخيارات الاستلام أو التوصيل.",
        "الاسم:",
        "المدينة:",
      ].join("\n");

  return `https://wa.me/${baseNumber}?text=${encodeURIComponent(message)}`;
}
