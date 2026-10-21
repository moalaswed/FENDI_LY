"use client";

import React, { useState } from "react";
import { COMPANY, buildWhatsAppUrl } from "@/data/company";

interface ContactProductItem {
  id: string;
  name: string;
  code?: string;
}

interface ContactSectionProps {
  products?: ContactProductItem[];
  error?: string | null;
  isLoading?: boolean;
}

export default function ContactSection({
  products = [],
  error = null,
  isLoading = false,
}: ContactSectionProps = {}) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState<"wholesale" | "retail" | "general">("wholesale");
  const [notes, setNotes] = useState("");

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    const orderTypeLabel =
      orderType === "wholesale"
        ? "طلب شراء بالجملة"
        : orderType === "retail"
          ? "استفسار عن الشراء بالقطاعي"
          : "استفسار عام";

    const message = [
      "السلام عليكم ورحمة الله وبركاته،",
      `أتواصل معكم بخصوص ${orderTypeLabel} من ${COMPANY.brandName.subAr}.`,
      `الاسم: ${customerName.trim() || "عميل مهتم"}`,
      selectedProduct ? `المنتج المطلوب: ${selectedProduct}` : "",
      notes.trim() ? `تفاصيل إضافية: ${notes.trim()}` : "",
      "أرجو تزويدي بالسعر والتوفر، وأسعار الكميات إن وجدت، وخيارات الاستلام من المقر أو التوصيل.",
      `المقر: ${COMPANY.location.country} - ${COMPANY.location.city}`,
      "شكراً لكم.",
    ].filter(Boolean).join("\n");

    const baseNumber = COMPANY.whatsapp.number.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${baseNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-[#151515] border-t border-[#242424] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#202020] border border-[#2E2E2E] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#A50000]"></span>
            <span className="text-xs font-semibold text-[#A50000] uppercase tracking-wider">
              قنوات التواصل المباشر
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
            تواصل مع إدارة مبيعات الفاندي
          </h2>
          <p className="text-sm sm:text-base text-[#B8B8B8] leading-relaxed">
            يسعدنا استقبال استفساراتكم وترتيب طلبيات الجملة والقطاعي مباشرة عبر WhatsApp
            أو من خلال زيارة مقر الشركة الفعلي.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Contact Details Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4 text-right">
            {/* WhatsApp Direct Card */}
            <div className="p-6 rounded-2xl bg-[#202020] border border-[#2A2A2A] hover:border-emerald-600/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.056-1.11-.082-.264-.087-.599-.214-1.04-.407-1.85-.811-3.056-2.69-3.149-2.812-.093-.122-.756-1.006-.756-1.92 0-.913.479-1.362.65-1.547.171-.184.373-.23.498-.23.125 0 .25.002.359.006.115.006.269-.044.421.323.158.38.541 1.32.589 1.417.048.098.081.213.016.34-.065.127-.098.207-.193.318-.095.111-.2.248-.286.333-.095.095-.195.198-.084.389.111.19.493.813 1.058 1.317.728.648 1.341.851 1.532.946.191.095.303.079.414-.048.112-.128.479-.558.607-.749.128-.19.256-.159.43-.095.174.064 1.107.522 1.298.617.191.095.318.143.366.223.048.08.048.461-.096.866zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.662 1.442 5.179L2 22l4.966-1.303A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">المراسلة عبر WhatsApp</h4>
                  <p className="text-xs text-[#8E8E8E]">رد سريع على الأسعار والكميات</p>
                </div>
              </div>
              <p className="text-xs text-[#B8B8B8] mb-4 leading-relaxed">
                تواصل مع الفريق عبر الرقم الرسمي المعتمد لطلب الكتالوج والأسعار.
              </p>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-colors"
              >
                <span>فتح محادثة واتساب الآن</span>
                <span dir="ltr">({COMPANY.whatsapp.display})</span>
              </a>
            </div>

            {/* Location & Social Card */}
            <div className="p-6 rounded-2xl bg-[#202020] border border-[#2A2A2A]">
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-[#A50000] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <span className="font-bold text-white block">المقر والمصنع الفعلي:</span>
                    <span className="text-[#B8B8B8]">{COMPANY.location.country} - {COMPANY.location.city} ({COMPANY.brandName.subAr})</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <div>
                    <span className="font-bold text-white block">الصفحة الرسمية على فيسبوك:</span>
                    <a
                      href={COMPANY.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      زيارة صفحة فيسبوك
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Form Assistant (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-[#1B1B1B] border border-[#2A2A2A] p-6 sm:p-8 text-right shadow-2xl">
            <div className="mb-6">
              <span className="text-xs font-bold text-[#A50000] uppercase tracking-wider block mb-1">
                تجهيز رسالة الاستفسار
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                تواصل مباشر مع قسم المبيعات
              </h3>
              <p className="text-xs sm:text-sm text-[#B8B8B8] mt-1">
                املأ الحقول أدناه لتجهيز رسالتك مسبقاً، وسيتم فتح WhatsApp مباشرة لإرسالها لممثل المبيعات.
              </p>
            </div>

            {/* Clear Database Loading Notice when products could not be fetched */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950/30 border border-[#A50000]/40 text-right text-xs text-[#C8C8C8] flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A50000] shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-bold text-white block mb-0.5">تنبيه في قائمة المنتجات:</span>
                  <span>تعذر تحميل قائمة المنتجات من قاعدة البيانات حالياً. يمكنك متابعة طلبك بكتابة اسم المنتج في خانة الملاحظات أدناه، وسيقوم فريق المبيعات بالرد الفوري عبر WhatsApp.</span>
                </div>
              </div>
            )}

            {isLoading && !error && (
              <p role="status" className="mb-5 text-xs text-[#B8B8B8]">
                جارٍ تحميل قائمة المنتجات. يمكنك تجهيز استفسارك وإرساله عبر WhatsApp أثناء ذلك.
              </p>
            )}

            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#CCC] mb-1.5">
                  اسمك الكريم أو اسم الجهة / الشركة:
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: شركة المقاولات الحديثة أو أحمد الفلاني"
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-sm placeholder-[#888888] focus:outline-none focus:border-[#A50000]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CCC] mb-1.5">
                  نوع الاستفسار / الطلب:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType("wholesale")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                      orderType === "wholesale"
                        ? "bg-[#A50000] text-white border-[#A50000]"
                        : "bg-[#202020] text-[#B8B8B8] border-[#2E2E2E] hover:text-white"
                    }`}
                  >
                    طلبية بالجملة
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("retail")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                      orderType === "retail"
                        ? "bg-[#A50000] text-white border-[#A50000]"
                        : "bg-[#202020] text-[#B8B8B8] border-[#2E2E2E] hover:text-white"
                    }`}
                  >
                    شراء قطاعي
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("general")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                      orderType === "general"
                        ? "bg-[#A50000] text-white border-[#A50000]"
                        : "bg-[#202020] text-[#B8B8B8] border-[#2E2E2E] hover:text-white"
                    }`}
                  >
                    استفسار عام
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CCC] mb-1.5">
                  المنتج المطلوب (اختياري):
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  disabled={Boolean(error) || isLoading}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-sm focus:outline-none focus:border-[#A50000] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {isLoading
                      ? "-- جارٍ تحميل قائمة المنتجات --"
                      : error
                      ? "-- تعذر تحميل المنتجات (يرجى كتابة اسم المنتج في الملاحظات) --"
                      : "-- اختر منتجاً من الكتالوج أو اكتبه بالأسفل --"}
                  </option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.name}>
                      {prod.name} {prod.code ? `(${prod.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CCC] mb-1.5">
                  تفاصيل الطلبية والكميات المطلوبة:
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="اكتب الكمية التقريبية، مكان الاستلام، أو أي مواصفات خاصة..."
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-sm placeholder-[#888888] focus:outline-none focus:border-[#A50000]"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#A50000] hover:bg-[#C20000] text-white font-bold text-sm transition-all shadow-lg shadow-[#A50000]/30 hover:shadow-[#A50000]/50 hover:-translate-y-0.5 cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.056-1.11-.082-.264-.087-.599-.214-1.04-.407-1.85-.811-3.056-2.69-3.149-2.812-.093-.122-.756-1.006-.756-1.92 0-.913.479-1.362.65-1.547.171-.184.373-.23.498-.23.125 0 .25.002.359.006.115.006.269-.044.421.323.158.38.541 1.32.589 1.417.048.098.081.213.016.34-.065.127-.098.207-.193.318-.095.111-.2.248-.286.333-.095.095-.195.198-.084.389.111.19.493.813 1.058 1.317.728.648 1.341.851 1.532.946.191.095.303.079.414-.048.112-.128.479-.558.607-.749.128-.19.256-.159.43-.095.174.064 1.107.522 1.298.617.191.095.318.143.366.223.048.08.048.461-.096.866zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.662 1.442 5.179L2 22l4.966-1.303A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                </svg>
                <span>إرسال الرسالة وبدء المحادثة عبر WhatsApp</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
