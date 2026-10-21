"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { ProductItem } from "@/types/products";
import { buildWhatsAppUrl } from "@/data/company";

interface ProductCardProps {
  product: ProductItem;
}

/**
 * Parses known video host platforms (YouTube, Vimeo) into privacy-enhanced embed URLs.
 * Returns null for direct media files (MP4, WebM, etc.).
 */
function getEmbedUrl(url: string): string | null {
  try {
    const trimmed = url.trim();
    // YouTube
    const ytMatch = trimmed.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) {
      return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
    }
    // Vimeo
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    return null;
  } catch {
    return null;
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const whatsappUrl = buildWhatsAppUrl(product.name, product.code);
  const hasVideo = Boolean(product.video && product.video.trim().length > 0);
  const embedUrl = hasVideo ? getEmbedUrl(product.video!) : null;

  return (
    <div className="flex flex-col rounded-2xl bg-[#202020] border border-[#2E2E2E] hover:border-[#520000] overflow-hidden card-hover-effect group h-full">
      {/* Media Container with Consistent Aspect Ratio */}
      <div className="relative aspect-square w-full bg-[#181818] overflow-hidden">
        {hasVideo && isPlayingVideo ? (
          <div className="relative w-full h-full bg-black">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={`فيديو توضيحي لمنتج ${product.name}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={product.video!}
                poster={product.image}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
                aria-label={`فيديو توضيحي لمنتج ${product.name}`}
              >
                <source src={product.video!} type="video/mp4" />
                <source src={product.video!} type="video/webm" />
                متصفحك لا يدعم تشغيل هذا الفيديو.
              </video>
            )}

            {/* Close Video & Return to Image View Button */}
            <button
              type="button"
              onClick={() => setIsPlayingVideo(false)}
              className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-md bg-black/80 hover:bg-[#A50000] text-white text-[11px] font-bold border border-white/20 transition-colors flex items-center gap-1 cursor-pointer shadow-lg"
              aria-label="إغلاق الفيديو والعودة لصورة المنتج"
            >
              <span>✕</span>
              <span>إغلاق الفيديو</span>
            </button>
          </div>
        ) : (
          <>
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Video Play Trigger Button (only when product has a video) */}
            {hasVideo && (
              <button
                type="button"
                onClick={() => setIsPlayingVideo(true)}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/80 hover:bg-[#A50000] text-white flex items-center justify-center backdrop-blur-md border border-white/30 transition-all duration-300 hover:scale-110 shadow-2xl cursor-pointer group/play z-10"
                aria-label={`تشغيل فيديو توضيحي لمنتج ${product.name}`}
                title="اضغط لمشاهدة فيديو توضيحي"
              >
                <svg
                  className="w-6 h-6 fill-current translate-x-[-1px] group-hover/play:scale-110 transition-transform"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}

            {/* Top Badges */}
            <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2 pointer-events-none z-10">
              <div className="flex items-center gap-1.5">
                {product.code ? (
                  <span
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#111111]/90 backdrop-blur-md text-white border border-white/10"
                    dir="ltr"
                  >
                    {product.code}
                  </span>
                ) : (
                  <span />
                )}

                {hasVideo && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#A50000] text-white flex items-center gap-1 shadow-md">
                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>فيديو</span>
                  </span>
                )}
              </div>

              {product.tag && (
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#A50000] text-white shadow-md">
                  {product.tag}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1 justify-between text-right">
        <div>
          {/* Category Label */}
          <div className="text-[11px] font-semibold text-[#8E8E8E] mb-1.5">
            {product.categoryLabel}
          </div>

          {/* Product Title */}
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-red-400 transition-colors mb-2.5 leading-snug">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-[#B8B8B8] leading-relaxed mb-4">
            {product.shortDesc}
          </p>

          {/* Features Bullets */}
          <ul className="space-y-1.5 mb-5 border-t border-[#2A2A2A] pt-3">
            {product.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-[#B8B8B8]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A50000] shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button: Inquire via WhatsApp */}
        <div className="pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#161616] hover:bg-[#A50000] text-white text-xs sm:text-sm font-bold border border-[#2A2A2A] hover:border-[#A50000] transition-all duration-200 shadow-md group/btn"
          >
            <svg
              className="w-4 h-4 text-emerald-400 group-hover/btn:text-white fill-current transition-colors"
              viewBox="0 0 24 24"
            >
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.056-1.11-.082-.264-.087-.599-.214-1.04-.407-1.85-.811-3.056-2.69-3.149-2.812-.093-.122-.756-1.006-.756-1.92 0-.913.479-1.362.65-1.547.171-.184.373-.23.498-.23.125 0 .25.002.359.006.115.006.269-.044.421.323.158.38.541 1.32.589 1.417.048.098.081.213.016.34-.065.127-.098.207-.193.318-.095.111-.2.248-.286.333-.095.095-.195.198-.084.389.111.19.493.813 1.058 1.317.728.648 1.341.851 1.532.946.191.095.303.079.414-.048.112-.128.479-.558.607-.749.128-.19.256-.159.43-.095.174.064 1.107.522 1.298.617.191.095.318.143.366.223.048.08.048.461-.096.866zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.662 1.442 5.179L2 22l4.966-1.303A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
            <span>استفسار عن هذا المنتج</span>
          </a>
        </div>
      </div>
    </div>
  );
}
