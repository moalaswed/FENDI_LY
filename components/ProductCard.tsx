"use client";

import Image from "next/image";
import type { ProductItem } from "@/types/products";
import { buildWhatsAppUrl } from "@/data/company";

interface ProductCardProps {
  product: ProductItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const whatsappUrl = buildWhatsAppUrl(product.name, product.code);

  return (
    <div className="flex flex-col rounded-2xl bg-[#202020] border border-[#2E2E2E] hover:border-[#520000] overflow-hidden card-hover-effect group h-full">
      {/* Product Image */}
      <div className="relative aspect-square w-full bg-[#181818] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2 pointer-events-none z-10">
          {product.code && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#111111]/90 backdrop-blur-md text-white border border-white/10" dir="ltr">
              {product.code}
            </span>
          )}
          {product.tag && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#A50000] text-white shadow-md">
              {product.tag}
            </span>
          )}
        </div>
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
