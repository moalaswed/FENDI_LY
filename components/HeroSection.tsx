import React from "react";
import Link from "next/link";
import { buildWhatsAppUrl } from "@/data/company";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[640px] lg:min-h-[720px] pt-36 pb-24 md:pt-44 md:pb-32 lg:pt-48 lg:pb-36 overflow-hidden bg-[#111111] bg-gradient-to-b from-[#0E0E0E] via-[#121212] to-[#111111] flex items-center"
    >
      {/* 1. Elegant Flowing Red Wave Gradients on the Left */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Intense Volumetric Ambient Red Glow at Bottom-Left corner */}
        <div
          className="absolute -bottom-16 -left-16 w-[750px] h-[600px] rounded-full blur-[110px] opacity-70 sm:opacity-85"
          style={{
            background:
              "radial-gradient(circle at 15% 85%, #A50000 0%, #700000 35%, #3B0000 60%, rgba(17,17,17,0) 80%)",
          }}
        />
        {/* Mid-Left Ambient Red Glow along the wave trajectory */}
        <div
          className="absolute top-1/4 -left-20 w-[500px] h-[420px] rounded-full blur-[90px] opacity-35 sm:opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at center, #950000 0%, #520000 45%, rgba(17,17,17,0) 75%)",
          }}
        />

        {/* SVG Flowing Curved Waves with Luminous Glowing Edges */}
        <svg
          className="absolute inset-y-0 left-0 w-full sm:w-[75%] lg:w-[65%] h-full pointer-events-none opacity-45 sm:opacity-100"
          viewBox="0 0 950 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Silk Wave 1 Gradient (Upper Wave Body Fill) */}
            <linearGradient id="silkWaveGradient" x1="0%" y1="20%" x2="70%" y2="85%">
              <stop offset="0%" stopColor="#A50000" stopOpacity="0.4" />
              <stop offset="25%" stopColor="#750000" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#3A0000" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#111111" stopOpacity="0" />
            </linearGradient>

            {/* Lower Wave 2 Gradient (Lower Wave Body Fill) */}
            <linearGradient id="lowerWaveGradient" x1="0%" y1="40%" x2="60%" y2="90%">
              <stop offset="0%" stopColor="#B80000" stopOpacity="0.32" />
              <stop offset="35%" stopColor="#550000" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#111111" stopOpacity="0" />
            </linearGradient>

            {/* Glowing Edge 1 (Primary Wave Luminous Edge) */}
            <linearGradient id="mainEdgeGrad" x1="0%" y1="20%" x2="85%" y2="95%">
              <stop offset="0%" stopColor="#FF3838" stopOpacity="0.95" />
              <stop offset="20%" stopColor="#E60000" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#B30000" stopOpacity="0.85" />
              <stop offset="80%" stopColor="#7A0000" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#330000" stopOpacity="0" />
            </linearGradient>

            {/* Glowing Edge 2 (Secondary Wave Luminous Edge) */}
            <linearGradient id="secondEdgeGrad" x1="0%" y1="45%" x2="75%" y2="95%">
              <stop offset="0%" stopColor="#FF4A4A" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#CC0000" stopOpacity="0.75" />
              <stop offset="65%" stopColor="#800000" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#300000" stopOpacity="0" />
            </linearGradient>

            {/* Core Intense Neon Glow Filter */}
            <filter id="intenseGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur1" />
              <feGaussianBlur stdDeviation="10" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Diffuse Ambient Aura Glow */}
            <filter id="softRibbonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="20" result="bigBlur" />
              <feMerge>
                <feMergeNode in="bigBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Primary Wave Body Shading */}
          <path
            d="M -30,210 C 170,290 320,490 680,680 L 680,750 L -30,750 Z"
            fill="url(#silkWaveGradient)"
          />

          {/* Secondary Wave Body Shading */}
          <path
            d="M -30,390 C 130,460 250,580 520,720 L 520,750 L -30,750 Z"
            fill="url(#lowerWaveGradient)"
          />

          {/* Primary Wave Luminous Ambient Halo */}
          <path
            d="M -30,210 C 170,290 320,490 680,680"
            stroke="#FF1A1A"
            strokeWidth="14"
            strokeOpacity="0.35"
            filter="url(#softRibbonGlow)"
            fill="none"
          />

          {/* Primary Wave Luminous Core Line */}
          <path
            d="M -30,210 C 170,290 320,490 680,680"
            stroke="url(#mainEdgeGrad)"
            strokeWidth="3.6"
            strokeLinecap="round"
            filter="url(#intenseGlow)"
            fill="none"
          />

          {/* Secondary Wave Luminous Ambient Halo */}
          <path
            d="M -30,390 C 130,460 250,580 520,720"
            stroke="#FF2424"
            strokeWidth="9"
            strokeOpacity="0.25"
            filter="url(#softRibbonGlow)"
            fill="none"
          />

          {/* Secondary Wave Luminous Core Line */}
          <path
            d="M -30,390 C 130,460 250,580 520,720"
            stroke="url(#secondEdgeGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#intenseGlow)"
            fill="none"
          />

          {/* Third Delicate Ripple Stroke near the bottom */}
          <path
            d="M -30,510 C 90,560 210,650 410,720"
            stroke="#A50000"
            strokeWidth="2.2"
            strokeOpacity="0.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* 2. Hero Content Container (Positioned on the Right in RTL) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-end text-right ml-auto max-w-2xl lg:max-w-3xl">
          {/* Small Pill-shaped Label with Red Dot on the Far Right */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#181818]/90 border border-[#2E2E2E] mb-6 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A50000] shrink-0"></span>
            <span className="text-xs sm:text-sm font-medium text-white/95">
              صناعة وطنية ليبية مميزة
            </span>
          </div>

          {/* Large Bold White Headline with Selected Words in Red */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[66px] font-black text-white tracking-tight leading-[1.25] sm:leading-[1.2] mb-6">
            <span className="block">
              رائدة في تصنيع{" "}
              <span className="text-[#A50000] inline-block font-black">
                البلاستيك
              </span>
            </span>
            <span className="block mt-1 sm:mt-2">
              بأعلى مقاييس الجودة
            </span>
          </h1>

          {/* Short Gray Subtitle */}
          <p className="text-base sm:text-lg text-[#8E8E8E] font-normal mb-10 tracking-wide">
            خامات نقية .. جودة عالية .. لحلول أفضل
          </p>

          {/* Only Two CTA Buttons (Rounded Pills) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* Primary Red Button: استكشف منتجاتنا (Arrow on left pointing left) */}
            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-[#A50000] hover:bg-[#C20000] text-white font-bold text-base transition-all duration-200 shadow-xl shadow-[#A50000]/30 hover:shadow-[#A50000]/50 hover:-translate-y-0.5"
            >
              <span>استكشف منتجاتنا</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>

            {/* Secondary Dark Outlined Button: استفسار عبر WhatsApp (WhatsApp icon on right) */}
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-full bg-[#141414]/90 hover:bg-[#1E1E1E] text-white border border-[#2E2E2E] hover:border-[#520000] font-semibold text-base transition-all duration-200 shadow-sm"
            >
              <span className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.056-1.11-.082-.264-.087-.599-.214-1.04-.407-1.85-.811-3.056-2.69-3.149-2.812-.093-.122-.756-1.006-.756-1.92 0-.913.479-1.362.65-1.547.171-.184.373-.23.498-.23.125 0 .25.002.359.006.115.006.269-.044.421.323.158.38.541 1.32.589 1.417.048.098.081.213.016.34-.065.127-.098.207-.193.318-.095.111-.2.248-.286.333-.095.095-.195.198-.084.389.111.19.493.813 1.058 1.317.728.648 1.341.851 1.532.946.191.095.303.079.414-.048.112-.128.479-.558.607-.749.128-.19.256-.159.43-.095.174.064 1.107.522 1.298.617.191.095.318.143.366.223.048.08.048.461-.096.866zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.662 1.442 5.179L2 22l4.966-1.303A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                </svg>
              </span>
              <span>استفسار عبر WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
