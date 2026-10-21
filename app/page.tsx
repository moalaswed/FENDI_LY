import { Suspense } from "react";
import { io } from "next/cache";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BrandStrip from "@/components/BrandStrip";
import AboutSection from "@/components/AboutSection";
import ProductsPreview from "@/components/ProductsPreview";
import ManufacturingSection from "@/components/ManufacturingSection";
import ContactSection from "@/components/ContactSection";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import { getProducts } from "@/lib/products";

async function LiveContactSection() {
  await io();
  const { products, error } = await getProducts();
  return <ContactSection products={products} error={error} />;
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#111111] text-[#B8B8B8] selection:bg-[#A50000] selection:text-white">
      {/* Header / Navbar */}
      <Header />

      <main className="flex-1">
        {/* 1. Hero Section - striking industrial first impression */}
        <HeroSection />

        {/* 2. Capabilities & Brand Values Strip */}
        <BrandStrip />

        {/* 3. About Company & Local Industry Story (Cluster-inspired alternating layout) */}
        <AboutSection />

        {/* 4. Products Preview & Direct Navigation to /products */}
        <ProductsPreview />

        {/* 5. Manufacturing Excellence & Pure Raw Material */}
        <ManufacturingSection />

        {/* 6. Direct Contact & Quick WhatsApp Inquiry Message Builder */}
        <Suspense fallback={<ContactSection isLoading />}>
          <LiveContactSection />
        </Suspense>

        {/* 7. Final High-Impact CTA */}
        <FinalCta />
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
