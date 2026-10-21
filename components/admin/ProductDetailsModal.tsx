"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductItem } from "@/types/products";
import { buildWhatsAppUrl } from "@/data/company";

interface ProductDetailsModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
}: ProductDetailsModalProps) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  if (!product) return null;

  const whatsappUrl = buildWhatsAppUrl(product.name, product.code);
  const hasVideo = Boolean(product.video && product.video.trim().length > 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#181818] border border-[#2E2E2E] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-right relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 text-[#888888] hover:text-white p-1 rounded-lg hover:bg-[#252525] transition-colors cursor-pointer"
          aria-label="إغلاق نافذة التفاصيل"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#252525]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A50000]" />
          <div>
            <h2 className="text-xl font-bold text-white">تفاصيل المنتج والمواصفات</h2>
            <p className="text-xs text-[#8E8E8E] mt-0.5">
              معاينة المنتج كما يظهر للمستهلك والبيانات الفنية في قاعدة البيانات
            </p>
          </div>
        </div>

        {/* Product Media & Core Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Media Box */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-black border border-[#2E2E2E]">
            {hasVideo && isPlayingVideo ? (
              <div className="relative w-full h-full bg-black">
                <video
                  src={product.video || undefined}
                  poster={product.image}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setIsPlayingVideo(false)}
                  className="absolute top-2 left-2 z-10 px-2 py-1 rounded bg-black/80 hover:bg-[#A50000] text-white text-[10px] font-bold"
                >
                  ✕ إغلاق
                </button>
              </div>
            ) : (
              <>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
                {hasVideo && (
                  <button
                    type="button"
                    onClick={() => setIsPlayingVideo(true)}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/75 hover:bg-[#A50000] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-200 hover:scale-110 shadow-xl cursor-pointer"
                    title="تشغيل الفيديو"
                  >
                    <svg className="w-5 h-5 fill-current translate-x-[-1px]" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                )}
                {product.tag && (
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#A50000] text-white shadow">
                    {product.tag}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Quick Info */}
          <div className="flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-[#8E8E8E] block">اسم المنتج:</span>
                <span className="text-base font-bold text-white block">{product.name}</span>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-[#8E8E8E] block">كود الصنف:</span>
                  <span className="text-white font-mono font-bold" dir="ltr">{product.code}</span>
                </div>
                <div>
                  <span className="text-[#8E8E8E] block">القسم الصناعي:</span>
                  <span className="text-red-400 font-semibold">{product.categoryLabel}</span>
                </div>
              </div>

              <div>
                <span className="text-[#8E8E8E] text-xs block mb-1">حالة الظهور:</span>
                {product.isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>نشط ويظهر بالكتالوج العام</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#262626] text-[#888888] border border-[#333333]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#666666]" />
                    <span>معطل ومخفي عن الزوار</span>
                  </span>
                )}
              </div>

              <div>
                <span className="text-[#8E8E8E] text-xs block mb-1">دعم الفيديو:</span>
                {hasVideo ? (
                  <span className="text-xs text-emerald-400 font-medium break-all">
                    مدعوم ({product.video})
                  </span>
                ) : (
                  <span className="text-xs text-[#777777]">غير متاح (صورة فقط)</span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#252525] mt-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#202020] hover:bg-[#282828] text-emerald-400 hover:text-white text-xs font-bold border border-[#2E2E2E] transition-colors"
              >
                <span>معاينة رسالة WhatsApp للاستفسار</span>
              </a>
            </div>
          </div>
        </div>

        {/* Short Description */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-[#8E8E8E] mb-1.5">الوصف المختصر:</h4>
          <p className="text-sm text-[#D1D1D1] leading-relaxed bg-[#202020] p-3.5 rounded-xl border border-[#2A2A2A]">
            {product.shortDesc}
          </p>
        </div>

        {/* Features List */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-[#8E8E8E] mb-2">المواصفات والميزات الفنية:</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {product.features.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 p-2 rounded-lg bg-[#202020] border border-[#2A2A2A] text-xs text-[#B8B8B8]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#A50000] shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Admin Metadata Box */}
        <div className="bg-[#141414] border border-[#242424] rounded-xl p-3.5 text-xs text-[#777777] mb-6 space-y-1 font-mono">
          <div className="flex justify-between">
            <span>Product ID:</span>
            <span className="text-[#AAAAAA]">{product.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Sort Order:</span>
            <span className="text-[#AAAAAA]">{product.sortOrder ?? 0}</span>
          </div>
          {product.updatedAt && (
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span className="text-[#AAAAAA]">{product.updatedAt}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#252525]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-white text-xs font-semibold border border-[#333333] transition-colors cursor-pointer"
          >
            إغلاق
          </button>
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="px-5 py-2 rounded-xl bg-[#A50000] hover:bg-[#C20000] text-white text-xs font-bold transition-colors shadow-md shadow-[#A50000]/30"
          >
            تعديل بيانات المنتج
          </Link>
        </div>
      </div>
    </div>
  );
}
